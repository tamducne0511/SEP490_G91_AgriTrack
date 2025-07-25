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
    if (open) fetchTasks();
    setSelectedTask(initialTaskId || null);
    // eslint-disable-next-line
  }, [open]);

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
        options={tasks.map((t) => ({
          value: t._id,
          label: t.name,
        }))}
        onChange={setSelectedTask}
      />
    </Modal>
  );
}