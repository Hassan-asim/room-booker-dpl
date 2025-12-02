import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";

const router = express.Router();

// JWT Middleware
const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET || "secret", { expiresIn: "8h" });
        res.json({ token, email });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Admin Rooms CRUD
router.post("/rooms", authMiddleware, async (req, res) => {
    try {
        const { name, color, capacity, slotDurationMinutes, availableFrom, availableTo } = req.body;

        if (!name || !color || !capacity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const room = await prisma.room.create({
            data: {
                name,
                color,
                capacity: parseInt(capacity),
                slotDurationMinutes: slotDurationMinutes || 30,
                availableFrom: availableFrom || 480,
                availableTo: availableTo || 1200
            }
        });
        res.json(room);
    } catch (error) {
        console.error("Room creation error:", error);
        res.status(500).json({ error: "Failed to create room" });
    }
});

router.get("/rooms", async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        });
        res.json(rooms);
    } catch (error) {
        console.error("Fetch rooms error:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
});

router.put("/rooms/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, capacity, slotDurationMinutes, availableFrom, availableTo } = req.body;

        const room = await prisma.room.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(color && { color }),
                ...(capacity && { capacity: parseInt(capacity) }),
                ...(slotDurationMinutes && { slotDurationMinutes }),
                ...(availableFrom && { availableFrom }),
                ...(availableTo && { availableTo })
            }
        });
        res.json(room);
    } catch (error) {
        console.error("Room update error:", error);
        res.status(500).json({ error: "Failed to update room" });
    }
});

router.delete("/rooms/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Check for future bookings
        const futureBookings = await prisma.userBooking.count({
            where: {
                roomId: id,
                startAt: { gt: new Date() },
                status: { notIn: ["CANCELLED", "ENDED"] }
            }
        });

        if (futureBookings > 0) {
            return res.status(400).json({ error: "Cannot delete room with future bookings" });
        }

        await prisma.room.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error("Room deletion error:", error);
        res.status(500).json({ error: "Failed to delete room" });
    }
});

export default router;
