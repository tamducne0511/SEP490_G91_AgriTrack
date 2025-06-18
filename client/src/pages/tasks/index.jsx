import React, { useEffect, useState } from "react";
import { Button, Input, Popconfirm, Table, Tag, message, Select } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useGardenStore, useTaskStore } from "@/stores"; // Store để lấy danh sách vườn
import TaskModal from "./TaskModal";
import { ImageBaseUrl } from "@/variables/common";

const typeLabel = {
  collect: "Thu hoạch",
  "task-care": "Chăm sóc",
};

const typeColor = {
  collect: "geekblue", // Xanh đậm
  "task-care": "green", // Xanh lá
};

export default function TaskList() {
  // Store
  const {
    tasks,
    pagination,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskStore();

  const { gardens, fetchGardens } = useGardenStore();

  // State
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [gardenFilter, setGardenFilter] = useState(undefined);
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch vườn khi mount
  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  // Fetch task mỗi khi filter thay đổi
  useEffect(() => {
    fetchTasks({
      page,
      name: keyword,
      gardenId: gardenFilter,
    });
  }, [page, keyword, gardenFilter, fetchTasks]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // Submit modal
  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      if (modal.edit) {
        await updateTask(modal.initial._id, values);
        message.success("Cập nhật công việc thành công");
      } else {
        await createTask(values);
        message.success("Tạo công việc mới thành công");
      }
      setModal({ open: false, edit: false, initial: {} });
      fetchTasks({ page, name: keyword, gardenId: gardenFilter });
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  // Xoá task
  const handleDelete = async (record) => {
    try {
      await deleteTask(record._id);
      message.success("Xoá công việc thành công!");
      fetchTasks({ page, name: keyword, gardenId: gardenFilter });
    } catch {}
  };

  // Table columns
  const columns = [
    {
      title: "STT",
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
      width: 60,
      align: "center",
    },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Vườn",
      dataIndex: "gardenId",
      key: "gardenId",
      render: (gardenId) => {
        const g = gardens.find((g) => g._id === gardenId);
        return g ? g.name : "";
      },
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={typeColor[type] || "default"}>
          {typeLabel[type] || type}
        </Tag>
      ),
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        let color = "blue";
        if (priority === "high") color = "red";
        else if (priority === "medium") color = "gold";
        else if (priority === "low") color = "green";
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) =>
        url ? (
          <img
            src={ImageBaseUrl + url}
            alt="Ảnh task"
            style={{ width: 60, borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: "#ccc" }}>Không có</span>
        ),
      width: 80,
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      render: (_, record) => (
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() =>
              setModal({ open: true, edit: true, initial: record })
            }
          />
          <Popconfirm
            title="Bạn chắc chắn muốn xoá công việc này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A" }}
          onClick={() => setModal({ open: true, edit: false, initial: {} })}
        >
          Thêm công việc
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên"
          style={{ width: 220 }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
        <Select
          allowClear
          style={{ width: 220 }}
          placeholder="Lọc theo vườn"
          value={gardenFilter}
          options={gardens.map((g) => ({ value: g._id, label: g.name }))}
          onChange={setGardenFilter}
        />
      </div>
      {/* Table */}
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
      {/* Modal */}
      <TaskModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
        gardens={gardens}
      />
    </div>
  );
}
