import React from "react";
import { Modal, Form, Input, message } from "antd";

const { TextArea } = Input;

const DeleteTaskModal = ({ 
  open, 
  onCancel, 
  onOk, 
  task, 
  loading = false 
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values.deleteReason);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Xóa công việc"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Xóa công việc"
      cancelText="Đóng"
      okButtonProps={{ 
        danger: true,
        style: { background: "#ff4d4f", borderColor: "#ff4d4f" }
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, color: "#666" }}>
          Bạn sắp xóa công việc: <strong>{task?.name}</strong>
        </p>
        <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
          Trạng thái hiện tại: <strong>{task?.status === "completed" ? "Hoàn thành" : task?.status === false ? "Đã xóa" : task?.status}</strong>
        </p>
        <p style={{ margin: "8px 0 0 0", color: "#ff4d4f", fontSize: "14px" }}>
          ⚠️ Hành động này không thể hoàn tác và sẽ gửi thông báo đến nông dân.
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="deleteReason"
          label="Lý do xóa công việc"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập lý do xóa công việc",
            },
            {
              min: 10,
              message: "Lý do xóa phải có ít nhất 10 ký tự",
            },
            {
              max: 500,
              message: "Lý do xóa không được quá 500 ký tự",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập lý do xóa công việc (tối thiểu 10 ký tự)..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeleteTaskModal;
