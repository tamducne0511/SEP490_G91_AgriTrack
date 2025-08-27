import { RoutePaths } from "@/routes";
import { useAuthStore,useFarmStore, useGardenStore, useTaskStore } from "@/stores";
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
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const typeLabel = {
  collect: "Thu hoạch",
  "task-care": "Chăm sóc",
};

const typeColor = {
  collect: "geekblue",
  "task-care": "green",
};

const statusLabel = {
  "un-assign": "Chưa giao",
  assigned: "Chờ thực hiện",
  "in-progress": "Đang thực hiện",
  canceled: "Đã huỷ",
  completed: "Hoàn thành",
  false: "Đã xoá",
};

const statusColor = {
  "un-assign": "default",
  assigned: "blue",
  "in-progress": "orange",
  canceled: "red",
  completed: "green",
  false: "grey",
};

// Hàm getRowLabel để tạo label hàng (A, B, C, ...)
const getRowLabel = (index) => String.fromCharCode(65 + index); // A, B, C, ...

export default function TaskList() {
  const {
    tasks,
    pagination,
    loading,
    error,
    fetchTasks,
    deleteTask,
  } = useTaskStore();
  const { user, farmIds } = useAuthStore();
  const { fetchFarms } = useFarmStore();
  const { gardens, fetchGardens, fetchGardensByFarmId, gardensByFarm } = useGardenStore();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState(undefined);
  const [selectedGardenId, setSelectedGardenId] = useState(undefined);
  const [zoneFilter, setZoneFilter] = useState(undefined); // Remove zone filter
  const isSearching = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchFarms(); // load danh sách farm cho expert
  }, [fetchFarms]);

  useEffect(() => {
    fetchGardens({ pageSize: 1000 }); // Lấy tất cả gardens
  }, [fetchGardens]);

  useEffect(() => {
    if (selectedFarmId) {
      fetchGardensByFarmId(selectedFarmId, { pageSize: 1000 });
      setSelectedGardenId(undefined); // reset garden khi đổi farm
      setPage(1); // reset page khi đổi farm vì filter thay đổi
    }
  }, [selectedFarmId, fetchGardensByFarmId]);

  useEffect(() => {
    const params = {
      page,
      keyword,
    };
    
    // Thêm farmId nếu expert đã chọn farm
    if (user?.role === "expert" && selectedFarmId) {
      params.farmId = selectedFarmId;
    }
    
    // Thêm gardenId nếu đã chọn garden
    if (selectedGardenId) {
      params.gardenId = selectedGardenId;
    }
    
    fetchTasks(params);
  }, [page, keyword, selectedFarmId, selectedGardenId, fetchTasks, user?.role]);

  // Reset page chỉ khi keyword thay đổi (không reset khi filter thay đổi)
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (record) => {
    try {
      await deleteTask(record._id);
      message.success("Xoá công việc thành công!");
      const params = { page, keyword };
      if (user?.role === "expert" && selectedFarmId) {
        params.farmId = selectedFarmId;
      }
      if (selectedGardenId) {
        params.gardenId = selectedGardenId;
      }
      fetchTasks(params);
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
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      align: "center",
      render: (startDate) =>
        startDate ? new Date(startDate).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      align: "center",
      render: (endDate) =>
        endDate ? new Date(endDate).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Người tạo",
      dataIndex: ["createdBy", "fullName"],
      key: "createdBy",
      align: "center",
      render: (createdBy) => createdBy || "—",
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
                icon={
                  <span
                    className="anticon"
                    style={{ color: "red", fontSize: 18 }}
                  >
                    🗑️
                  </span>
                }
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
          onChange={(e) => {
            isSearching.current = true;
            setKeyword(e.target.value);
          }}
          value={keyword}
        />
        {user?.role === "expert" && (
          <Select
            allowClear
            style={{ width: 240 }}
            placeholder="Chọn trang trại"
            value={selectedFarmId}
            options={farmIds?.map((f) => ({
              value: f.farm._id,
              label: f.farm.name,
            }))}
            onChange={(value) => {
              setSelectedFarmId(value);
              if (!value) {
                setPage(1); // Reset page khi clear farm filter
              }
            }}
          />
        )}
        <Select
          allowClear
          style={{ width: 240 }}
          placeholder="Chọn vườn"
          value={selectedGardenId}
          options={
            user?.role === "expert"
              ? gardensByFarm.map((g) => ({ value: g._id, label: g.name }))
              : gardens.map((g) => ({ value: g._id, label: g.name }))
          }
          onChange={(value) => {
            setSelectedGardenId(value);
            if (!value) {
              setPage(1); // Reset page khi clear garden filter
            }
          }}
          disabled={!selectedFarmId && user?.role === "expert"}
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
