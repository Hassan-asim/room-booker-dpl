import React, { useState, useEffect } from 'react';
import { Card, Tag } from 'antd';
import dayjs from 'dayjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

interface Room {
  id: string;
  name: string;
  capacity: number;
  color: string;
  slotDurationMinutes: number;
  availableFrom: number;
  availableTo: number;
}

interface Booking {
  id: string;
  title: string;
  name: string;
  workEmail: string;
  phone: string;
  startAt: string;
  endAt: string;
  roomId: string;
  status: string;
  numAttendees: number;
  room?: Room;
}

const RoomStatusOverlay = ({ onClick }: { onClick: () => void }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const roomsRes = await fetch(`${API_BASE_URL}/api/admin/rooms`);
        const roomsData = await roomsRes.json();
        setRooms(roomsData);

        const from = dayjs().subtract(1, 'day').toISOString(); // Fetch for a day around current
        const to = dayjs().add(1, 'day').toISOString();
        const bookingsRes = await fetch(`${API_BASE_URL}/api/bookings?from=${from}&to=${to}`);
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      } catch (error) {
        console.error("Failed to fetch data for overlay:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh data every minute
    return () => clearInterval(interval);
  }, []);

  const getRoomStatus = (room: Room) => {
    const now = dayjs();
    const roomBookings = bookings
      .filter(b => b.roomId === room.id && b.status !== 'CANCELLED')
      .sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());

    const currentBooking = roomBookings.find(b => now.isAfter(dayjs(b.startAt)) && now.isBefore(dayjs(b.endAt)));
    const nextBooking = roomBookings.find(b => now.isBefore(dayjs(b.startAt)));

    return { currentBooking, nextBooking };
  };

  if (loading) {
    return (
      <div onClick={onClick} className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center text-white text-2xl animate-fade-in z-50 cursor-pointer">
        Loading Room Status...
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center text-white p-8 animate-fade-in z-50 cursor-pointer"
    >
      <h1 className="text-4xl font-bold mb-10">Meeting Room Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-6xl">
        {rooms.map(room => {
          const { currentBooking, nextBooking } = getRoomStatus(room);
          const isBusy = !!currentBooking;

          return (
            <Card
              key={room.id}
              className="glass p-6 text-center"
              style={{ borderTop: `4px solid ${room.color}` }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: room.color }}>{room.name}</h2>
              {isBusy ? (
                <>
                  <Tag color="red" className="mb-4 text-lg p-2">BUSY</Tag>
                  <p className="text-xl mb-2">Meeting: {currentBooking?.title}</p>
                  <p className="text-lg">Ends: {dayjs(currentBooking?.endAt).format('HH:mm')}</p>
                </>
              ) : (
                <>
                  <Tag color="green" className="mb-4 text-lg p-2">AVAILABLE</Tag>
                  {nextBooking ? (
                    <p className="text-lg">Next meeting at {dayjs(nextBooking.startAt).format('HH:mm')}</p>
                  ) : (
                    <p className="text-lg">Available for the rest of the day</p>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>
      <p className="mt-10 text-lg text-gray-400">Tap anywhere to return to the main application</p>
    </div>
  );
};

export default RoomStatusOverlay;
