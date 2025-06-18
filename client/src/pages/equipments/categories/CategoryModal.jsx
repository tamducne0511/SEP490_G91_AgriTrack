import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

export default function EquipmentCategoryModal({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "category.jpg",
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
      title={isEdit ? "Sửa danh mục thiết bị" : "Thêm danh mục thiết bị"}
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
          label="Tên danh mục"
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
