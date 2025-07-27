import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Popconfirm,
  Select,
  Tag,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEquipmentStore, useEquipmentCategoryStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes";
import { ImageBaseUrl } from "@/variables/common";
import EquipmentModal from "./EquipmentModal";

export default function EquipmentList() {
  // Store hooks
  const {
    equipments,
    pagination,
    loading,
    error,
    fetchEquipments,
    deleteEquipment,
    createEquipment,
  } = useEquipmentStore();

  const { categories, fetchCategories } = useEquipmentCategoryStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch category on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch equipment mỗi khi filter hoặc page thay đổi
  useEffect(() => {
    fetchEquipments({
      page,
      keyword,
      categoryId: categoryFilter,
    });
  }, [page, keyword, categoryFilter, fetchEquipments]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // Modal OK handler
  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      await createEquipment(values);
      message.success("Thêm thiết bị thành công!");
      setModal({ open: false, edit: false, initial: {} });
      fetchEquipments({ page, keyword, categoryId: categoryFilter });
    } catch (err) {
      message.error("Đã xảy ra lỗi");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Xoá thiết bị
  const handleDelete = async (record) => {
    try {
      await deleteEquipment(record._id);
      message.success("Xoá thiết bị thành công!");
      fetchEquipments({ page, keyword, categoryId: categoryFilter });
    } catch {}
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (categoryId) => {
        const cat = categories.find((c) => c._id === categoryId);
        return cat ? <Tag color="geekblue">{cat.name}</Tag> : "";
      },
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (img) =>
        img ? (
          <img
            src={img.startsWith("http") ? img : ImageBaseUrl + img}
            alt="Ảnh"
            style={{ width: 60, borderRadius: 4, objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "#ccc" }}>Không có</span>
        ),
      width: 80,
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ fontSize: 18, color: "#23643A" }} />}
              onClick={() => navigate(RoutePaths.EQUIPMENT_DETAIL(record._id))} // Navigate to equipment detail page
            />
          </Tooltip>

          <Tooltip title="Xoá thiết bị">
            <Popconfirm
              title="Bạn chắc chắn muốn xoá thiết bị này?"
              okText="Xoá"
              cancelText="Huỷ"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined style={{ fontSize: 18, color: "red" }} />}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
      width: 120,
    },
  ];

  const tableHeaderStyle = {
    backgroundColor: "#23643A", // Đổi màu nền của header thành xanh
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
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A", borderRadius: 8 }}
          onClick={() => setModal({ open: true, edit: false, initial: {} })} // Modal thêm thiết bị
        >
          Thêm thiết bị
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên thiết bị"
          style={{
            width: 280,
            borderRadius: 8,
            border: "1.5px solid #23643A",
            background: "#f8fafb",
          }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
        <Select
          allowClear
          style={{ width: 220, borderRadius: 8 }}
          placeholder="Lọc theo danh mục"
          value={categoryFilter}
          options={categories.map((c) => ({
            value: c._id,
            label: c.name,
          }))}
          onChange={setCategoryFilter}
        />
      </div>
      {/* Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={equipments}
        loading={loading}
        pagination={{
          current: page,
          total: pagination.total,
          pageSize: pagination.pageSize,
          onChange: setPage,
          showSizeChanger: false,
        }}
        bordered
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

      {/* Modal */}
      <EquipmentModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk} // Handle form submission
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
        categories={categories}
      />
    </div>
  );
}
