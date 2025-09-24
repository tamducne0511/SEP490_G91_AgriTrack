import { useTaskStore } from "@/stores/taskStore";
import { SearchOutlined, EyeOutlined, DeleteOutlined, BarChartOutlined, TableOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Button,
  Input,
  Table,
  Tag,
  message,
  Typography,
  Tooltip,
  Popconfirm,
  Select,
  DatePicker,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes";
import { ViewMode, Gantt } from "gantt-task-react";

const { Title } = Typography;
const { RangePicker } = DatePicker;

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

const typeLabel = {
  collect: "Thu hoạch",
  "task-care": "Chăm sóc",
};

const typeColor = {
  collect: "geekblue",
  "task-care": "green",
};

export default function FarmerTaskList() {
  const { tasks, pagination, loading, error, fetchTasksFarmer, deleteTask } =
    useTaskStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" hoặc "gantt"
  const [ganttView, setGanttView] = useState(ViewMode.Month); // ViewMode cho Gantt
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [progressFilter, setProgressFilter] = useState(undefined);
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const navigate = useNavigate();

  // Hàm kiểm tra có filter nào đang được áp dụng không
  const hasActiveFilters = () => {
    return (
      startDateFilter ||
      endDateFilter ||
      keyword ||
      progressFilter
    );
  };

  // Hàm đếm số filter đang được áp dụng
  const getActiveFilterCount = () => {
    let count = 0;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (keyword) count++;
    if (progressFilter) count++;
    return count;
  };

  // Màu theo tiến độ số từ backend
  const getTaskColor = (task) => {
    const p = Number.isFinite(task?.progress) ? task.progress : 0;
    if (p >= 100) return "#52c41a"; // hoàn thành
    if (p > 0) return "#1890ff"; // đang thực hiện
    return "#d9d9d9"; // chưa bắt đầu
  };

  // format dữ liệu của gantt-task-react
  const getGanttData = () => {
    if (!filteredTasks || !Array.isArray(filteredTasks)) {
      return [];
    }

    return filteredTasks
      .map((task) => {
        if (!task || !task._id) return null;

        let startDate = null;
        let endDate = null;

        if (task.startDate) {
          startDate = new Date(task.startDate);
          if (isNaN(startDate.getTime())) {
            startDate = null;
          }
        }

        if (task.endDate) {
          endDate = new Date(task.endDate);
          if (isNaN(endDate.getTime())) {
            endDate = null;
          }
        }

        if (!startDate) return null;

        if (!endDate) {
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }

        if (endDate < startDate) {
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }

        return {
          id: task._id,
          name: task.name || "Chưa có tên",
          start: startDate,
          end: endDate,
          type: "task",
          status: task.status,
          progressFilter: Number.isFinite(task.progress) ? `${task.progress}%` : "0%",
          progress: Number.isFinite(task.progress) ? task.progress : 0,
          styles: {
            progressColor: getTaskColor(task),
            progressSelectedColor: getTaskColor(task),
            backgroundColor: getTaskColor(task),
            backgroundSelectedColor: getTaskColor(task),
          },
        };
      })
      .filter(Boolean);
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
    console.log("Task changed:", task);
    // Logic cập nhật task nếu cần
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
  };

  const handleDblClick = (task) => {
    console.log("Double clicked task:", task);
    navigate(RoutePaths.MY_TASK_DETAIL(task.id));
  };

  useEffect(() => {
    fetchTasksFarmer({ pageSize: 1000 }); // Lấy tất cả tasks
  }, []);

  // Filter dữ liệu ở frontend
  useEffect(() => {
    let filtered = [...allTasks];

    if (keyword) {
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (startDateFilter) {
      const startDate = startDateFilter.toDate();
      filtered = filtered.filter((task) => {
        if (!task.startDate) return false;
        return new Date(task.startDate) >= startDate;
      });
    }

    if (endDateFilter) {
      const endDate = endDateFilter.toDate();
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((task) => {
        if (!task.endDate) return false;
        return new Date(task.endDate) <= endDate;
      });
    }

    if (progressFilter) {
      filtered = filtered.filter((task) => {
        const p = Number.isFinite(task.progress) ? task.progress : 0;
        if (progressFilter === "0%") return p === 0;
        if (progressFilter === "1-49%") return p >= 1 && p <= 49;
        if (progressFilter === "50-99%") return p >= 50 && p <= 99;
        if (progressFilter === "100%") return p === 100;
        return true;
      });
    }

    setFilteredTasks(filtered);
  }, [allTasks, keyword, startDateFilter, endDateFilter, progressFilter]);

  // Cập nhật allTasks khi có dữ liệu mới
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setAllTasks(tasks);
    }
  }, [tasks]);

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
      render: (_, __, idx) => (page - 1) * 10 + idx + 1,
    },
    {
      title: "Tên công việc",
      dataIndex: "name",
      key: "name",
    },
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
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
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
      title: "Tiến độ",
      key: "progress",
      align: "center",
      render: (_, record) => {
        const p = Number.isFinite(record.progress) ? record.progress : 0;
        let color = p >= 100 ? "green" : p > 0 ? "blue" : "default";
        return <Tag color={color}>{p}%</Tag>;
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
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
              onClick={() => navigate(RoutePaths.MY_TASK_DETAIL(record._id))}
            />
          </Tooltip>
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

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
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
        <Select
          allowClear
          style={{ width: 200 }}
          placeholder="Chọn tiến độ (%)"
          value={progressFilter}
          options={[
            { value: "0%", label: "0%" },
            { value: "1-49%", label: "1-49%" },
            { value: "50-99%", label: "50-99%" },
            { value: "100%", label: "100%" },
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
        </div>
      </div>

      {/* Gantt Chart Controls - chỉ hiện khi ở mode gantt */}
      {viewMode === "gantt" && (
        <>
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
          </div>

          {/* Legend cho màu sắc tiến độ (theo %) */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
              padding: "12px",
              background: "#f0f8ff",
              borderRadius: "8px",
              border: "1px solid #d6e4ff",
            }}
          >
            <span style={{ fontWeight: 500, color: "#23643A", marginRight: 8 }}>
              Chú thích màu sắc:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 12, backgroundColor: "#52c41a", borderRadius: 2 }}></div>
              <span style={{ fontSize: "12px" }}>100% (Hoàn thành)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 12, backgroundColor: "#1890ff", borderRadius: 2 }}></div>
              <span style={{ fontSize: "12px" }}>1–99% (Đang thực hiện)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 12, backgroundColor: "#d9d9d9", borderRadius: 2 }}></div>
              <span style={{ fontSize: "12px" }}>0% (Chưa bắt đầu)</span>
            </div>
          </div>
        </>
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
                // onSelect={handleSelect}
                // onExpanderClick={handleExpanderClick}
                listCellWidth={ganttView === ViewMode.Day ? "250px" : "200px"}
                columnWidth={
                  ganttView === ViewMode.Month
                    ? 300
                    : ganttView === ViewMode.Week
                    ? 250
                    : 80
                }
                rowHeight={ganttView === ViewMode.Day ? 35 : 40}
                fontSize={ganttView === ViewMode.Day ? 10 : 12}
                locale="vi-VN"
                preStepsCount={ganttView === ViewMode.Day ? 2 : 1}
                postStepsCount={ganttView === ViewMode.Day ? 2 : 1}
                todayColor={ganttView === ViewMode.Day ? "#ff7875" : "#52c41a"}
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
    </div>
  );
}
