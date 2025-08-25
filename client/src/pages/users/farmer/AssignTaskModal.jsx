import { Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { useTaskStore } from "@/stores";

export default function AssignTaskModal({
  open,
  farmerId,
  onOk,
  onCancel,
  initialTaskId,
}) {
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(initialTaskId || null);

  useEffect(() => {
    if (open) fetchTasks({ pageSize: 1000 }); // Lấy tất cả tasks
    setSelectedTask(initialTaskId || null);
    // eslint-disable-next-line
  }, [open]);

  // Filter tasks để chỉ hiển thị những task có thể gán được
  const availableTasks = tasks.filter(task => 
    // Chỉ hiển thị task chưa được gán (không có farmerId và status là un-assign)
    !task.farmerId && task.status === "un-assign"
  );

  return (
    <Modal
      title="Gán công việc cho nông dân"
      open={open}
      onOk={() => {
        if (!selectedTask) {
          return;
        }
        onOk(selectedTask);
      }}
      onCancel={onCancel}
      okText="Gán"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Select
        showSearch
        value={selectedTask}
        placeholder="Chọn công việc"
        style={{ width: "100%" }}
        options={availableTasks.map((t) => ({
          value: t._id,
          label: t.name,
        }))}
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
    </Modal>
  );
}
