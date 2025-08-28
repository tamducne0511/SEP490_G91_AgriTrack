import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

const FarmModal = ({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
}) => {
  const [form] = Form.useForm();
  // State để điều khiển ảnh (hỗ trợ hiển thị lại khi edit)
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      // Khi mở modal edit thì hiển thị ảnh cũ
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "farm.jpg",
            url: initialValues.image.startsWith("http")
              ? initialValues.image
              : ImageBaseUrl + initialValues.image,
            status: "done",
          },
        ]);
      } else {
        setFileList([]);
      }
    }
    if (!open) form.resetFields();
  }, [open, initialValues, form, isEdit]);

  // Xử lý chọn ảnh mới
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={isEdit ? "Sửa trang trại" : "Thêm trang trại"}
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
      okText="Xác nhận"
      cancelText="Quay lại"
      confirmLoading={confirmLoading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên trang trại"
          rules={[{ required: true, message: "Nhập tên trang trại" }]}
        >
          <Input placeholder="Tên trang trại" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input placeholder="Mô tả" />
        </Form.Item>
        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Nhập địa chỉ" }]}
        >
          <Input placeholder="Địa chỉ" />
        </Form.Item>
        <Form.Item label="Ảnh trang trại">
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
            fileList={fileList}
            onChange={handleChange}
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
};

export default FarmModal;