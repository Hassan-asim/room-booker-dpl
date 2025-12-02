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

export default router;
