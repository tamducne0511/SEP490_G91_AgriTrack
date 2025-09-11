import React from "react";
import { Modal, Form, Input } from "antd";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export default function ChangePasswordModal({ open, onOk, onCancel, loading }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onOk?.({ newPassword: values.newPassword });
    form.resetFields();
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      open={open}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel?.();
      }}
      okText="Đổi mật khẩu"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            {
              pattern: PASSWORD_REGEX,
              message:
                "Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt",
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>
        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>
      </Form>
    </Modal>
  );
}