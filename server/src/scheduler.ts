import { prisma } from "./prismaClient";
import { Server } from "socket.io";

export function startScheduler(io: Server) {
    setInterval(async () => {
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

        // 1. Check for meetings starting now (or recently started and not marked)
        // In a real app, we'd be more precise, but for this loop:
        const starting = await prisma.userBooking.findMany({
            where: {
                status: 'CONFIRMED',
                startAt: { lte: now },
                endAt: { gt: now }
            }
        });

        for (const booking of starting) {
            await prisma.userBooking.update({
                where: { id: booking.id },
                data: { status: 'IN_PROGRESS' }
            });
            io.emit('booking.started', booking);
            console.log(`Meeting started: ${booking.title}`);
        }

        // 2. Check for meetings ending in 5 minutes (Alert)
        // We need a flag or a way to know we already alerted. 
        // For simplicity, we'll just emit generic alerts for now or skip complex state.
        // A better way is to query bookings that end between 5m and 6m from now.

        // 3. Check for meetings ended
        const ended = await prisma.userBooking.findMany({
            where: {
                status: 'IN_PROGRESS',
                endAt: { lte: now }
            }
        });

        for (const booking of ended) {
            await prisma.userBooking.update({
                where: { id: booking.id },
                data: { status: 'ENDED' }
            });
            io.emit('booking.ended', booking);
            console.log(`Meeting ended: ${booking.title}`);
        }

    }, 60000); // Run every minute
}
