import { RoutePaths } from "@/routes";
import { useFarmerStore } from "@/stores";
import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Table, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FarmerModal from "./FarmerModal";

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchFarmers({ page, keyword });
  }, [page, keyword, fetchFarmers]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleAdd = async (values) => {
    setConfirmLoading(true);
    try {
      await createFarmer(values);
      message.success("Thêm nông dân thành công!");
      setModalOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteFarmer(record._id);
      message.success("Xoá nông dân thành công!");
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
          <Tooltip title="Xoá">
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
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
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
          Thêm nông dân
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
