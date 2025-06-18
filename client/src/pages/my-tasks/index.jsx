import { useTaskStore } from "@/stores/taskStore";
import {
  BookOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Input, Table, Tag, message, Upload, Modal, Form } from "antd";
import { useEffect, useState } from "react";

export default function FarmerTaskList() {
  const {
    tasks,
    pagination,
    loading,
    error,
    fetchTasksFarmer,
    createDailyNote,
  } = useTaskStore();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalTask, setModalTask] = useState(null);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchTasksFarmer({ page, name: keyword });
  }, [page, keyword]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleNoteSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("comment", values.comment);
      if (values.image?.file) {
        formData.append("image", values.image.file);
      }

      setConfirmLoading(true);
      await createDailyNote(modalTask._id, formData);
      message.success("Gửi ghi chú thành công");
      setModalTask(null);
      form.resetFields();
    } catch (e) {
      message.error(e?.message || "Lỗi khi gửi ghi chú");
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
      width: 60,
      align: "center",
    },
    { title: "Tên công việc", dataIndex: "name", key: "name" },
    { title: "Ghi chú", dataIndex: "description", key: "description" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "done" ? "green" : "blue"}>
          {(status ?? "").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Chức năng",
      render: (_, record) => (
        <Button
          icon={<BookOutlined />}
          onClick={() => setModalTask(record)}
          style={{ color: "#23643A" }}
        >
          Ghi chú
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm công việc"
          style={{ width: 280 }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={tasks}
        loading={loading}
        pagination={{
          current: page,
          total: pagination.total,
          pageSize: pagination.pageSize,
          onChange: setPage,
          showSizeChanger: false,
        }}
        bordered
      />

      <Modal
        open={!!modalTask}
        title={`Ghi chú công việc: ${modalTask?.name}`}
        onCancel={() => setModalTask(null)}
        onOk={handleNoteSubmit}
        confirmLoading={confirmLoading}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="image" label="Hình ảnh minh hoạ (nếu có)">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Tải ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
