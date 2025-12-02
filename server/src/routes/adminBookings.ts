import express from "express";
import { prisma } from "../prismaClient";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { from, to, roomId } = req.query;

        const whereClause: any = {};

        if (from) {
            whereClause.startAt = { gte: new Date(from as string) };
        }
        if (to) {
            whereClause.endAt = { lte: new Date(to as string) };
        }
        if (roomId) {
            whereClause.roomId = roomId as string;
        }

        const bookings = await prisma.userBooking.findMany({
            where: whereClause,
            include: { room: true },
            orderBy: { startAt: 'asc' }
        });

        res.json(bookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

router.put("/:id/end", async (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date();

        const updated = await prisma.userBooking.update({
            where: { id },
            data: { endAt: now, status: "ENDED" }
        });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit("booking.ended", updated);
        }

        res.json(updated);
    } catch (error) {
        console.error("End meeting error:", error);
        res.status(500).json({ error: "Failed to end meeting" });
    }
});

export default router;
