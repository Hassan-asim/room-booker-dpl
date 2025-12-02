import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        message.success("Logged in successfully");
        navigate("/admin");
      } else {
        message.error(data.error || "Login failed");
      }
    } catch (error) {
      message.error("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-2">
            Admin Login
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Meeting Room Booker</p>
        </div>

        <Card className="glass shadow-2xl border-0">
          <Form onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="admin@dplit.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              className="gradient-red border-0 shadow-lg hover:shadow-xl transition-all h-12 text-lg font-semibold"
            >
              Login
            </Button>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Demo Credentials:</p>
            <p className="font-mono">admin@dplit.com / 123456789</p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Button type="link" onClick={() => navigate('/')}>
            ← Back to Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;