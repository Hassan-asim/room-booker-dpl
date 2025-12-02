import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Layout, message, Button, Select, Card, Badge, Tooltip } from 'antd';
import { CalendarOutlined, PlusOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { BookingModal } from '../components/BookingModal';
import { useTheme } from '../components/theme-provider';
import io from 'socket.io-client';
import dayjs from 'dayjs';

const { Header, Content } = Layout;

export default function Index() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchRooms();
    fetchBookings();

    const socket = io();
    socket.on('booking.created', (booking) => {
      setBookings(prev => [...prev, booking]);
      message.success('New booking created!');
    });

    socket.on('booking.ended', () => {
      fetchBookings();
    });

    return () => { socket.disconnect(); };
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      setRooms(data);
      if (data.length > 0) setSelectedRoom(data[0]);
    } catch (error) {
      message.error('Failed to fetch rooms');
    }
  };

  const fetchBookings = async () => {
    try {
      const from = dayjs().subtract(1, 'month').toISOString();
      const to = dayjs().add(3, 'months').toISOString();
      const res = await fetch(`/api/bookings?from=${from}&to=${to}`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      message.error('Failed to fetch bookings');
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(dayjs(arg.date));
    setModalVisible(true);
  };

  const handleBookingSubmit = async (values: any) => {
    try {
      const startAt = values.slotDate.hour(values.slotTimeStart.hour()).minute(values.slotTimeStart.minute()).toISOString();
      const endAt = values.slotDate.hour(values.slotTimeEnd.hour()).minute(values.slotTimeEnd.minute()).toISOString();

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startAt,
          endAt,
          roomId: values.roomId || selectedRoom?.id
        })
      });

      if (res.ok) {
        message.success('Booking confirmed!');
        setModalVisible(false);
        fetchBookings();
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to book');
      }
    } catch (error) {
      message.error('Booking failed');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header className="glass sticky top-0 z-50 shadow-lg px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Meeting Room Booker
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Made by Sufi Hassan Asim</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            className="w-32 md:w-48"
            placeholder="Select Room"
            value={selectedRoom?.id}
            onChange={(val) => setSelectedRoom(rooms.find(r => r.id === val))}
            options={rooms.map(r => ({
              label: (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <span>{r.name}</span>
                </div>
              ),
              value: r.id
            }))}
          />

          <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <Button
              icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              shape="circle"
              className="hidden md:flex"
            />
          </Tooltip>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            size="large"
            className="gradient-red border-0 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="hidden md:inline">Book Now</span>
          </Button>
        </div>
      </Header>

      <div
        className="w-full h-32 md:h-48 bg-cover bg-center shadow-inner relative overflow-hidden"
        style={{ backgroundImage: 'url(/banner.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      <Content className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {rooms.slice(0, 4).map(room => (
            <Card
              key={room.id}
              className="glass hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedRoom(room)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: room.color }} />
                    <h3 className="font-semibold">{room.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">Capacity: {room.capacity}</p>
                </div>
                <Badge
                  count={bookings.filter(b => b.roomId === room.id && b.status === 'IN_PROGRESS').length}
                  style={{ backgroundColor: '#ef4444' }}
                />
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass shadow-xl animate-slide-up">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={bookings.map(b => ({
              title: `${b.title} (${b.name})`,
              start: b.startAt,
              end: b.endAt,
              color: rooms.find(r => r.id === b.roomId)?.color || '#ef4444',
              borderColor: b.status === 'IN_PROGRESS' ? '#10b981' : 'transparent',
              extendedProps: { status: b.status }
            }))}
            dateClick={handleDateClick}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            nowIndicator={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </Card>
      </Content>

      <BookingModal
        visible={modalVisible}
        onOk={handleBookingSubmit}
        onCancel={() => setModalVisible(false)}
        room={selectedRoom}
        initialDate={selectedDate || dayjs()}
      />
    </Layout>
  );
}
