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
    await login(values.username, values.password);
  };

  React.useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  React.useEffect(() => {
    if (token) {
      if (user.role === "admin") navigate(RoutePaths.DASHBOARD);
      if (user.role === "farm-admin") navigate(RoutePaths.GARDEN_LIST);
      if (user.role === "farmer") navigate(RoutePaths.MY_TASK_LIST);
      if (user.role === "expert") navigate(RoutePaths.NOTIFICATION_LIST);
    }
  }, [token, navigate]);

  return (
    <div className="login-bg">
      <div className="login-overlay">
        <img
          src={HelloNho}
          className="icon-nho"
          alt="logo-nho"
          style={{ width: 200 }}
        />
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          className="login-back-btn"
        >
          Back
        </Button>
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
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Nhớ mật khẩu</Checkbox>
            </Form.Item>
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
