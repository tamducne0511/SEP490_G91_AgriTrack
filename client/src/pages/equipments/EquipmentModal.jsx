import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

export default function EquipmentModal({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
  categories = [],
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const availableCategories = categories.filter(c => c.status === true);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "equipment.jpg",
            url: initialValues.image.startsWith("http")
              ? initialValues.image
              : ImageBaseUrl + initialValues.image,
            status: "done",
          },
        ]);
      } else setFileList([]);
    }
    if (!open) form.resetFields();
  }, [open, initialValues, form, isEdit]);

  return (
    <Modal
      title={isEdit ? "Sửa thiết bị" : "Thêm thiết bị"}
      open={open}
      onOk={() =>
        form
          .validateFields()
          .then((values) => {
            return onOk({
              ...values,
              image: fileList[0]?.originFileObj || null,
            });
          })
          .catch((err) => {
            console.error("Validation or submission error:", err);
          })
      }
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width={600}
      destroyOnClose
      okText="Xác nhận"
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên thiết bị"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="categoryId"
          label="Danh mục"
          rules={[{ required: true, message: "Chọn danh mục" }]}
        >
          <Select
            showSearch
            placeholder="Chọn danh mục"
            options={availableCategories.map((c) => ({
              value: c._id,
              label: c.name,
            }))}
          />
        </Form.Item>
        <Form.Item label="Ảnh minh hoạ">
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept="image/*"
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}