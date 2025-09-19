import { useEffect, useState } from "react";
import { RoutePaths } from "@/routes/index";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "@/stores";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Button, Input, DatePicker, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function TaskGarnchart() {
  const { tasks, fetchTasks } = useTaskStore();
  const [ganttData, setGanttData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks({ pageSize: 1000 }); // lấy full dữ liệu task
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks?.length > 0) {
      const data = tasks.map((task) => {
        const start = task.startDate ? new Date(task.startDate) : new Date();
        const end = task.endDate
          ? new Date(task.endDate)
          : new Date(start.getTime() + 24 * 60 * 60 * 1000); // fallback +1 ngày

        return {
          id: task._id,
          name: task.name,
          start,
          end,
          type: "task",
          progress:
            task.status === "completed"
              ? 100
              : task.status === "in-progress"
              ? 50
              : 0,
          styles: {
            progressColor: "#23643A",
            progressSelectedColor: "#52c41a",
          },
        };
      });
      setGanttData(data);
    }
  }, [tasks]);

  // Filter theo text + khoảng thời gian
  const filteredGanttData = ganttData.filter((task) => {
    const matchText = task.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    let matchDate = true;
    if (dateRange?.length === 2) {
      const [startDate, endDate] = dateRange;
      const taskStart = dayjs(task.start);
      const taskEnd = dayjs(task.end);
      // check nếu task nằm trong khoảng hoặc giao với khoảng
      matchDate =
        taskStart.isBefore(endDate, "day") &&
        taskEnd.isAfter(startDate, "day");
    }

    return matchText && matchDate;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A", border: 0, borderRadius: 8 }}
          onClick={() => navigate(RoutePaths.TASK_CREATE)}
        >
          Thêm công việc
        </Button>

        <Input
          placeholder="Tìm kiếm công việc..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />

        <RangePicker
          format="DD/MM/YYYY"
          onChange={(dates) => setDateRange(dates)}
        />
      </div>

      <div style={{ padding: 24, background: "#fff", borderRadius: 12 }}>
        <h2 style={{ marginBottom: 16, color: "#23643A" }}>Biểu đồ Gantt</h2>
        {filteredGanttData.length > 0 ? (
          <Gantt tasks={filteredGanttData} viewMode="Day" locale="vi" />
        ) : (
          <p>Không có dữ liệu để hiển thị</p>
        )}
      </div>
    </div>
  );
}
