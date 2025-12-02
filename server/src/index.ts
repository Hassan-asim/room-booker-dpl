import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { attachSocket } from "./socket";
import { startScheduler } from "./scheduler";
import adminRoutes from "./routes/admin";
import bookingRoutes from "./routes/bookings";
import adminBookingRoutes from "./routes/adminBookings";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = attachSocket(server);
app.set("io", io);
startScheduler(io);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
