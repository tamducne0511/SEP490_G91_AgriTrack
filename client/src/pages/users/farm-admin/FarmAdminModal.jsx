import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

const FarmAdminModal = ({
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
    if (!open) form.resetFields();
  }, [open, initialValues, form]);

  return (
    <Modal
      title={isEdit ? "Sửa chủ trang trại" : "Thêm chủ trang trại"}
      open={open}
      onOk={() => form.validateFields().then(onOk)}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Quay lại"
      confirmLoading={confirmLoading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fullName"
          label="Tên chủ trang trại"
          rules={[{ required: true, message: "Nhập tên chủ trang trại" }]}
        >
          <Input placeholder="Tên chủ trang trại" />
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

export default FarmAdminModal;
