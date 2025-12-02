import React, { useState, useEffect } from "react";
import { Layout, Card, Form, Input, InputNumber, Button, List, message, ColorPicker, Tabs, Modal, Table, Tag, Space, Tooltip } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '../components/theme-provider';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { confirm } = Modal;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

interface Room {
  id: string;
  name: string;
  capacity: number;
  color: string;
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

const Admin = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      message.error("Failed to fetch rooms");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      message.error("Failed to fetch bookings");
    }
  };

  const handleAddRoom = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({
          ...values,
          color: typeof values.color === 'string' ? values.color : values.color.toHexString(),
          slotDurationMinutes: 30,
          availableFrom: 480,
          availableTo: 1200
        }),
      });

      if (res.ok) {
        message.success("Room added successfully!");
        form.resetFields();
        fetchRooms();
      } else {
        const err = await res.json();
        message.error(err.error || "Failed to add room");
      }
    } catch (error) {
      message.error("Error adding room");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    confirm({
      title: 'Delete Room?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. The room can only be deleted if it has no future bookings.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
          });

          if (res.ok) {
            message.success('Room deleted');
            fetchRooms();
          } else {
            const err = await res.json();
            message.error(err.error || 'Failed to delete room');
          }
        } catch (error) {
          message.error('Error deleting room');
        }
      },
    });
  };

  const handleEventClick = (info: any) => {
    const booking = bookings.find(b => b.id === info.event.id);
    if (!booking) return;

    confirm({
      title: 'Booking Details',
      icon: <ExclamationCircleOutlined />,
      width: 600,
      content: (
        <div className="space-y-2">
          <p><strong>Title:</strong> {booking.title}</p>
          <p><strong>Booked by:</strong> {booking.name}</p>
          <p><strong>Email:</strong> {booking.workEmail}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>
          <p><strong>Attendees:</strong> {booking.numAttendees}</p>
          <p><strong>Room:</strong> {booking.room?.name}</p>
          <p><strong>Time:</strong> {dayjs(booking.startAt).format('MMM DD, YYYY HH:mm')} - {dayjs(booking.endAt).format('HH:mm')}</p>
          <p><strong>Status:</strong> <Tag color={booking.status === 'IN_PROGRESS' ? 'green' : 'blue'}>{booking.status}</Tag></p>
        </div>
      ),
      okText: booking.status === 'IN_PROGRESS' ? 'End Meeting Early' : 'Close',
      okType: booking.status === 'IN_PROGRESS' ? 'danger' : 'default',
      cancelText: 'Close',
      onOk: async () => {
        if (booking.status === 'IN_PROGRESS') {
          try {
            const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${booking.id}/end`, {
              method: 'PUT',
              headers: getAuthHeader()
            });
            if (res.ok) {
              message.success('Meeting ended');
              fetchBookings();
            } else {
              message.error('Failed to end meeting');
            }
          } catch (e) {
            message.error('Error ending meeting');
          }
        }
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/auth';
  };

  const bookingColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Room',
      dataIndex: ['room', 'name'],
      key: 'room',
      render: (text: string, record: Booking) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: record.room?.color }} />
          {text}
        </div>
      )
    },
    {
      title: 'Time',
      key: 'time',
      render: (text: string, record: Booking) => (
        <span>{dayjs(record.startAt).format('MMM DD, HH:mm')} - {dayjs(record.endAt).format('HH:mm')}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          'CONFIRMED': 'blue',
          'IN_PROGRESS': 'green',
          'ENDED': 'default',
          'CANCELLED': 'red'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Booking) => (
        <Space>
          {record.status === 'IN_PROGRESS' && (
            <Button
              size="small"
              danger
              onClick={() => handleEventClick({ event: { id: record.id } })}
            >
              End Early
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header className="glass sticky top-0 z-50 shadow-lg px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Meeting Room Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <Button
              icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              shape="circle"
            />
          </Tooltip>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            danger
          >
            Logout
          </Button>
        </div>
      </Header>

      <Content className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
        <Tabs defaultActiveKey="1" size="large">
          <Tabs.TabPane tab="📊 Dashboard" key="1">
            <Card className="glass shadow-xl mb-6 animate-slide-up">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={bookings.map(b => ({
                  id: b.id,
                  title: `${b.title} (${b.name})`,
                  start: b.startAt,
                  end: b.endAt,
                  color: rooms.find(r => r.id === b.roomId)?.color || '#ef4444',
                  borderColor: b.status === 'IN_PROGRESS' ? '#10b981' : 'transparent'
                }))}
                eventClick={handleEventClick}
                height="70vh"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                nowIndicator={true}
              />
            </Card>

            <Card className="glass shadow-xl" title="Recent Bookings">
              <Table
                dataSource={bookings.slice(0, 10)}
                columns={bookingColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane tab="🏢 Room Management" key="2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass shadow-xl" title="Add New Room">
                <Form form={form} onFinish={handleAddRoom} layout="vertical">
                  <Form.Item name="name" label="Room Name" rules={[{ required: true }]}>
                    <Input size="large" placeholder="e.g., Conference Room A" />
                  </Form.Item>
                  <Form.Item name="capacity" label="Capacity" rules={[{ required: true }]}>
                    <InputNumber min={1} size="large" className="w-full" placeholder="Number of people" />
                  </Form.Item>
                  <Form.Item name="color" label="Color" initialValue="#ef4444">
                    <ColorPicker showText size="large" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} size="large" block className="gradient-red border-0">
                    Add Room
                  </Button>
                </Form>
              </Card>

              <Card className="glass shadow-xl" title="Existing Rooms">
                <List
                  dataSource={rooms}
                  renderItem={(room) => (
                    <List.Item
                      actions={[
                        <Tooltip title="Delete Room">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteRoom(room.id)}
                          />
                        </Tooltip>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: room.color }}
                          />
                        }
                        title={<span className="font-semibold">{room.name}</span>}
                        description={`Capacity: ${room.capacity} people`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default Admin;