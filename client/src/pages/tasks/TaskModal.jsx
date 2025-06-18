import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

const TaskModal = ({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
  gardens = [],
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
            name: "task.jpg",
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
      title={isEdit ? "Sửa công việc" : "Thêm công việc"}
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
      destroyOnClose
      width={600}
      okText="Xác nhận"
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên công việc"
          rules={[{ required: true, message: "Nhập tên công việc" }]}
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
          name="gardenId"
          label="Vườn"
          rules={[{ required: true, message: "Chọn vườn" }]}
        >
          <Select
            showSearch
            placeholder="Chọn vườn"
            options={gardens.map((g) => ({
              value: g._id,
              label: g.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label="Loại công việc"
          rules={[
            { required: true, message: "Chọn loại công việc" },
            {
              validator: (_, value) =>
                value === "collect" || value === "task-care"
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Type must be collect or task-care")
                    ),
            },
          ]}
        >
          <Select
            placeholder="Chọn loại công việc"
            options={[
              { value: "collect", label: "Thu hoạch (collect)" },
              { value: "task-care", label: "Chăm sóc (task-care)" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="priority"
          label="Độ ưu tiên"
          rules={[{ required: true, message: "Nhập độ ưu tiên" }]}
        >
          <Select
            options={[
              { value: "low", label: "Thấp" },
              { value: "medium", label: "Trung bình" },
              { value: "high", label: "Cao" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Ảnh minh hoạ">
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

export default TaskModal;
