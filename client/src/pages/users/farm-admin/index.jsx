import { RoutePaths } from "@/routes";
import { useUserStore } from "@/stores";
import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Popconfirm, Table, Tag, Tooltip } from "antd";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FarmAdminModal from "./FarmAdminModal";
import emailjs from "@emailjs/browser";

export default function FarmAdminList() {
  const {
    users,
    pagination,
    loading,
    fetchUsers,
    createUser,
    deleteUser,
    activeUser,
  } = useUserStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const isSearching = useRef(false);
  const navigate = useNavigate();

  const [deactivateModal, setDeactivateModal] = useState({
    open: false,
    admin: null,
  });
  const [deactivateMessage, setDeactivateMessage] = useState("");

  useEffect(() => {
    fetchUsers({ page, role: "farm-admin", keyword });
  }, [page, keyword, fetchUsers]);

  // Reset page khi keyword thay đổi (chỉ khi search, không phải khi pagination)
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  const handleAdd = async (values) => {
    setConfirmLoading(true);
    try {
      await createUser({ ...values, role: "farm-admin" });
      setModalOpen(false);
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateModal.admin) return;

    const emailData = {
      name: deactivateModal.admin.fullName,
      email: deactivateModal.admin.email,
      message: deactivateMessage,
      time: new Date().toLocaleString("vi-VN"),
    };

    try {
      await deleteUser(deactivateModal.admin._id, "farm-admin");
      await emailjs.send(
        "service_x8zecr1",
        "template_osa7wau",
        emailData,
        "fHDVN_vT4SV3pDBiN"
      );
      message.success("Vô hiệu hoá chủ trang trại thành công!");
    } catch (error) {
      console.error("❌ Error deactivating farm admin:", error);
      message.error("Có lỗi xảy ra khi vô hiệu hoá chủ trang trại.");
    } finally {
      setDeactivateModal({ open: false, admin: null });
      setDeactivateMessage("");
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteUser(record._id, "farm-admin");
      message.success("Vô hiệu hoá trang trại thành công!");
    } catch { }
  };
  const handleActive = async (record) => {
    const emailData = {
      name: record.fullName,
      email: record.email,
      message: "Tài khoản của bạn đã được kích hoạt lại.",
      time: new Date().toLocaleString("vi-VN"),
    };
    try {
      await activeUser(record._id, "farm-admin");
      // Gửi email thông báo kích hoạt
      await emailjs.send(
        "service_x8zecr1",   // serviceId
        "template_8z4o66x",
        emailData,
        "fHDVN_vT4SV3pDBiN" // publicKey
      );
      message.success("Kích hoạt chủ trang trại thành công!");
    } catch (error) {
      console.error("❌ Error activating farm-admin:", error);
      message.error("Có lỗi xảy ra khi kích hoạt chủ trang trại.");
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 60,
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
    },
    {
      title: "Tên chủ trang trại",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "left",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Đang làm việc" : "Nghỉ việc"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 140,
      render: (value) =>
        value ? new Date(value).toLocaleDateString("vi-VN") : "",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
              onClick={() => navigate(RoutePaths.FARM_ADMIN_DETAIL(record._id))}
            />
          </Tooltip>
          {record.status ? (
            <Tooltip title="Vô hiệu hoá">
              <Button
                type="text"
                danger
                icon={
                  <span
                    className="anticon"
                    style={{ color: "red", fontSize: 18 }}
                  >
                    🗑️
                  </span>
                }
                onClick={() =>
                  setDeactivateModal({ open: true, admin: record })
                }
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kích hoạt lại">
              <Popconfirm
                title="Bạn chắc chắn muốn kích hoạt lại chủ trang trại này?"
                okText="Kích hoạt"
                cancelText="Huỷ"
                onConfirm={() => handleActive(record)}
              >
                <Button
                  type="text"
                  icon={
                    <span
                      className="anticon"
                      style={{ color: "green", fontSize: 18 }}
                    >
                      🔄
                    </span>
                  }
                />
              </Popconfirm>
            </Tooltip>
          )}
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
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            background: "#23643A",
            border: 0,
            borderRadius: 8,
          }}
          onClick={() => setModalOpen(true)}
        >
          Thêm chủ trang trại
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên"
          style={{
            width: 260,
            borderRadius: 8,
            border: "1.5px solid #23643A",
            background: "#f8fafb",
          }}
          onChange={(e) => {
            isSearching.current = true;
            setKeyword(e.target.value);
          }}
          value={keyword}
        />
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: page,
          total: pagination.total,
          pageSize: pagination.pageSize,
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
      <Modal
        title="Vô hiệu hoá chủ trang trại"
        open={deactivateModal.open}
        okText="Xác nhận"
        cancelText="Huỷ"
        onOk={handleDeactivateConfirm}
        onCancel={() => setDeactivateModal({ open: false, admin: null })}
      >
        {deactivateModal.admin && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              background: "#f9fafb",
            }}
          >
            <p>
              <strong>Tên chủ trang trại:</strong>{" "}
              {deactivateModal.admin.fullName}
            </p>
            <p>
              <strong>Email:</strong> {deactivateModal.admin.email}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(deactivateModal.admin.createdAt).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>
        )}
        <Input.TextArea
          rows={5}
          placeholder="Nhập lý do / nội dung sẽ gửi cho chủ trang trại qua email..."
          value={deactivateMessage}
          onChange={(e) => setDeactivateMessage(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Modal>
      <FarmAdminModal
        open={modalOpen}
        isEdit={false}
        initialValues={{}}
        confirmLoading={confirmLoading}
        onOk={handleAdd}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}