import express from "express";
import { prisma } from "../prismaClient";
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, workEmail, phone, title, roomId, startAt, endAt, numAttendees } = req.body;

        // Validation
        if (!name || !workEmail || !phone || !title || !roomId || !startAt || !endAt || !numAttendees) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) return res.status(400).json({ error: "Room not found" });
        if (numAttendees > room.capacity) return res.status(400).json({ error: "Capacity exceeded" });

        const start = new Date(startAt);
        const end = new Date(endAt);

        if (start >= end) {
            return res.status(400).json({ error: "End time must be after start time" });
        }

        // Calculate slots
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const slots = Math.ceil(durationMinutes / room.slotDurationMinutes);

        // Prevent overlaps
        const overlapping = await prisma.userBooking.findFirst({
            where: {
                roomId,
                AND: [
                    { startAt: { lt: end } },
                    { endAt: { gt: start } }
                ],
                NOT: { status: "CANCELLED" }
            }
        });

        if (overlapping) {
            return res.status(409).json({ error: "Time slot not available" });
        }

        const booking = await prisma.userBooking.create({
            data: {
                name,
                workEmail,
                phone,
                title,
                roomId,
                startAt: start,
                endAt: end,
                numAttendees,
                slots,
                status: "CONFIRMED"
            }
        });

        // Emit via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit("booking.created", booking);
        }

        res.json(booking);
    } catch (error) {
        console.error("Booking creation error:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
});

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
        const booking = await prisma.userBooking.update({
            where: { id },
            data: {
                status: "ENDED",
                endAt: new Date()
            }
        });

        // Emit via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit("booking.ended", booking);
        }

        res.json(booking);
    } catch (error) {
        console.error("End booking error:", error);
        res.status(500).json({ error: "Failed to end booking" });
    }
});

router.put("/:id/extend", async (req, res) => {
    try {
        const { id } = req.params;
        const { duration } = req.body; // duration in minutes

        if (!duration || typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ error: "Invalid extension duration" });
        }

        const existingBooking = await prisma.userBooking.findUnique({ where: { id } });

        if (!existingBooking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (existingBooking.status !== "IN_PROGRESS") {
            return res.status(400).json({ error: "Only in-progress meetings can be extended" });
        }

        const room = await prisma.room.findUnique({ where: { id: existingBooking.roomId } });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        const currentEnd = existingBooking.endAt;
        const newEnd = new Date(currentEnd.getTime() + duration * 60 * 1000);

        // Check if newEnd exceeds room's availableTo time
        const newEndMinutes = newEnd.getHours() * 60 + newEnd.getMinutes();
        if (newEndMinutes > room.availableTo) {
            return res.status(400).json({ error: "Extension would exceed room's operational hours" });
        }
        
        // Check for overlaps with other bookings (excluding itself)
        const overlapping = await prisma.userBooking.findFirst({
            where: {
                roomId: existingBooking.roomId,
                id: { not: existingBooking.id },
                AND: [
                    { startAt: { lt: newEnd } },
                    { endAt: { gt: currentEnd } } // Check only from current end to new end
                ],
                NOT: { status: "CANCELLED" }
            }
        });

        if (overlapping) {
            return res.status(409).json({ error: "Cannot extend: overlaps with another booking" });
        }

        const updatedBooking = await prisma.userBooking.update({
            where: { id },
            data: {
                endAt: newEnd,
                slots: Math.ceil((newEnd.getTime() - existingBooking.startAt.getTime()) / (1000 * 60) / room.slotDurationMinutes)
            }
        });

        // Emit via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit("booking.extended", updatedBooking);
        }

        res.json(updatedBooking);
    } catch (error) {
        console.error("Extend booking error:", error);
        res.status(500).json({ error: "Failed to extend booking" });
    }
});

router.get("/email/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const bookings = await prisma.userBooking.findMany({
            where: { workEmail: email },
            include: { room: true },
            orderBy: { startAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        console.error("Fetch bookings by email error:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

export default router;
