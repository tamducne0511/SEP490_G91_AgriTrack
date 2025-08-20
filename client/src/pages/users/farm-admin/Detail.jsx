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
import FarmAdminModal from "./FarmAdminModal";
import AssignFarmModal from "./AssignFarmModal";
import { useUserStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import { RoutePaths } from "@/routes";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { adminChangePasswordApi } from "@/services/userService";

export default function FarmAdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userDetail, fetchUserDetail, updateUser, assignUserToFarm, loading } =
    useUserStore();
  const [editModal, setEditModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const farmAdmin = userDetail?.user || {};
  const farm = userDetail?.farm || null;

  const refreshDetail = async () => {
    try {
      await fetchUserDetail(id);
    } catch {
      message.error("Không tìm thấy chủ trang trại!");
      navigate(RoutePaths.FARM_ADMIN_LIST);
    }
  };

  useEffect(() => {
    refreshDetail();
  }, [id]);

  const handleEdit = async (values) => {
    setConfirmLoading(true);
    try {
      await updateUser(id, values);
      message.success("Cập nhật chủ trang trại thành công!");
      setEditModal(false);
      refreshDetail();
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleAssignFarm = async (farmId) => {
    if (!farmId) return;
    try {
      await assignUserToFarm(farmId, id);
      message.success("Gán trang trại thành công!");
      setAssignModal(false);
      refreshDetail();
    } catch {}
  };

  if (loading) return <Spin />;
  if (!farmAdmin?._id) return null;

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
      {/* Cột trái: Info farm-admin */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Space style={{ marginBottom: 18 }}>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
          <Button type="primary">Thông tin</Button>
          <Button onClick={() => setAssignModal(true)} type="dashed">
            Gán trang trại
          </Button>
          <Button danger onClick={() => setPwdModal(true)}>Đổi mật khẩu</Button>
        </Space>
        <Descriptions
          bordered
          column={1}
          title="Thông tin chủ trang trại"
          labelStyle={{ width: 150, fontWeight: 500 }}
        >
          <Descriptions.Item label="Tên chủ trang trại">
            {farmAdmin.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{farmAdmin.email}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={farmAdmin.status ? "green" : "red"}>
              {farmAdmin.status ? "Đang làm việc" : "Nghỉ việc"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(farmAdmin.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {farmAdmin.phone}
          </Descriptions.Item>
        </Descriptions>

        <FarmAdminModal
          open={editModal}
          isEdit={true}
          initialValues={farmAdmin}
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

      {/* Cột phải: Info trang trại */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Card
          title="Trang trại đang quản lý"
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
                alt="Ảnh trang trại"
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
              Chưa gán trang trại cho chủ trang trại này
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
