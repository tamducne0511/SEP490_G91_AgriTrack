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
  const { userDetail, fetchUserDetail, updateUser, assignUserToFarm, loading, unassignExpertFromFarm, } =
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
      await assignExpertToFarm(id, farmId);
      message.success("Gán trang trại thành công!");
      setAssignModal(false);
      refreshDetail();
    } catch (err) {
      message.error(err?.message || "Lỗi khi gán trang trại");
    }
  };

  const handleUnassignFarm = async (assignedFarmId) => {
    try {
      await unassignExpertFromFarm(assignedFarmId); // gọi store
      message.success("Bỏ gán thành công!");
      refreshDetail();
    } catch (err) {
      message.error(err?.message || "Lỗi khi bỏ gán");
    }
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
            Gán trang trại
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

      {/* Cột phải: Info trang trại */}
      <div style={{ flex: 1.4, minWidth: 340 }}>
        <Card
          title="Trang trại đang quản lý"
          style={{
            borderRadius: 10,
            minHeight: 260,
            background: "#f8fafc",
          }}
        >
          {Array.isArray(listFarmAssignedExpert) &&
          listFarmAssignedExpert.length > 0 ? (
            listFarmAssignedExpert.map((item) => (
              <div
                key={item?.farm?._id}
                style={{
                  display: "flex",
                  gap: 18,
                  marginBottom: 16,
                  background: "#fff",
                  padding: 12,
                  borderRadius: 10,
                  boxShadow: "0 1px 6px #0000000a",
                  alignItems: "center",
                }}
              >
                <Image
                  src={ImageBaseUrl + item?.farm?.image}
                  width={100}
                  height={100}
                  style={{
                    objectFit: "cover",
                    borderRadius: 10,
                    background: "#eee",
                  }}
                  alt="Ảnh trang trại"
                  fallback="https://placehold.co/100x100?text=No+Image"
                  preview
                />
                <div>
                  <Typography.Title level={5} style={{ marginBottom: 6 }}>
                    {item?.farm?.name}
                  </Typography.Title>

                  <div>
                    <b>Trạng thái:</b>{" "}
                    <Tag color={item?.farm?.status ? "green" : "red"}>
                      {item?.farm?.status
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
                    </Tag>
                  </div>
                </div>
                <Button danger onClick={() => handleUnassignFarm(item._id)}>
                  Bỏ gán
                </Button>
              </div>
            ))
          ) : (
            <Empty description="Chưa được gán vào trang trại nào" />
          )}
        </Card>
      </div>
    </div>
  );
}
