import { RoutePaths } from "@/routes";
import { useAuthStore, useFarmStore, useGardenStore, useTaskStore } from "@/stores";
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
  DatePicker,
} from "antd";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DeleteTaskModal from "@/components/DeleteTaskModal";

const { RangePicker } = DatePicker;

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
    exportExcel,
  } = useTaskStore();
  const { user, farmIds } = useAuthStore();
  const { fetchFarms } = useFarmStore();
  const { gardens, fetchGardens, fetchGardensByFarmId, gardensByFarm } = useGardenStore();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState(undefined);
  const [selectedGardenId, setSelectedGardenId] = useState(undefined);
  const [zoneFilter, setZoneFilter] = useState(undefined); // Remove zone filter
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isSearching = useRef(false);
  const navigate = useNavigate();

  // Hàm kiểm tra có filter nào đang được áp dụng không
  const hasActiveFilters = () => {
    return startDateFilter || endDateFilter || keyword || selectedFarmId || selectedGardenId;
  };

  // Hàm đếm số filter đang được áp dụng
  const getActiveFilterCount = () => {
    let count = 0;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (keyword) count++;
    if (selectedFarmId) count++;
    if (selectedGardenId) count++;
    return count;
  };

  useEffect(() => {
  // Expert không cần gọi fetchFarms vì đã có farmIds từ auth store
    if (user?.role === "expert") {
      // Không gọi fetchFarms() nữa vì expert đã có farmIds từ auth store
    }
  }, [user?.role, farmIds]);

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

  // Reset page khi thay đổi garden filter
  useEffect(() => {
    setPage(1);
  }, [selectedGardenId]);

  // State để lưu tất cả dữ liệu
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const params = {
      pageSize: 1000, // Lấy tất cả
    };

    // Thêm farmId nếu expert đã chọn farm
    if (user?.role === "expert" && selectedFarmId) {
      params.farmId = selectedFarmId;
    }

    fetchTasks(params);
  }, [selectedFarmId, fetchTasks, user?.role]);

  // Filter dữ liệu ở frontend
  useEffect(() => {
    let filtered = [...allTasks];

    // Filter theo keyword
    if (keyword) {
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Filter theo garden

    if (selectedGardenId) {
      filtered = filtered.filter(task => task.gardenId === selectedGardenId);
    }

    // Filter theo ngày bắt đầu
    if (startDateFilter) {
      const startDate = startDateFilter.toDate();
      filtered = filtered.filter(task => {
        if (!task.startDate) return false;
        return new Date(task.startDate) >= startDate;
      });
    }

    // Filter theo ngày kết thúc
    if (endDateFilter) {
      const endDate = endDateFilter.toDate();
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(task => {
        if (!task.endDate) return false;
        return new Date(task.endDate) <= endDate;
      });
    }

    setFilteredTasks(filtered);
  }, [allTasks, keyword, selectedGardenId, startDateFilter, endDateFilter]);

  // Cập nhật allTasks khi có dữ liệu mới
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setAllTasks(tasks);
    }
  }, [tasks]);

  // Reset page khi thay đổi keyword
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  // Reset page khi thay đổi date filter
  useEffect(() => {
    setPage(1);
  }, [startDateFilter, endDateFilter]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (record) => {
    setSelectedTask(record);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (deleteReason) => {
    setDeleteLoading(true);
    try {
      await deleteTask(selectedTask._id, deleteReason);
      message.success("Xóa công việc thành công!");
      setDeleteModalOpen(false);
      setSelectedTask(null);

      // Reload lại tất cả dữ liệu
      const params = { pageSize: 1000 };
      if (user?.role === "expert" && selectedFarmId) {
        params.farmId = selectedFarmId;
      }
      fetchTasks(params);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi xóa công việc!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 60,
      render: (_, __, idx) =>
        (page - 1) * 10 + idx + 1,
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
       render: (_, record) => {
         const canDelete = record.status !== "completed" && record.status !== "false";
         
         return (
           <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
             <Tooltip title="Xem chi tiết">
               <Button
                 type="text"
                 icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
                 onClick={() => navigate(RoutePaths.TASK_DETAIL(record._id))}
               />
             </Tooltip>
             
             {canDelete ? (
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
                   onClick={() => handleDelete(record)}
                 />
               </Tooltip>
             ) : (
               <Tooltip title={record.status === "completed" ? "Không thể xóa công việc đã hoàn thành" : "Công việc đã được xóa"}>
                 <Button
                   type="text"
                   disabled
                   icon={
                     <span
                       className="anticon"
                       style={{ color: "#ccc", fontSize: 18 }}
                     >
                       🗑️
                     </span>
                   }
                 />
               </Tooltip>
             )}
           </div>
         );
       },
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
        <Button 
          type="primary"
          style={{ background: "#23643A", border: 0, borderRadius: 8 }}
          onClick={() => {
            exportExcel({
              farmId: selectedFarmId,
              gardenId: selectedGardenId,
              keyword,
              // startDate: startDateFilter ? startDateFilter.format('YYYY-MM-DD') : undefined,
              // endDate: endDateFilter ? endDateFilter.format('YYYY-MM-DD') : undefined,
            })
          }} >
          Xuất Excel
        </Button>
        <Button
          type="primary"
          style={{ background: "#23643A", border: 0, borderRadius: 8 }}
          onClick={() => navigate(RoutePaths.TASK_GARNCHART)}
        >
          Garnchart
        </Button>
      </div>

      {/* Filter thời gian */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 18,
        flexWrap: "wrap",
        padding: "16px",
        background: "#f8fafb",
        borderRadius: "8px",
        border: "1px solid #e8eaed"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 500, color: "#23643A" }}>Bộ lọc thời gian:</span>
        </div>
        <Tooltip title="Lọc theo ngày bắt đầu công việc">
          <DatePicker
            placeholder="Ngày bắt đầu công việc"
            value={startDateFilter}
            onChange={(date) => {
              setStartDateFilter(date);
              setPage(1);
            }}
            style={{ width: 200 }}
            format="DD/MM/YYYY"
          />
        </Tooltip>
        <Tooltip title="Lọc theo ngày kết thúc công việc">
          <DatePicker
            placeholder="Ngày kết thúc công việc"
            value={endDateFilter}
            onChange={(date) => {
              setEndDateFilter(date);
              setPage(1);
            }}
            style={{ width: 200 }}
            format="DD/MM/YYYY"
          />
        </Tooltip>
        <Button
          onClick={() => {
            setStartDateFilter(null);
            setEndDateFilter(null);
            setPage(1);
          }}
          style={{
            borderRadius: 8,
            background: "#ff4d4f",
            borderColor: "#ff4d4f",
            color: "white"
          }}
          disabled={!hasActiveFilters()}
        >
          Xóa bộ lọc ({getActiveFilterCount()})
        </Button>
      </div>

      {/* Hiển thị thông tin filter đang áp dụng */}
      {hasActiveFilters() && (
        <div style={{
          marginBottom: 16,
          padding: "8px 12px",
          background: "#e6f7ff",
          border: "1px solid #91d5ff",
          borderRadius: "6px",
          fontSize: "14px"
        }}>
          <span style={{ fontWeight: 500, color: "#1890ff" }}>
            Đang áp dụng {getActiveFilterCount()} bộ lọc
          </span>
          {keyword && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Từ khóa: <strong>"{keyword}"</strong>
            </span>
          )}
          {startDateFilter && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Ngày bắt đầu: <strong>{startDateFilter.format('DD/MM/YYYY')}</strong>
            </span>
          )}
          {endDateFilter && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Ngày kết thúc: <strong>{endDateFilter.format('DD/MM/YYYY')}</strong>
            </span>
          )}
        </div>
      )}

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredTasks}
        loading={loading}
        pagination={{
          current: page,
          total: filteredTasks.length,
          pageSize: 10,
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

      <DeleteTaskModal
        open={deleteModalOpen}
        task={selectedTask}
        loading={deleteLoading}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}