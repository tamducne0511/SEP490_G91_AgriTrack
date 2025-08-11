import { useTaskStore } from "@/stores/taskStore";
import { SearchOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Table,
  Tag,
  message,
  Typography,
  Tooltip,
  Popconfirm,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes";

const { Title } = Typography;

const statusLabel = {
  "un-assign": "Chưa giao",
  assigned: "Chờ thực hiện",
  "in-progress": "Đang thực hiện",
  canceled: "Đã huỷ",
  completed: "Hoàn thành",
  false: "Đã bị xoá",
};

const statusColor = {
  "un-assign": "default",
  assigned: "blue",
  "in-progress": "orange",
  canceled: "red",
  completed: "green",
  false: "grey",
};

export default function FarmerTaskList() {
  const { tasks, pagination, loading, error, fetchTasksFarmer, deleteTask } =
    useTaskStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasksFarmer({ page, keyword });
  }, [page, keyword]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (record) => {
    try {
      await deleteTask(record._id);
      message.success("Xoá công việc thành công!");
      fetchTasksFarmer({ page, keyword });
    } catch (e) {
      message.error("Không thể xoá công việc!");
    }
  };

  const columns = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
    },
    {
      title: "Tên công việc",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={statusColor[status] || "default"}>
          {statusLabel[status] || status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
              onClick={() => navigate(RoutePaths.MY_TASK_DETAIL(record._id))}
            />
          </Tooltip>

          {/* <Tooltip title="Xoá công việc">
            <Popconfirm title="Xoá công việc này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => handleDelete(record)}>
              <Button type="text" danger icon={<DeleteOutlined style={{ color: "red", fontSize: 18 }} />} />
            </Popconfirm>
          </Tooltip> */}
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
      <Title level={4} style={{ marginBottom: 16 }}>
        Danh sách công việc của bạn
      </Title>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm công việc"
          style={{
            width: 280,
            borderRadius: 8,
            border: "1.5px solid #23643A",
            background: "#f8fafb",
          }}
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
        size="middle"
        scroll={{ x: true }}
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
