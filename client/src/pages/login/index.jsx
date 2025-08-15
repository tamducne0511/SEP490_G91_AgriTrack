import React from "react";
import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { RoutePaths } from "@/routes";
import { HelloNho } from "@/assets/images";

export default function Login() {
  const { login, loading, error, token, user } = useAuthStore(); // lấy thêm token (hoặc user)
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log("🔍 Login attempt with values:", { email: values.username, password: "***" });
    console.log("🔍 API Base URL:", process.env.REACT_APP_API_BASE_URL);
    try {
      await login(values.username, values.password);
    } catch (err) {
      console.error("❌ Login error in component:", err);
    }
  };

  React.useEffect(() => {
    console.log("🔍 Error state changed:", error);
    if (error) {
      message.error(error);
    }
  }, [error]);

  React.useEffect(() => {
    console.log("🔍 Token/User state changed:", { token: !!token, user: user?.role });
    if (token && user) {
      console.log("🔍 Navigating based on role:", user.role);
      if (user.role === "admin") navigate(RoutePaths.DASHBOARD);
      if (user.role === "farm-admin") navigate(RoutePaths.GARDEN_LIST);
      if (user.role === "farmer") navigate(RoutePaths.MY_TASK_LIST);
      if (user.role === "expert") navigate(RoutePaths.REQUEST_LIST);
    } else if (token && !user) {
      console.log("🔍 Token exists but no user, calling getMe");
      // If we have token but no user, try to get user info
      const { getMe } = useAuthStore.getState();
      getMe();
    }
  }, [token, user, navigate]);

  return (
    <div className="login-bg">
      <div className="login-overlay">
        <img
          src={HelloNho}
          className="icon-nho"
          alt="logo-nho"
          style={{ width: 200 }}
        />

        <Typography.Title
          level={2}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          Đăng nhập
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Nhập email" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Email"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>
          <div className="login-options">
            {/* <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Nhớ mật khẩu</Checkbox>
            </Form.Item> */}
            <a className="login-forgot" href="#">
              Quên mật khẩu?
            </a>
          </div>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
