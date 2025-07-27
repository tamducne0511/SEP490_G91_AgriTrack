import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

const GardenModal = ({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "garden.jpg",
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

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={isEdit ? "Sửa vườn" : "Thêm vườn"}
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
          label="Tên vườn"
          rules={[{ required: true, message: "Nhập tên vườn" }]}
        >
          <Input placeholder="Tên vườn" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input placeholder="Mô tả" />
        </Form.Item>
        <Form.Item label="Ảnh vườn">
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

export default GardenModal;
