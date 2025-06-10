import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNotificationStore } from "@/stores";

// Helper để convert initial image sang file list cho Upload preview
const getFileList = (image) => {
  if (!image) return [];
  return [
    {
      uid: "-1",
      name: "image.png",
      status: "done",
      url: image.startsWith("http")
        ? image
        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image}`,
    },
  ];
};

const NotificationModal = ({
  open,
  onCancel,
  isEdit,
  initialValues = {},
  afterSubmit,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { createNotification, updateNotification, loading } =
    useNotificationStore();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      setFileList(
        isEdit && initialValues.image ? getFileList(initialValues.image) : []
      );
    }
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, initialValues, form, isEdit]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      // Nếu có file mới thì append, nếu edit và không đổi ảnh thì bỏ qua
      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      if (isEdit) {
        await updateNotification(initialValues._id, formData);
        message.success("Cập nhật thông báo thành công!");
      } else {
        await createNotification(formData);
        message.success("Tạo thông báo thành công!");
      }
      afterSubmit?.();
    } catch (err) {}
  };

  return (
    <Modal
      title={isEdit ? "Sửa thông báo" : "Thêm thông báo"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Quay lại"
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Nhập tiêu đề thông báo" }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: "Nhập nội dung thông báo" }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập nội dung" />
        </Form.Item>
        <Form.Item label="Ảnh minh hoạ" required={!isEdit}>
          <Upload
            accept="image/*"
            beforeUpload={() => false} // Không upload tự động
            fileList={fileList}
            onChange={handleUploadChange}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NotificationModal;
