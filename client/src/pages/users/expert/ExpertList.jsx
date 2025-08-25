import { RoutePaths } from "@/routes";
import { useUserStore } from "@/stores";
import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Popconfirm, Table, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpertModal from "./ExpertModal";
import emailjs from "@emailjs/browser";

export default function ExpertList() {
  const {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
    activeUser,
  } = useUserStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();
  const [deactivateModal, setDeactivateModal] = useState({
    open: false,
    expert: null,
  });
  const [deactivateMessage, setDeactivateMessage] = useState("");

  const handleDeactivateConfirm = async () => {
    if (!deactivateModal.expert) return;

    const emailData = {
      name: deactivateModal.expert.fullName,
      email: deactivateModal.expert.email,
      message: deactivateMessage,
      time: new Date().toLocaleString("vi-VN"),
    };

    console.log("📨 EmailJS data to send:", emailData);
    console.log("❓ deactivateModal:", deactivateModal);

    try {
      await deleteUser(deactivateModal.expert._id, "expert");
      await emailjs.send(
        "service_qwirn1u",
        "template_s48zz6f",
        emailData,
        "-DtfIEOTZV0sDYXEr"
      );
      message.success("Vô hiệu hoá chuyên gia thành công!");
    } catch (error) {
      console.error("❌ Error deactivating expert:", error);
      message.error("Có lỗi xảy ra khi vô hiệu hoá chuyên gia.");
    } finally {
      setDeactivateModal({ open: false, expert: null });
      setDeactivateMessage("");
    }
  };

  useEffect(() => {
    fetchUsers({ page, role: "expert", keyword });
  }, [page, keyword, fetchUsers]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleAdd = async (values) => {
    setConfirmLoading(true);
    try {
      await createUser({ ...values, role: "expert" });
      message.success("Thêm chuyên gia thành công!");
      setModalOpen(false);
    } catch (error) {
      // Error đã được handle trong store
      console.error("Error creating expert:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteUser(record._id, "expert");
      message.success("Vô hiệu hoá chuyên gia thành công!");
    } catch {}
  };

  const handleActive = async (record) => {
    try {
      await activeUser(record._id, "expert");
      message.success("Kích hoạt chuyên gia thành công!");
    } catch {}
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
      title: "Tên chuyên gia",
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
              onClick={() => navigate(RoutePaths.EXPERT_DETAIL(record._id))}
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
                  setDeactivateModal({ open: true, expert: record })
                }
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kích hoạt lại">
              <Popconfirm
                title="Bạn chắc chắn muốn kích hoạt lại chuyên gia này?"
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

  // Custom header style giống ảnh gửi
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
          Thêm chuyên gia
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
          onChange={(e) => setKeyword(e.target.value)}
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
        title="Vô hiệu hoá chuyên gia"
        open={deactivateModal.open}
        okText="Xác nhận"
        cancelText="Huỷ"
        onOk={handleDeactivateConfirm}
        onCancel={() => setDeactivateModal({ open: false, expert: null })}
      >
        {deactivateModal.expert && (
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
              <strong>Tên chuyên gia:</strong> {deactivateModal.expert.fullName}
            </p>
            <p>
              <strong>Email:</strong> {deactivateModal.expert.email}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(deactivateModal.expert.createdAt).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>
        )}
        <Input.TextArea
          rows={5}
          placeholder="Nhập lý do / nội dung sẽ gửi cho chuyên gia qua email..."
          value={deactivateMessage}
          onChange={(e) => setDeactivateMessage(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Modal>
      <ExpertModal
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
