import { RoutePaths } from "@/routes";
import {
  useAuthStore,
  useFarmStore,
  useGardenStore,
  useTaskStore,
} from "@/stores";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  BarChartOutlined,
  TableOutlined,
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
import { ViewMode, Gantt } from "gantt-task-react";
import { Modal, Descriptions } from "antd";

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
  const { tasks, pagination, loading, error, fetchTasks, deleteTask, exportExcel } =
    useTaskStore();
  const { user, farmIds } = useAuthStore();
  const { fetchFarms } = useFarmStore();
  const { gardens, fetchGardens, fetchGardensByFarmId, gardensByFarm } =
    useGardenStore();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState(undefined);
  const [selectedGardenId, setSelectedGardenId] = useState(undefined);
  const [zoneFilter, setZoneFilter] = useState(undefined); // Remove zone filter
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [progressFilter, setProgressFilter] = useState(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" hoặc "gantt"
  const [ganttView, setGanttView] = useState(ViewMode.Month); // ViewMode cho Gantt
  const [showTaskList, setShowTaskList] = useState(true); // Hiển thị danh sách task bên trái
  const isSearching = useRef(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState(null);

  const navigate = useNavigate();

  // Hàm kiểm tra có filter nào đang được áp dụng không
  const hasActiveFilters = () => {
    return (
      startDateFilter ||
      endDateFilter ||
      keyword ||
      selectedFarmId ||
      selectedGardenId ||
      statusFilter ||
      progressFilter
    );
  };

  // Hàm đếm số filter đang được áp dụng
  const getActiveFilterCount = () => {
    let count = 0;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (keyword) count++;
    if (selectedFarmId) count++;
    if (selectedGardenId) count++;
    if (statusFilter) count++;
    if (progressFilter) count++;
    return count;
  };

  const handleTaskDelete = (task) => {
    const conf = window.confirm(
      `Bạn có chắc muốn xóa công việc "${task.name}"?`
    );
    if (conf) {
      handleDelete({ _id: task.id, name: task.name });
    }
    return conf;
  };

  const handleProgressChange = (task) => {
    console.log("Progress changed:", task);
    // Có thể thêm logic cập nhật tiến độ ở đây
  };

  const handleDblClick = (task) => {
    console.log("Double clicked task:", task);
    setTaskDetail(task);
    setTaskDetailOpen(true);
    // navigate(RoutePaths.TASK_DETAIL(task.id));
  };

  const handleSelect = (task, isSelected) => {
    console.log(`Task ${task.name} ${isSelected ? "selected" : "unselected"}`);
  };

  const handleExpanderClick = (task) => {
    console.log("Expander clicked:", task);
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
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Filter theo garden

    if (selectedGardenId) {
      filtered = filtered.filter((task) => task.gardenId === selectedGardenId);
    }

    // Filter theo ngày bắt đầu
    if (startDateFilter) {
      const startDate = startDateFilter.toDate();
      filtered = filtered.filter((task) => {
        if (!task.startDate) return false;
        return new Date(task.startDate) >= startDate;
      });
    }

    // Filter theo ngày kết thúc
    if (endDateFilter) {
      const endDate = endDateFilter.toDate();
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((task) => {
        if (!task.endDate) return false;
        return new Date(task.endDate) <= endDate;
      });
    }

    // Filter theo trạng thái
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Filter theo tiến độ
    if (progressFilter) {
      filtered = filtered.filter((task) => {
        const progressText = getProgressState(task);
        return progressText.includes(progressFilter);
      });
    }

    setFilteredTasks(filtered);
  }, [allTasks, keyword, selectedGardenId, startDateFilter, endDateFilter, statusFilter, progressFilter]);

  // console.log("Filtered Tasks:", filteredTasks);
  // Hàm return tiến độ của task
  function getProgressState(task) {
    const now = new Date();
    const start = new Date(task.startDate || task.start);
    const end = new Date(task.endDate || task.end);
  
    if (task.status === "canceled") return "Đã huỷ";
    if (task.status === false) return "Đã xoá";
    if (task.status === "completed") {
      return now <= end
        ? "Hoàn thành đúng hạn"
        : `Hoàn thành trễ ${Math.floor((now - end) / 86400000)} ngày`;
    }
  
    if (task.status === "assigned" || task.status === "in-progress") {
      if (now < start) return "Chưa tới ngày bắt đầu";
      if (now > end) return `Quá hạn ${Math.floor((now - end) / 86400000)} ngày`;
      if (task.status === "in-progress") {
        const daysLeft = Math.floor((end - now) / 86400000);
        if (daysLeft <= 2) return `Sắp tới hạn (còn ${daysLeft} ngày)`;
        return `Đang thực hiện (còn ${daysLeft} ngày)`;
      }  
    }
  
    if (task.status === "un-assign") return "Chưa giao";
    
    console.log("Unknown task status:", task.status);
    return "Chưa xác định";
    // return "Không xác định";
  }

  // Hàm lấy màu sắc cho task
  const getTaskColor = (status) => {
    switch (status) {
      case "completed":
        return "#52c41a";
      case "in-progress":
        return "#1890ff";
      case "assigned":
        return "#faad14";
      case "canceled":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };
  // format dữ liệu của gantt-task-react
  const getGanttData = () => {
    if (!filteredTasks || !Array.isArray(filteredTasks)) {
      return [];
    }

    return filteredTasks
      .map((task) => {
        // Kiểm tra task có tồn tại và có đầy đủ thông tin cần thiết
        if (!task || !task._id) return null;

        let startDate = null;
        let endDate = null;

        // Xử lý startDate
        if (task.startDate) {
          startDate = new Date(task.startDate);
          if (isNaN(startDate.getTime())) {
            startDate = null;
          }
        }

        // Xử lý endDate
        if (task.endDate) {
          endDate = new Date(task.endDate);
          if (isNaN(endDate.getTime())) {
            endDate = null;
          }
        }

        // Nếu không có startDate hợp lệ, bỏ qua task này
        if (!startDate) return null;

        // Nếu không có endDate hợp lệ, tạo endDate từ startDate + 1 ngày
        if (!endDate) {
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }

        // Đảm bảo endDate >= startDate
        if (endDate < startDate) {
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }

        return {
          id: task._id,
          name: task.name || "Chưa có tên",
          start: startDate,
          end: endDate,
          type: "task",
          createdBy: task.createdBy,
          status: task.status,
          progressFilter: getProgressState(task),
          progress:
            task.status === "completed"
              ? 100
              : task.status === "in-progress"
              ? 50
              : 0,
          styles: {
            progressColor: getTaskColor(task.status),
            progressSelectedColor: getTaskColor(task.status),
          },
        };
      })
      .filter(Boolean); // loại task null/undefined
  };

  const ganttData = getGanttData().filter(
    (t) =>
      t &&
      t.start instanceof Date &&
      t.end instanceof Date &&
      !isNaN(t.start.getTime()) &&
      !isNaN(t.end.getTime())
  );

  // Event handlers cho Gantt Chart
  const handleTaskChange = (task) => {
    console.log(
      "Task changed:",
      task,
      new Date(task.start),
      new Date(task.end)
    );
    // Logic cập nhật task
    let newTasks = allTasks.map((t) =>
      t._id === task.id
        ? {
            ...t,
            start: new Date(task.start), // dùng cho Gantt
            end: new Date(task.end), // dùng cho Gantt
            startDate: new Date(task.start).toISOString(), // đồng bộ API
            endDate: new Date(task.end).toISOString(),
          }
        : t
    );
    setAllTasks(newTasks);
  };
  //   useEffect(() => {
  //   console.log("Filtered tasks:", filteredTasks);
  // }, [filteredTasks]);

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

  // Reset page khi thay đổi status và progress filter
  useEffect(() => {
    setPage(1);
  }, [statusFilter, progressFilter]);

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
      render: (_, __, idx) => (page - 1) * 10 + idx + 1,
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
      title: "Tiến độ",
      key: "progress",
      align: "center",
      render: (_, record) => {
        const progressText = getProgressState(record);
    
        // bạn có thể gán màu riêng cho progress
        let color = "default";
        if (progressText.includes("Sắp tới hạn")) color = "orange";
        else if (progressText.includes("Quá hạn")) color = "red";
        else if (progressText.includes("Hoàn thành")) color = "green";
        else if (progressText.includes("Chưa")) color = "blue";
    
        return <Tag color={color}>{progressText}</Tag>;
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
        const canDelete =
          record.status !== "completed" && record.status !== "false";

        return (
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={
                  <EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />
                }
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
              <Tooltip
                title={
                  record.status === "completed"
                    ? "Không thể xóa công việc đã hoàn thành"
                    : "Công việc đã được xóa"
                }
              >
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
        <Select
          allowClear
          style={{ width: 200 }}
          placeholder="Chọn trạng thái"
          value={statusFilter}
          options={[
            { value: "un-assign", label: "Chưa giao" },
            { value: "assigned", label: "Chờ thực hiện" },
            { value: "in-progress", label: "Đang thực hiện" },
            { value: "completed", label: "Hoàn thành" },
            { value: "canceled", label: "Đã huỷ" },
            { value: "false", label: "Đã xoá" },
          ]}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          style={{ width: 200 }}
          placeholder="Chọn tiến độ"
          value={progressFilter}
          options={[
            { value: "Chưa tới ngày bắt đầu", label: "Chưa tới ngày bắt đầu" },
            { value: "Sắp tới hạn", label: "Sắp tới hạn" },
            { value: "Đang thực hiện", label: "Đang thực hiện" },
            { value: "Quá hạn", label: "Quá hạn" },
            { value: "Hoàn thành", label: "Hoàn thành" },
          ]}
          onChange={(value) => {
            setProgressFilter(value);
            setPage(1);
          }}
        />

        {/* Button chuyển đổi view mode */}
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <Button
            type={viewMode === "table" ? "primary" : "default"}
            icon={<TableOutlined />}
            style={{
              background: viewMode === "table" ? "#23643A" : undefined,
              border: viewMode === "table" ? 0 : undefined,
              borderRadius: 8,
            }}
            onClick={() => setViewMode("table")}
          >
            Bảng
          </Button>
          <Button
            type={viewMode === "gantt" ? "primary" : "default"}
            icon={<BarChartOutlined />}
            style={{
              background: viewMode === "gantt" ? "#23643A" : undefined,
              border: viewMode === "gantt" ? 0 : undefined,
              borderRadius: 8,
            }}
            onClick={() => setViewMode("gantt")}
          >
            Gantt Chart
          </Button>
          <Button 
          type="primary"
          style={{ background: "#23643A", border: 0, borderRadius: 8 }}
          onClick={() => {
            // Đảm bảo farmId được gửi đúng theo quyền của user
            let exportFarmId = selectedFarmId;
            if (user?.role === "expert" && !selectedFarmId) {
              // Expert không chọn farm thì gửi tất cả farm của họ
              exportFarmId = farmIds?.map(f => f.farm._id);
            } else if (user?.role === "farmAdmin") {
              // Farm admin chỉ có thể export farm của mình
              exportFarmId = user.farmId;
            }
            
            exportExcel({
              farmId: exportFarmId,
              gardenId: selectedGardenId,
              keyword,
              // startDate: startDateFilter ? startDateFilter.format('YYYY-MM-DD') : undefined,
              // endDate: endDateFilter ? endDateFilter.format('YYYY-MM-DD') : undefined,
            })
          }} >
          Xuất Excel
        </Button>
        </div>
      </div>

      {/* Gantt Chart Controls - chỉ hiện khi ở mode gantt */}
      {viewMode === "gantt" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            padding: "12px",
            background: "#f8fafb",
            borderRadius: "8px",
            border: "1px solid #e8eaed",
          }}
        >
          <span style={{ fontWeight: 500, color: "#23643A", marginRight: 8 }}>
            Gantt View:
          </span>
          <Button
            size="small"
            type={ganttView === ViewMode.Day ? "primary" : "default"}
            onClick={() => setGanttView(ViewMode.Day)}
            style={{
              background: ganttView === ViewMode.Day ? "#23643A" : undefined,
              border: ganttView === ViewMode.Day ? 0 : undefined,
            }}
          >
            Ngày
          </Button>
          <Button
            size="small"
            type={ganttView === ViewMode.Week ? "primary" : "default"}
            onClick={() => setGanttView(ViewMode.Week)}
            style={{
              background: ganttView === ViewMode.Week ? "#23643A" : undefined,
              border: ganttView === ViewMode.Week ? 0 : undefined,
            }}
          >
            Tuần
          </Button>
          <Button
            size="small"
            type={ganttView === ViewMode.Month ? "primary" : "default"}
            onClick={() => setGanttView(ViewMode.Month)}
            style={{
              background: ganttView === ViewMode.Month ? "#23643A" : undefined,
              border: ganttView === ViewMode.Month ? 0 : undefined,
            }}
          >
            Tháng
          </Button>
          {/* <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "14px", color: "#666" }}>Hiển thị danh sách:</span>
            <Button
              size="small"
              type={showTaskList ? "primary" : "default"}
              onClick={() => setShowTaskList(!showTaskList)}
              style={{ 
                background: showTaskList ? "#23643A" : undefined,
                border: showTaskList ? 0 : undefined
              }}
            >
              {showTaskList ? "Có" : "Không"}
            </Button>
          </div> */}
        </div>
      )}

      {/* Filter thời gian */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
          padding: "16px",
          background: "#f8fafb",
          borderRadius: "8px",
          border: "1px solid #e8eaed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 500, color: "#23643A" }}>
            Bộ lọc thời gian:
          </span>
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
            setStatusFilter(undefined);
            setProgressFilter(undefined);
            setPage(1);
          }}
          style={{
            borderRadius: 8,
            background: "#ff4d4f",
            borderColor: "#ff4d4f",
            color: "white",
          }}
          disabled={!hasActiveFilters()}
        >
          Xóa bộ lọc ({getActiveFilterCount()})
        </Button>
      </div>

      {/* Hiển thị thông tin filter đang áp dụng */}
      {hasActiveFilters() && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            background: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
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
              Ngày bắt đầu:{" "}
              <strong>{startDateFilter.format("DD/MM/YYYY")}</strong>
            </span>
          )}
          {endDateFilter && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Ngày kết thúc:{" "}
              <strong>{endDateFilter.format("DD/MM/YYYY")}</strong>
            </span>
          )}
          {statusFilter && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Trạng thái: <strong>{statusLabel[statusFilter] || statusFilter}</strong>
            </span>
          )}
          {progressFilter && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Tiến độ: <strong>{progressFilter}</strong>
            </span>
          )}
        </div>
      )}

      {/* ========== DATA DISPLAY ========== */}
      {viewMode === "table" ? (
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
      ) : (
        <div style={{ marginTop: 16 }}>
          {ganttData && ganttData.length > 0 ? (
            <div style={{
              ...(ganttView === ViewMode.Day && {
                overflowX: 'auto',
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                background: '#fff'
              })
            }}>
              <Gantt
              tasks={ganttData}
              viewMode={ganttView}
              onDateChange={handleTaskChange}
              onDelete={handleTaskDelete}
              onProgressChange={handleProgressChange}
              onDoubleClick={handleDblClick}
              onSelect={handleSelect}
              onExpanderClick={handleExpanderClick}
              listCellWidth={showTaskList ? (ganttView === ViewMode.Day ? "250px" : "200px") : ""}
              columnWidth={
                ganttView === ViewMode.Month
                  ? 300
                  : ganttView === ViewMode.Week
                  ? 250
                  : 80
              }
              barBackgroundColor={ganttView === ViewMode.Day ? "#1e4d2b" : "#23643A"}
              rowHeight={ganttView === ViewMode.Day ? 35 : 40}
              fontSize={ganttView === ViewMode.Day ? 10 : 12}
              locale="vi-VN"
              preStepsCount={ganttView === ViewMode.Day ? 2 : 1}
              postStepsCount={ganttView === ViewMode.Day ? 2 : 1}
              todayColor={ganttView === ViewMode.Day ? "#ff7875" : "#ff4d4f"}
              rtl={false}
              gridLineStartWidth={ganttView === ViewMode.Day ? 1 : 0}
              gridLineEndWidth={ganttView === ViewMode.Day ? 1 : 0}
              gridLineColor={ganttView === ViewMode.Day ? "#e8eaed" : "#f0f0f0"}
              gridLineStartColor={ganttView === ViewMode.Day ? "#e8eaed" : "#f0f0f0"}
              gridLineEndColor={ganttView === ViewMode.Day ? "#e8eaed" : "#f0f0f0"}
              gridLineStartDasharray={ganttView === ViewMode.Day ? "5,5" : "0"}
              gridLineEndDasharray={ganttView === ViewMode.Day ? "5,5" : "0"}
              gridLineStartOpacity={ganttView === ViewMode.Day ? 0.5 : 0}
              gridLineEndOpacity={ganttView === ViewMode.Day ? 0.5 : 0}
              gridLineStartDashoffset={ganttView === ViewMode.Day ? 0 : 0}
              gridLineEndDashoffset={ganttView === ViewMode.Day ? 0 : 0}
              gridLineStartDashcap={ganttView === ViewMode.Day ? "round" : "butt"}
              gridLineEndDashcap={ganttView === ViewMode.Day ? "round" : "butt"}
              gridLineStartDashjoin={ganttView === ViewMode.Day ? "round" : "miter"}
              gridLineEndDashjoin={ganttView === ViewMode.Day ? "round" : "miter"}
              gridLineStartDashmiterlimit={ganttView === ViewMode.Day ? 10 : 0}
              gridLineEndDashmiterlimit={ganttView === ViewMode.Day ? 10 : 0}
              gridLineStartDashpath={ganttView === ViewMode.Day ? "M0,0 L10,0" : ""}
              gridLineEndDashpath={ganttView === ViewMode.Day ? "M0,0 L10,0" : ""}
              gridLineStartDashpattern={ganttView === ViewMode.Day ? "5,5" : ""}
              gridLineEndDashpattern={ganttView === ViewMode.Day ? "5,5" : ""}
              gridLineStartDashpatternoffset={ganttView === ViewMode.Day ? 0 : 0}
              gridLineEndDashpatternoffset={ganttView === ViewMode.Day ? 0 : 0}
              gridLineStartDashpatternlength={ganttView === ViewMode.Day ? 10 : 0}
              gridLineEndDashpatternlength={ganttView === ViewMode.Day ? 10 : 0}
              gridLineStartDashpatternspacing={ganttView === ViewMode.Day ? 5 : 0}
              gridLineEndDashpatternspacing={ganttView === ViewMode.Day ? 5 : 0}
              gridLineStartDashpatternrepeat={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeat={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineStartDashpatternrepeatx={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeatx={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineStartDashpatternrepeaty={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeaty={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineStartDashpatternrepeatz={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeatz={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineStartDashpatternrepeata={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeata={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineStartDashpatternrepeatb={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeatb={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineStartDashpatternrepeatc={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              gridLineEndDashpatternrepeatc={ganttView === ViewMode.Day ? "repeat" : "no-repeat"}
              headerHeight={ganttView === ViewMode.Day ? 60 : 50}
              barCornerRadius={ganttView === ViewMode.Day ? 2 : 4}
              arrowColor={ganttView === ViewMode.Day ? "#1e4d2b" : "#23643A"}
              fontFamily={ganttView === ViewMode.Day ? "Inter, Arial, sans-serif" : "Arial, sans-serif"}
            />
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
                background: "#f8fafb",
                borderRadius: "8px",
                border: "1px solid #e8eaed",
              }}
            >
              <p>Không có dữ liệu để hiển thị Gantt Chart</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                {filteredTasks.length === 0
                  ? "Không tìm thấy công việc nào phù hợp với bộ lọc"
                  : "Các công việc hiện tại không có ngày bắt đầu hợp lệ"}
              </p>
            </div>
          )}
        </div>
      )}
      <Modal
        title="Chi tiết công việc"
        open={taskDetailOpen}
        onCancel={() => setTaskDetailOpen(false)}
        footer={null}
        width={600}
      >
        {taskDetail ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên">{taskDetail.name}</Descriptions.Item>
            <Descriptions.Item label="Loại">
              {typeLabel[taskDetail.type] || taskDetail.type}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {taskDetail.start
                ? new Date(taskDetail.start).toLocaleDateString("vi-VN")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {taskDetail.end
                ? new Date(taskDetail.end).toLocaleDateString("vi-VN")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {taskDetail?.createdBy?.fullName || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Tiến độ">
              {statusLabel[taskDetail.progressFilter] || taskDetail.progressFilter}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {statusLabel[taskDetail.status] || taskDetail.status}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Modal>

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
