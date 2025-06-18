import React, { useEffect, useState } from "react";
import { Table, Button, Input, Popconfirm, Select, Tag, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEquipmentStore, useEquipmentCategoryStore } from "@/stores";
import EquipmentModal from "./EquipmentModal";
import { ImageBaseUrl } from "@/variables/common";

export default function EquipmentList() {
  // Store hooks
  const {
    equipments,
    pagination,
    loading,
    error,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  } = useEquipmentStore();

  const { categories, fetchCategories } = useEquipmentCategoryStore();

  // State
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch category on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch equipment mỗi khi filter hoặc page thay đổi
  useEffect(() => {
    fetchEquipments({
      page,
      name: keyword,
      categoryId: categoryFilter,
    });
  }, [page, keyword, categoryFilter, fetchEquipments]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // Modal submit
  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      if (modal.edit) {
        await updateEquipment(modal.initial._id, values);
        message.success("Cập nhật thiết bị thành công!");
      } else {
        await createEquipment(values);
        message.success("Thêm thiết bị thành công!");
      }
      setModal({ open: false, edit: false, initial: {} });
      // Refresh list
      fetchEquipments({ page, name: keyword, categoryId: categoryFilter });
    } catch {}
    setConfirmLoading(false);
  };

  // Xoá
  const handleDelete = async (record) => {
    try {
      await deleteEquipment(record._id);
      message.success("Xoá thiết bị thành công!");
      fetchEquipments({ page, name: keyword, categoryId: categoryFilter });
    } catch {}
  };

  // Table columns
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
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() =>
              setModal({ open: true, edit: true, initial: record })
            }
          />
          <Popconfirm
            title="Bạn chắc chắn muốn xoá thiết bị này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A" }}
          onClick={() => setModal({ open: true, edit: false, initial: {} })}
        >
          Thêm thiết bị
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên thiết bị"
          style={{ width: 220 }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
        <Select
          allowClear
          style={{ width: 220 }}
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
      />
      {/* Modal */}
      <EquipmentModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
        categories={categories}
      />
    </div>
  );
}
