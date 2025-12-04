import React from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const SlotTimeline = ({ room, bookings }: { room: any, bookings: any[] }) => {
  const now = dayjs();
  const today = now.startOf('day');
  const totalMinutes = room.availableTo - room.availableFrom;

  const generateSlots = () => {
    const slots = [];
    for (let i = room.availableFrom; i < room.availableTo; i += room.slotDurationMinutes) {
      const start = today.add(i, 'minute');
      const end = today.add(i + room.slotDurationMinutes, 'minute');
      
      const isPast = now.isAfter(end);
      const isBooked = bookings.some(b => 
        dayjs(b.startAt).isBefore(end) && dayjs(b.endAt).isAfter(start)
      );

      let status = 'available';
      if (isPast) status = 'past';
      if (isBooked) status = 'booked';

      slots.push({ start, end, status });
    }
    return slots;
  };

  const slots = generateSlots();
  const slotWidth = 100 / slots.length;

  return (
    <div className="mt-4">
      <p className="font-semibold mb-2 text-sm">Today's Schedule</p>
      <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex overflow-hidden border border-gray-300 dark:border-gray-600">
        {slots.map((slot, index) => {
          let bgColor = 'bg-green-400'; // available
          if (slot.status === 'booked') bgColor = 'bg-red-400';
          if (slot.status === 'past') bgColor = 'bg-gray-300 dark:bg-gray-500';

          return (
            <div
              key={index}
              className={`h-full ${bgColor} transition-colors duration-300`}
              style={{ width: `${slotWidth}%` }}
              title={`${slot.start.format('HH:mm')} - ${slot.end.format('HH:mm')} (${slot.status})`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{dayjs(today).add(room.availableFrom, 'minute').format('HH:mm')}</span>
        <span>{dayjs(today).add(room.availableTo, 'minute').format('HH:mm')}</span>
      </div>
    </div>
  );
};

export default SlotTimeline;

