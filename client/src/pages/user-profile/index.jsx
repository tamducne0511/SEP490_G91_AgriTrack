import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  Select,
  DatePicker,
  Avatar,
} from "antd";
import {
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes";

const GENDER_OPTIONS = [
  { label: "Nam", value: "male", icon: <ManOutlined /> },
  { label: "Nữ", value: "female", icon: <WomanOutlined /> },
  { label: "Khác", value: "other" },
];

export default function UserProfile() {
  const [form] = Form.useForm();
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
        gender: user.gender || undefined,
        birthday: user.birthday ? dayjs(user.birthday) : undefined,
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updateProfile({
        ...values,
        birthday: values.birthday
          ? values.birthday.format("YYYY-MM-DD")
          : undefined,
      });
      message.success("Cập nhật thành công!");
    } catch (error) {
      message.error("Cập nhật thất bại. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px rgba(42,80,180,0.09)",
        padding: 24,
        position: "relative",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 28,
          marginBottom: 24,
          paddingBottom: 8,
          borderBottom: "2px solid #e0e0e0",
        }}
      >
        Thông tin cá nhân
      </div>

      <Row gutter={56} align="middle" justify="center">
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          <Avatar
            size={170}
            icon={<UserOutlined />}
            src={user?.avatar || undefined}
            style={{
              background: "#e0e0e0",
              margin: "0 auto 18px auto",
              display: "block",
            }}
          />
        </Col>
        <Col xs={24} md={16}>
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            labelAlign="left"
            onFinish={onFinish}
            colon={false}
            style={{ width: "100%" }}
          >
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Họ và tên là bắt buộc" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Giới tính là bắt buộc" }]}
            >
              <Select placeholder="Chọn giới tính">
                {GENDER_OPTIONS.map((opt) => (
                  <Select.Option value={opt.value} key={opt.value}>
                    {opt.icon && (
                      <span style={{ marginRight: 6 }}>{opt.icon}</span>
                    )}
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Ngày sinh"
              name="birthday"
              rules={[{ required: true, message: "Ngày sinh là bắt buộc" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Địa chỉ là bắt buộc" }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
            <div
              style={{
                marginBottom: 0,
                marginTop: 32,
                display: "flex",
                gap: 16,
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background: "#20613b",
                  borderColor: "#20613b",
                  minWidth: 110,
                  marginRight: 16,
                }}
              >
                Xác nhận
              </Button>
              <Button
                icon={<KeyOutlined />}
                style={{
                  minWidth: 140,
                  background: "#20613b",
                  color: "#fff",
                  border: "none",
                  float: "right",
                }}
                onClick={() => navigate(RoutePaths.CHANGE_PASSWORD)}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
}
