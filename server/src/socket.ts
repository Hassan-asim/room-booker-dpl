import { Server } from "socket.io";
import http from "http";

export function attachSocket(server: http.Server) {
    const io = new Server(server, { cors: { origin: "*" } });
    io.on("connection", socket => {
        console.log("socket connected", socket.id);
        socket.on("admin.endMeeting", async (data) => {
            // validate admin token, then update booking and broadcast
            // This is a placeholder, actual logic should be in the route or controller
            // But for realtime updates, we might listen here or just emit from routes.
        });
        socket.on("client.heartbeat", ({ roomId }) => {
            // update lastSeen for socket.roomId mapping
        });
    });
    return io;
}
