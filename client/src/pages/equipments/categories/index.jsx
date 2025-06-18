import React, { useEffect, useState } from "react";
import { Table, Button, Input, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEquipmentCategoryStore } from "@/stores";
import EquipmentCategoryModal from "./CategoryModal";
import { ImageBaseUrl } from "@/variables/common";

export default function EquipmentCategoryList() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    pagination,
  } = useEquipmentCategoryStore();

  // State
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [page, setPage] = useState(1);
  // Fetch all categories on mount & khi search
  useEffect(() => {
    fetchCategories({ page, name: keyword });
  }, [page, keyword, fetchCategories]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // Filter hiển thị client-side theo tên
  const filteredData = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      c.description?.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  // Modal submit
  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      if (modal.edit) {
        await updateCategory(modal.initial._id, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(values);
        message.success("Thêm danh mục thành công!");
      }
      setModal({ open: false, edit: false, initial: {} });
      fetchCategories();
    } catch {}
    setConfirmLoading(false);
  };

  // Xoá
  const handleDelete = async (record) => {
    try {
      await deleteCategory(record._id);
      message.success("Xoá danh mục thành công!");
      fetchCategories();
    } catch {}
  };

  // Table columns
  const columns = [
    {
      title: "STT",
      render: (_, __, idx) => idx + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
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
            style={{ width: 60, borderRadius: 4 }}
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
            title="Bạn chắc chắn muốn xoá danh mục này?"
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
          Thêm danh mục
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên/mô tả"
          style={{ width: 280 }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
      </div>
      {/* Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={categories}
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
      <EquipmentCategoryModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
      />
    </div>
  );
}
