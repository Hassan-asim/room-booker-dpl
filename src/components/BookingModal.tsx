import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker, TimePicker, message } from "antd";
import type { Dayjs } from "dayjs";

interface Room {
    id: string;
    name: string;
    capacity: number;
}

interface BookingModalProps {
    visible: boolean;
    onOk: (values: any) => void;
    onCancel: () => void;
    room?: Room;
    initialDate?: Dayjs;
}

export function BookingModal({ visible, onOk, onCancel, room, initialDate }: BookingModalProps) {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (visible && initialDate) {
            form.setFieldsValue({
                slotDate: initialDate,
            });
        }
    }, [visible, initialDate, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            // Validate time range
            if (values.slotTimeStart && values.slotTimeEnd) {
                if (values.slotTimeStart.isAfter(values.slotTimeEnd) || values.slotTimeStart.isSame(values.slotTimeEnd)) {
                    message.error('End time must be after start time');
                    return;
                }
            }

            onOk({ ...values, roomId: room?.id });
            form.resetFields();
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    return (
        <Modal
            open={visible}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 text-xl">📅</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Book {room?.name || "Room"}</h3>
                        <p className="text-sm text-gray-500">Fill in the details below</p>
                    </div>
                </div>
            }
            onOk={handleOk}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            okText="Confirm Booking"
            cancelText="Cancel"
            width={600}
            okButtonProps={{ className: "gradient-red border-0" }}
        >
            <Form form={form} layout="vertical" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="name" label="Your Name" rules={[{ required: true, message: 'Please enter your name' }]}>
                        <Input size="large" placeholder="John Doe" />
                    </Form.Item>

                    <Form.Item name="workEmail" label="Work Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                        <Input size="large" placeholder="john@company.com" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter your phone' }]}>
                        <Input size="large" placeholder="+1 234 567 8900" />
                    </Form.Item>

                    <Form.Item name="numAttendees" label="Number of Attendees" initialValue={1} rules={[{ required: true }]}>
                        <InputNumber min={1} max={room?.capacity || 10} size="large" className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item name="title" label="Meeting Title" rules={[{ required: true, message: 'Please enter meeting title' }]}>
                    <Input size="large" placeholder="e.g., Team Standup, Client Meeting" />
                </Form.Item>

                <Form.Item name="slotDate" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
                    <DatePicker size="large" className="w-full" format="MMMM DD, YYYY" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="slotTimeStart" label="Start Time" rules={[{ required: true, message: 'Please select start time' }]}>
                        <TimePicker format="HH:mm" size="large" className="w-full" minuteStep={15} />
                    </Form.Item>

                    <Form.Item name="slotTimeEnd" label="End Time" rules={[{ required: true, message: 'Please select end time' }]}>
                        <TimePicker format="HH:mm" size="large" className="w-full" minuteStep={15} />
                    </Form.Item>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Room:</strong> {room?.name}<br />
                        <strong>Capacity:</strong> {room?.capacity} people
                    </p>
                </div>
            </Form>
        </Modal>
    );
}
