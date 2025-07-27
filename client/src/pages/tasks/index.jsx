import { RoutePaths } from "@/routes";
import { useGardenStore, useTaskStore } from "@/stores";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const typeLabel = {
  collect: "Thu hoạch",
  "task-care": "Chăm sóc",
};

const typeColor = {
  collect: "geekblue",
  "task-care": "green",
};

// Hàm getRowLabel để tạo label hàng (A, B, C, ...)
const getRowLabel = (index) => String.fromCharCode(65 + index); // A, B, C, ...

export default function TaskList() {
  const { tasks, pagination, loading, error, fetchTasks, deleteTask } =
    useTaskStore();

  const { gardens, fetchGardens } = useGardenStore();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedGardenId, setSelectedGardenId] = useState(undefined);
  const [zoneFilter, setZoneFilter] = useState(undefined); // Remove zone filter
  const navigate = useNavigate();

  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  useEffect(() => {
    fetchTasks({ page, keyword, gardenId: selectedGardenId }); // Filter by gardenId only
  }, [page, keyword, selectedGardenId, fetchTasks]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (record) => {
    try {
      await deleteTask(record._id);
      message.success("Xoá công việc thành công!");
      fetchTasks({ page, keyword, gardenId: selectedGardenId });
    } catch {}
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 60,
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    // Removed the "Zone" column
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type) => (
        <Tag color={typeColor[type] || "default"}>
          {typeLabel[type] || type}
        </Tag>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      align: "center",
      render: (priority) => {
        let color = "blue";
        let label = priority; // Mặc định giữ nguyên
        if (priority === "high") {
          color = "red";
          label = "Cao";
        } else if (priority === "medium") {
          color = "gold";
          label = "Trung bình";
        } else if (priority === "low") {
          color = "green";
          label = "Thấp";
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
              onClick={() => navigate(RoutePaths.TASK_DETAIL(record._id))}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn chắc chắn muốn xoá công việc này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title="Xoá">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined style={{ color: "red", fontSize: 18 }} />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const tableHeaderStyle = {
    background: "#23643A",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    textAlign: "center",
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 12px #e0e6ed80",
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A", border: 0, borderRadius: 8 }}
          onClick={() => navigate(RoutePaths.TASK_CREATE)}
        >
          Thêm công việc
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên"
          style={{
            width: 240,
            borderRadius: 8,
            border: "1.5px solid #23643A",
            background: "#f8fafb",
          }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
        <Select
          allowClear
          style={{ width: 240 }}
          placeholder="Chọn vườn"
          value={selectedGardenId}
          options={gardens.map((g) => ({ value: g._id, label: g.name }))}
          onChange={setSelectedGardenId}
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
        size="middle"
        scroll={{ x: true }}
        style={{ background: "#fff" }}
        components={{
          header: {
            cell: (props) => (
              <th {...props} style={{ ...props.style, ...tableHeaderStyle }}>
                {props.children}
              </th>
            ),
          },
        }}
      />
    </div>
  );
}
