import { useEquipmentStore } from "@/stores";
import { Button, Input, message, Table, Tooltip, Modal } from "antd";
import { useEffect, useState, useMemo, useRef } from "react";
import { SearchOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";

export default function EquipmentChangeList() {
  const {
    equipmentChanges,
    ecPagination,
    ecLoading,
    ecError,
    fetchEquipmentChanges,
    approveEquipmentChange,
    rejectEquipmentChange,
    equipments,
    fetchEquipments,
  } = useEquipmentStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const isSearching = useRef(false);

  // Lấy danh sách thiết bị khi mount
  useEffect(() => {
    fetchEquipments(); // lấy all, hoặc truyền pageSize lớn để lấy hết
  }, [fetchEquipments]);

  useEffect(() => {
    fetchEquipmentChanges({ page, status: "all", keyword });
  }, [page, keyword, fetchEquipmentChanges]);

  // Reset page khi keyword thay đổi (chỉ khi search, không phải khi pagination)
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  useEffect(() => {
    if (ecError) message.error(ecError);
  }, [ecError]);

  // Tạo map equipmentId => name
  const equipmentMap = useMemo(() => {
    const map = {};
    (equipments || []).forEach(eq => {
      map[eq._id] = eq.name;
    });
    return map;
  }, [equipments]);

  const handleApprove = async (id) => {
    try {
      await approveEquipmentChange(id);
      message.success("Duyệt thành công!");
    } catch (er) {
      message.error(er?.message || "Lỗi duyệt!");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await rejectEquipmentChange(id, reason);
      message.success("Từ chối thành công!");
      setRejectingId(null);
    } catch (er) {
      message.error(er?.message || "Lỗi từ chối!");
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, idx) => (page - 1) * (ecPagination.pageSize || 10) + idx + 1,
      align: "center",
      width: 70,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentId",
      key: "equipmentId",
      align: "center",
      width: 180,
      render: (equipmentId) => equipmentMap[equipmentId] || equipmentId,
    },
    {
      title: "Loại thay đổi",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 110,
      render: (type) => (type === "import" ? "Nhập" : "Xuất"),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 120,
      render: (price) => price?.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => {
        if (status === "pending") return <span style={{ color: "#f39c12" }}>Chờ duyệt</span>;
        if (status === "approved") return <span style={{ color: "#27ae60" }}>Đã duyệt</span>;
        if (status === "rejected") return <span style={{ color: "#e74c3c" }}>Từ chối</span>;
        return status;
      }
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: "#23643A", borderRadius: 6 }}
                  onClick={() => handleApprove(record._id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="default"
                  danger
                  icon={<CloseOutlined />}
                  style={{ borderRadius: 6 }}
                  onClick={() => setRejectingId(record._id)}
                />
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  // Modal nhập lý do từ chối
  const [rejectReason, setRejectReason] = useState("");
  const handleRejectOk = () => {
    if (!rejectReason) return message.error("Vui lòng nhập lý do từ chối");
    handleReject(rejectingId, rejectReason);
    setRejectReason("");
  };

  return (
    <div style={{ background: "#fff", borderRadius: 13, padding: 24, boxShadow: "0 2px 12px #00000013" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <Input
          allowClear
          placeholder="Tìm kiếm theo thiết bị"
          prefix={<SearchOutlined style={{ color: "#23643A" }} />}
          style={{
            width: 260,
            borderRadius: 8,
            border: "1.5px solid #23643A",
            background: "#fafafa",
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
        dataSource={equipmentChanges}
        loading={ecLoading}
        pagination={{
          current: page,
          total: ecPagination?.total,
          pageSize: ecPagination?.pageSize,
          onChange: setPage,
          showSizeChanger: false,
        }}
        bordered
        scroll={{ x: "max-content" }}
      />
      <Modal
        open={!!rejectingId}
        title="Nhập lý do từ chối"
        onOk={handleRejectOk}
        onCancel={() => { setRejectingId(null); setRejectReason(""); }}
        okText="Từ chối"
        cancelText="Huỷ"
      >
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối"
        />
      </Modal>
    </div>
  );
}
