import { RoutePaths } from "@/routes";
import { useAuthStore, useFarmerStore } from "@/stores";
import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Popconfirm, Select, Table, Tag, Tooltip } from "antd";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FarmerModal from "./FarmerModal";
import { activeFarmerApi } from "@/services";
import emailjs from "@emailjs/browser";

export default function FarmerList() {
  const {
    farmers,
    pagination,
    loading,
    error,
    fetchFarmers,
    createFarmer,
    deleteFarmer,
  } = useFarmerStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const isSearching = useRef(false);
  const navigate = useNavigate();
  const { user, farmIds } = useAuthStore();
  const [selectedFarmId, setSelectedFarmId] = useState(undefined);

  useEffect(() => {
    fetchFarmers({
      page,
      keyword,
      farmId: selectedFarmId,
    });
  }, [page, keyword, selectedFarmId, fetchFarmers]);

  // Reset page khi keyword thay đổi (chỉ khi search, không phải khi pagination)
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleAdd = async (values) => {
    setConfirmLoading(true);
    try {
      await createFarmer(values);
      message.success("Thêm nông dân thành công!");
      setModalOpen(false);
    } catch (er) {
      // Error đã được handle trong store
      message.error(er?.message || "Thêm nông dân thành công!");
    } finally {
      setConfirmLoading(false);
    }
  };
  const [deactivateModal, setDeactivateModal] = useState({
    open: false,
    farmer: null,
  });
  const [deactivateMessage, setDeactivateMessage] = useState("");

  const handleDeactivateConfirm = async () => {
    try {
      // Data chuẩn bị gửi cho emailjs
      const emailData = {
        name: deactivateModal.farmer?.fullName,
        email: deactivateModal.farmer?.email,
        message: deactivateMessage,
        time: new Date().toLocaleString("vi-VN"),
      };

      // In ra console cho dễ debug
      console.log("📨 EmailJS data to send:", emailData);

      // Gọi API deactivate farmer
      await deleteFarmer(deactivateModal.farmer._id, deactivateMessage);

      // Gửi mail
      await emailjs.send(
        "service_x8zecr1",
        "template_osa7wau",
        emailData,
        "fHDVN_vT4SV3pDBiN"
      );

      message.success("Vô hiệu hoá thành công và email đã được gửi!");
    } catch (error) {
      console.error("❌ Error in handleDeactivateConfirm:", error);
      message.error("Có lỗi xảy ra!");
    } finally {
      setDeactivateModal({ open: false, farmer: null });
      setDeactivateMessage("");
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteFarmer(record._id);
      message.success("Vô hiệu hoá nông dân thành công!");
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
      await activeFarmerApi(record._id);
      fetchFarmers({ page, keyword });
      // Gửi email thông báo kích hoạt
      await emailjs.send(
        "service_x8zecr1",   // serviceId
        "template_8z4o66x",
        emailData,
        "fHDVN_vT4SV3pDBiN" // publicKey
      );
      message.success("Kích hoạt nông dân thành công!");
    } catch (error) {
      console.error("❌ Error activating farmer:", error);
      message.error("Có lỗi xảy ra khi kích hoạt nông dân.");
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
      title: "Tên nông dân",
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
              onClick={() => navigate(RoutePaths.FARMER_DETAIL(record._id))}
            />
          </Tooltip>
          {record.status ? (
            // Trường hợp Farmer đang active -> Hiển thị nút Deactivate (chỉ cho farm-admin)
            user?.role === "farm-admin" && (
              <Tooltip title="Vô hiệu hoá">
              <Button
                type="text"
                danger
                icon={<span style={{ color: "red", fontSize: 18 }}>🗑️</span>}
                onClick={() =>
                  setDeactivateModal({ open: true, farmer: record })
                }
              />
            </Tooltip>
            )
          ) : (
            // Chỉ farm-admin mới được kích hoạt lại nông dân
            user?.role === "farm-admin" && (
              <Tooltip title="Kích hoạt lại">
                <Popconfirm
                  title="Bạn chắc chắn muốn kích hoạt lại nông dân này?"
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
            )
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
        {user?.role === "farm-admin" && (
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
            Thêm nông dân
          </Button>
        )}
        {user?.role === "expert" && (
          <Select
            allowClear
            style={{ width: 240 }}
            placeholder="Chọn trang trại"
            value={selectedFarmId}
            options={farmIds?.map((f) => ({
              value: f.farm._id,
              label: f.farm.name,
            }))}
            onChange={setSelectedFarmId}
          />
        )}
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
        dataSource={farmers}
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
        title="Nhập nội dung vô hiệu hoá"
        open={deactivateModal.open}
        onOk={handleDeactivateConfirm}
        onCancel={() => setDeactivateModal({ open: false, farmer: null })}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do/nội dung gửi cho farmer..."
          value={deactivateMessage}
          onChange={(e) => setDeactivateMessage(e.target.value)}
        />
      </Modal>
      <FarmerModal
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