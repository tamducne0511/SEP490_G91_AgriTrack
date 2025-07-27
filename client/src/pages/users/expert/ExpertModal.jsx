import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

const ExpertModal = ({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.setFieldsValue(initialValues);
    // Reset form when modal closes
    if (!open) form.resetFields();
  }, [open, initialValues, form]);

  return (
    <Modal
      title={isEdit ? "Sửa chuyên gia" : "Thêm chuyên gia"}
      open={open}
      className="custom-modal"
      onOk={() => form.validateFields().then(onOk)}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Quay lại"
      confirmLoading={confirmLoading}
      width={600}
      style={{ top: 40 }}
      bodyStyle={{ padding: 32, paddingTop: 20 }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fullName"
          label="Tên chuyên gia"
          rules={[{ required: true, message: "Nhập tên chuyên gia" }]}
        >
          <Input placeholder="Tên chuyên gia" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Email" disabled={isEdit} />
        </Form.Item>
        {!isEdit && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ExpertModal;
