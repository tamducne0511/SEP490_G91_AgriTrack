import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Button, Spin, Tag, Space, Card, message } from "antd";
import { useFarmerStore, useUserStore, useTaskStore } from "@/stores";
import FarmerModal from "./FarmerModal";
import AssignTaskModal from "./AssignTaskModal";
import { RoutePaths } from "@/routes";

export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchUserDetail, userDetail } = useUserStore();
  const { updateFarmer } = useFarmerStore();
  const { assignTaskToFarmer } = useTaskStore(); // ⬅️ thêm từ store task

  const [editModal, setEditModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const farmer = userDetail?.user || {};
  const farm = userDetail?.farm || {};
  const tasks = userDetail?.tasks || [];

  const refreshDetail = async () => {
    try {
      await fetchUserDetail(id);
    } catch {
      message.error("Không tìm thấy nông dân!");
      navigate(RoutePaths.FARMER_LIST);
    }
  };

  useEffect(() => {
    refreshDetail();
  }, [id]);

  const handleEdit = async (values) => {
    setConfirmLoading(true);
    try {
      await updateFarmer(id, values);
      message.success("Cập nhật nông dân thành công!");
      setEditModal(false);
      refreshDetail();
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleAssignTask = async (taskId) => {
    console.log("Gán công việc:", taskId, "cho nông dân:", id);
    try {
      await assignTaskToFarmer(taskId, id);
      message.success("Gán công việc thành công!");
      setAssignModal(false);
      refreshDetail();
    } catch (err) {
      message.error(err?.message || "Lỗi khi gán công việc");
    }
  };

  if (!farmer?._id) return <Spin style={{ margin: 80 }} />;

  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        alignItems: "flex-start",
        margin: "30px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 4px 24px #0001",
      }}
    >
      {/* Left column: Info */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Space style={{ marginBottom: 18 }}>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
          <Button onClick={() => setEditModal(true)} type="primary">
            Thông tin
          </Button>
          <Button onClick={() => setAssignModal(true)} type="dashed">
            Gán công việc
          </Button>
        </Space>

        <Descriptions
          bordered
          column={1}
          title="Thông tin nông dân"
          labelStyle={{ width: 150, fontWeight: 500 }}
        >
          <Descriptions.Item label="Tên nông dân">
            {farmer.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{farmer.email}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={farmer.status ? "green" : "red"}>
              {farmer.status ? "Đang làm việc" : "Nghỉ việc"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(farmer.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Vườn">
            {farm?.name || "Không xác định"}
          </Descriptions.Item>
        </Descriptions>

        <FarmerModal
          open={editModal}
          isEdit={true}
          initialValues={farmer}
          confirmLoading={confirmLoading}
          onOk={handleEdit}
          onCancel={() => setEditModal(false)}
        />

        <AssignTaskModal
          open={assignModal}
          farmerId={id}
          onOk={handleAssignTask}
          onCancel={() => setAssignModal(false)}
        />
      </div>

      {/* Right column: Task list */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Card
          title="Công việc đang thực hiện"
          style={{
            borderRadius: 10,
            minHeight: 260,
            background: "#f8fafc",
          }}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Card
                key={task._id}
                size="small"
                style={{
                  marginBottom: 16,
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {task.name}
                </div>
                <div>
                  <b>Mô tả:</b> {task.description}
                </div>
                <div>
                  <b>Trạng thái:</b>{" "}
                  <Tag color={task.status ? "green" : "red"}>
                    {task.status ? "Đang hoạt động" : "Đã hoàn thành"}
                  </Tag>
                </div>
              </Card>
            ))
          ) : (
            <div style={{ color: "#888", fontStyle: "italic", padding: 16 }}>
              Chưa gán công việc cho nông dân này
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
