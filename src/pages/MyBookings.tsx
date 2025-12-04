import React, { useState } from 'react';
import { Layout, Input, Button, Card, List, message, Tag, Popconfirm, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { Header, Content } = Layout;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const MyBookings = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExtendModalVisible, setIsExtendModalVisible] = useState(false);
  const [bookingToExtend, setBookingToExtend] = useState<any>(null);
  const [extensionDuration, setExtensionDuration] = useState(15);

  const fetchBookings = async () => {
    if (!email) {
      message.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/email/${email}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        message.error(data.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEndEarly = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/end`, {
        method: 'PUT',
      });
      if (res.ok) {
        message.success('Meeting ended early');
        fetchBookings();
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to end meeting');
      }
    } catch (error) {
      message.error('An error occurred while ending the meeting');
    }
  };

  const handleExtendMeeting = async () => {
    if (!bookingToExtend) return;
    setLoading(true);
    try {
      // Note: We need to create this endpoint
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingToExtend.id}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: extensionDuration }),
      });
      if (res.ok) {
        message.success(`Meeting extended by ${extensionDuration} minutes`);
        setIsExtendModalVisible(false);
        setBookingToExtend(null);
        fetchBookings();
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to extend meeting');
      }
    } catch (error) {
      message.error('An error occurred while extending the meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header className="bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Bookings</h1>
      </Header>
      <Content className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <div className="flex gap-4">
              <Input
                placeholder="Enter your email to find your bookings"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onPressEnter={fetchBookings}
              />
              <Button type="primary" onClick={fetchBookings} loading={loading}>
                Find My Bookings
              </Button>
            </div>
          </Card>

          <List
            loading={loading}
            dataSource={bookings}
            renderItem={item => {
              const now = dayjs();
              const isCurrent = now.isBetween(dayjs(item.startAt), dayjs(item.endAt));
              
              const actions = [];
              if (isCurrent) {
                actions.push(
                  <Popconfirm
                    key="end"
                    title="End meeting early?"
                    onConfirm={() => handleEndEarly(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" danger>End Early</Button>
                  </Popconfirm>
                );
                actions.push(
                  <Button 
                    key="extend" 
                    type="default" 
                    onClick={() => {
                      setBookingToExtend(item);
                      setIsExtendModalVisible(true);
                    }}
                  >
                    Extend
                  </Button>
                );
              }

              return (
                <List.Item actions={actions}>
                  <List.Item.Meta
                    title={item.title}
                    description={`Room: ${item.room.name}`}
                  />
                  <div>
                    <p>{dayjs(item.startAt).format('MMM DD, YYYY')} </p>
                    <p>{dayjs(item.startAt).format('HH:mm')} - {dayjs(item.endAt).format('HH:mm')}</p>
                    <Tag color={isCurrent ? 'green' : 'blue'}>{item.status}</Tag>
                  </div>
                </List.Item>
              );
            }}
            locale={{ emptyText: 'No bookings found for this email.' }}
          />
        </div>
      </Content>

      <Modal
        title="Extend Meeting"
        open={isExtendModalVisible}
        onOk={handleExtendMeeting}
        onCancel={() => setIsExtendModalVisible(false)}
        confirmLoading={loading}
      >
        <p>Extend "{bookingToExtend?.title}" by:</p>
        <Select 
          defaultValue={15} 
          style={{ width: 120 }} 
          onChange={(value) => setExtensionDuration(value)}
          options={[
            { value: 15, label: '15 minutes' },
            { value: 30, label: '30 minutes' },
          ]}
        />
      </Modal>
    </Layout>
  );
};

export default MyBookings;