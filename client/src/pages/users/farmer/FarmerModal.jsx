import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useAuthStore } from "@/stores";

const FarmerModal = ({
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

  // Lấy thông tin user và farmIDs từ auth store
  const { user, farmIds } = useAuthStore();
  const isExpert = user?.role === "expert";

  const [selectedFarmId, setSelectedFarmId] = useState(undefined);
  return (
    <Modal
      title={isEdit ? "Sửa nông dân" : "Thêm nông dân"}
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
      {isExpert && (
          <Form.Item
            name="farmId"
            label="Trang trại"
            rules={[{ required: true, message: "Chọn trang trại" }]}
          >
            <Select
              placeholder="Chọn trang trại"
              value={selectedFarmId}
              options={farmIds?.map((f) => ({
                value: f.farm._id,
                label: f.farm.name,
              }))}
              onChange={setSelectedFarmId}
              size="large"
            />
          </Form.Item>
        )}
        <Form.Item
          name="fullName"
          label="Tên nông dân"
          rules={[{ required: true, message: "Nhập tên nông dân" }]}
        >
          <Input placeholder="Tên nông dân" />
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

export default FarmerModal;