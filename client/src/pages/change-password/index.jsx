import { RoutePaths } from "@/routes";
import { useAuthStore } from "@/stores";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

// Regex: tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export default function ChangePassword() {
  const [form] = Form.useForm();
  const { changePassword } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
      // Bạn có thể redirect hoặc gọi onBack() nếu muốn
    } catch (error) {
      message.error(error?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    navigate(RoutePaths.USER_PROFILE);
  };

  return (
    <div
      style={{
        margin: "40px auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px rgba(42,80,180,0.09)",
        padding: 38,
      }}
    >
      {/* Title lớn, căn trái, có border bottom như Thông tin cá nhân */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 28,
          marginBottom: 24,
          paddingBottom: 8,
          borderBottom: "2px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            cursor: "pointer",
            color: "#20613b",
            marginRight: 18,
            fontSize: 24,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
          onClick={onBack}
        >
          <ArrowLeftOutlined />
        </span>
        Đổi mật khẩu
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label={<b>Mật khẩu cũ</b>}
          name="currentPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu cũ" },
            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
          ]}
        >
          <Input.Password placeholder="12345@Aa" />
        </Form.Item>
        <Form.Item
          label={<b>Mật khẩu mới</b>}
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            {
              pattern: PASSWORD_REGEX,
              message:
                "Sai định dạng, mật khẩu có ít nhất 8 ký tự bao gồm chữ cái in hoa, chữ cái thường, chữ số và ký tự đặc biệt !",
            },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="12345@Aa" />
        </Form.Item>
        <Form.Item
          label={<b>Xác nhận mật khẩu</b>}
          name="confirmPassword"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Mật khẩu xác nhận không khớp");
              },
            }),
          ]}
        >
          <Input.Password placeholder="12345@Aa" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              minWidth: 100,
              background: "#20613b",
              borderColor: "#20613b",
              marginTop: 8,
            }}
          >
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
