import { Modal, Select, Card, Descriptions, Tag, Spin } from "antd";
import { useEffect, useState } from "react";
import { useTaskStore } from "@/stores";

export default function AssignTaskModal({
  open,
  farmerId,
  farmId,
  onOk,
  onCancel,
  initialTaskId,
}) {
  const { tasks, fetchTasks, fetchTaskDetail, taskDetail, loading } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(initialTaskId || null);

  useEffect(() => {
    if (open && farmId) {
      // Chỉ fetch tasks của farm cụ thể và lấy tất cả (pageSize: 1000)
      fetchTasks({ 
        farmId: farmId,
        pageSize: 1000 
      });
    }
    setSelectedTask(initialTaskId || null);
    // eslint-disable-next-line
  }, [open, farmId]);

  // Filter tasks để chỉ hiển thị những task có thể gán được
  const availableTasks = tasks.filter(task => 
    // Chỉ hiển thị task chưa được gán (không có farmerId và status là un-assign)
    !task.farmerId && task.status === "un-assign" && task.gardenId
  );

  useEffect(() => {
    if (selectedTask) {
      fetchTaskDetail(selectedTask);
    }
    // eslint-disable-next-line
  }, [selectedTask]);

  return (
    <Modal
      title="Gán công việc cho nông dân"
      open={open}
      onOk={() => {
        if (!selectedTask) { // Chỉ gán nếu đã chọn task
          return;
        }
        onOk(selectedTask);
      }}
      onCancel={onCancel}
      okText="Gán"
      cancelText="Huỷ"
      destroyOnClose
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Select
            showSearch
            allowClear
            value={selectedTask}
            placeholder="Chọn công việc"
            style={{ width: "100%" }}
            // Chuyển đổi availableTasks thành options cho Select
            options={availableTasks.map((t) => ({
              value: t._id,
              label: t.name,
            }))}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label || "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={setSelectedTask}
          />
          {availableTasks.length === 0 && (
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center', 
              color: '#999',
              fontStyle: 'italic'
            }}>
              Không có công việc nào khả dụng để gán
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Card size="small" title="Chi tiết công việc" bordered>
            {loading && <Spin />}
            {!loading && selectedTask && taskDetail && (
              <Descriptions size="small" column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="Tên">{taskDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Loại">{taskDetail.type}</Descriptions.Item>
              <Descriptions.Item label="Ưu tiên">
                <Tag
                  color={
                    taskDetail.priority === "high"
                      ? "red"
                      : taskDetail.priority === "medium"
                      ? "gold"
                      : "green"
                  }
                >
                  {taskDetail.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bắt đầu">
                {taskDetail.startDate
                  ? new Date(taskDetail.startDate).toLocaleDateString("vi-VN")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Kết thúc">
                {taskDetail.endDate
                  ? new Date(taskDetail.endDate).toLocaleDateString("vi-VN")
                  : "—"}
              </Descriptions.Item>
            
              {/* Bổ sung */}
              <Descriptions.Item label="Trang trại">
                {taskDetail.farmId?.name || "Không xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Vườn">
                {taskDetail.gardenId?.name || "Không xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {taskDetail.createdBy?.fullName || "Không xác định"}
              </Descriptions.Item>
            </Descriptions>
            
            )}
            {!loading && (!selectedTask || !taskDetail) && (
              <div style={{ color: '#999' }}>Chọn một công việc để xem chi tiết</div>
            )}
          </Card>
        </div>
      </div>
    </Modal>
  );
}