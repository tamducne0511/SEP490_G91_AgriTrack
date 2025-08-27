import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Button, Spin, Tag, Space, Card, message } from "antd";
import { useFarmerStore, useUserStore, useTaskStore } from "@/stores";
import FarmerModal from "./FarmerModal";
import AssignTaskModal from "./AssignTaskModal";
import { RoutePaths } from "@/routes";
import { ImageBaseUrl } from "@/variables/common";
import { adminChangePasswordApi } from "@/services/userService";
import ChangePasswordModal from "@/components/ChangePasswordModal";
export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchUserDetail, userDetail } = useUserStore();
  const { updateFarmer } = useFarmerStore();
  const { assignTaskToFarmer } = useTaskStore(); // ⬅️ thêm từ store task

  const [editModal, setEditModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
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
          <Button danger onClick={() => setPwdModal(true)}>Đổi mật khẩu</Button>
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
          <Descriptions.Item label="Số điện thoại">
            {farmer.phone}
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
          farmId={farm._id} // Truyền farmId để chỉ lấy tasks của farm này
          onOk={handleAssignTask}
          onCancel={() => setAssignModal(false)}
        />
        <ChangePasswordModal
          open={pwdModal}
          loading={pwdLoading}
          onCancel={() => setPwdModal(false)}
          onOk={async ({ newPassword }) => {
            try {
              setPwdLoading(true);
              await adminChangePasswordApi(id, { newPassword });
              message.success("Đổi mật khẩu thành công");
              setPwdModal(false);
            } catch (e) {
              message.error(e?.message || "Đổi mật khẩu thất bại");
            } finally {
              setPwdLoading(false);
            }
          }}
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
                  <b>Loại công việc:</b>{" "}
                  <Tag color={task.type === "collect" ? "geekblue" : "green"}>
                    {task.type === "collect" ? "Thu hoạch" : "Chăm sóc"}
                  </Tag>
                </div>
                <div>
                  <b>Ưu tiên:</b>{" "}
                  <Tag
                    color={
                      task.priority === "high"
                        ? "red"
                        : task.priority === "medium"
                        ? "gold"
                        : "green"
                    }
                  >
                    {task.priority === "high"
                      ? "Cao"
                      : task.priority === "medium"
                      ? "Trung bình"
                      : "Thấp"}
                  </Tag>
                </div>
                <div>
                  <b>Trạng thái:</b>{" "}
                  <Tag color={task.status === "assigned" ? "blue" : "green"}>
                    {task.status === "assigned"
                      ? "Đang hoạt động"
                      : "Hoàn thành"}
                  </Tag>
                </div>
                {task.image && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={
                        task.image.startsWith("http")
                          ? task.image
                          : ImageBaseUrl + task.image
                      }
                      alt="Task"
                      style={{ width: "100%", maxWidth: 300, borderRadius: 8 }}
                    />
                  </div>
                )}
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
