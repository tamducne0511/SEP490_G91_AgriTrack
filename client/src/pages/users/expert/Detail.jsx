import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Descriptions,
  Button,
  Spin,
  Tag,
  Space,
  Card,
  Image,
  message,
} from "antd";
import ExpertModal from "./ExpertModal";
import AssignFarmModal from "./AssignFarmModal";
import { useUserStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userDetail, fetchUserDetail, updateUser, assignUserToFarm, loading } =
    useUserStore();
  const [editModal, setEditModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const expert = userDetail?.user || {};
  const farm = userDetail?.farm || null;

  const refreshDetail = async () => {
    try {
      await fetchUserDetail(id);
    } catch {
      message.error("Không tìm thấy chuyên gia!");
      navigate("/experts");
    }
  };

  useEffect(() => {
    refreshDetail();
    // eslint-disable-next-line
  }, [id]);

  const handleEdit = async (values) => {
    setConfirmLoading(true);
    try {
      await updateUser(id, values);
      message.success("Cập nhật chuyên gia thành công!");
      setEditModal(false);
      refreshDetail();
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleAssignFarm = async (farmId) => {
    if (!farmId) return;
    try {
      await assignUserToFarm(farmId, id);
      message.success("Gán vườn thành công!");
      setAssignModal(false);
      refreshDetail();
    } catch {}
  };

  if (loading) return <Spin />;
  if (!expert?._id) return null;

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
      {/* Cột trái: Info chuyên gia */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Space style={{ marginBottom: 18 }}>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
          <Button onClick={() => setEditModal(true)} type="primary">
            Sửa thông tin
          </Button>
          <Button onClick={() => setAssignModal(true)} type="dashed">
            Gán vườn
          </Button>
        </Space>
        <Descriptions
          bordered
          column={1}
          title="Thông tin chuyên gia"
          labelStyle={{ width: 150, fontWeight: 500 }}
        >
          <Descriptions.Item label="Tên chuyên gia">
            {expert.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{expert.email}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={expert.status ? "green" : "red"}>
              {expert.status ? "Đang làm việc" : "Nghỉ việc"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(expert.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>

        <ExpertModal
          open={editModal}
          isEdit={true}
          initialValues={expert}
          confirmLoading={confirmLoading}
          onOk={handleEdit}
          onCancel={() => setEditModal(false)}
        />
        <AssignFarmModal
          open={assignModal}
          userId={id}
          onOk={handleAssignFarm}
          onCancel={() => setAssignModal(false)}
        />
      </div>

      {/* Cột phải: Info vườn */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Card
          title="Vườn đang quản lý"
          style={{
            borderRadius: 10,
            minHeight: 260,
            background: "#f8fafc",
          }}
        >
          {farm ? (
            <div style={{ display: "flex", gap: 18 }}>
              <Image
                src={ImageBaseUrl + farm.image}
                width={100}
                height={100}
                style={{
                  objectFit: "cover",
                  borderRadius: 10,
                  background: "#eee",
                }}
                alt="Ảnh vườn"
                fallback="https://placehold.co/100x100?text=No+Image"
                preview
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
                  {farm.name}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <b>Địa chỉ:</b> {farm.address}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <b>Mô tả:</b> {farm.description}
                </div>
                <div>
                  <b>Trạng thái:</b>{" "}
                  <Tag color={farm.status ? "green" : "red"}>
                    {farm.status ? "Đang hoạt động" : "Không hoạt động"}
                  </Tag>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "#888", fontStyle: "italic", padding: 16 }}>
              Chưa gán vườn cho chuyên gia này
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
