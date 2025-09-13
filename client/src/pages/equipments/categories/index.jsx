import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Input, Popconfirm, message, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEquipmentCategoryStore } from "@/stores";
import EquipmentCategoryModal from "./CategoryModal";
import { ImageBaseUrl } from "@/variables/common";

/**
 * Mapping trạng thái danh mục thiết bị sang text hiển thị
 */
const statusLabel = {
  false: "Đã xoá",
  true: "Hoạt động",
};

/**
 * Mapping trạng thái danh mục thiết bị sang màu sắc hiển thị
 */
const statusColor = {
  false: "red",
  true: "green",
};
/**
 * Component trang danh sách danh mục thiết bị
 * Hiển thị bảng danh mục với các chức năng CRUD
 */
export default function EquipmentCategoryList() {
  // Lấy state và actions từ store quản lý danh mục thiết bị
  const {
    categories,      // Danh sách danh mục thiết bị
    loading,         // Trạng thái loading khi fetch dữ liệu
    error,           // Lỗi từ API
    fetchCategories, // Action fetch danh sách danh mục
    createCategory,  // Action tạo danh mục mới
    updateCategory,  // Action cập nhật danh mục
    deleteCategory,  // Action xóa danh mục
    pagination,      // Thông tin phân trang
  } = useEquipmentCategoryStore();

  // State quản lý giao diện
  const [keyword, setKeyword] = useState(""); // Từ khóa tìm kiếm
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} }); // State modal
  const [confirmLoading, setConfirmLoading] = useState(false); // Loading khi submit form
  const [page, setPage] = useState(1); // Trang hiện tại
  const isSearching = useRef(false); // Cờ đánh dấu đang search để reset page

  // Effect fetch dữ liệu khi component mount hoặc page/keyword thay đổi
  useEffect(() => {
    fetchCategories({ page, keyword });
  }, [page, keyword, fetchCategories]);

  // Effect reset page về 1 khi keyword thay đổi (chỉ khi search, không phải khi pagination)
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  // Effect hiển thị thông báo lỗi khi có error từ store
  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  /**
   * Xử lý submit form modal (thêm mới hoặc cập nhật danh mục)
   * @param {object} values - Dữ liệu từ form
   */
  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      if (modal.edit) {
        // Cập nhật danh mục hiện có
        await updateCategory(modal.initial._id, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        // Tạo danh mục mới
        await createCategory(values);
        message.success("Thêm danh mục thành công!");
      }
      // Đóng modal và refresh danh sách
      setModal({ open: false, edit: false, initial: {} });
      fetchCategories();
    } catch {}
    setConfirmLoading(false);
  };

  /**
   * Xử lý xóa danh mục thiết bị
   * @param {object} record - Bản ghi danh mục cần xóa
   */
  const handleDelete = async (record) => {
    try {
      await deleteCategory(record._id);
      message.success("Xoá danh mục thành công!");
      fetchCategories(); // Refresh danh sách sau khi xóa
    } catch {}
  };

  /**
   * Cấu hình các cột cho bảng danh mục thiết bị
   */
  const columns = [
    {
      title: "STT",
      render: (_, __, idx) => idx + 1, // Hiển thị số thứ tự
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
          // Hiển thị ảnh nếu có, xử lý URL ảnh
          <img
            src={img.startsWith("http") ? img : ImageBaseUrl + img}
            alt="Ảnh"
            style={{ width: 60, borderRadius: 4 }}
          />
        ) : (
          // Hiển thị text "Không có" nếu không có ảnh
          <span style={{ color: "#ccc" }}>Không có</span>
        ),
      width: 80,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        // Hiển thị trạng thái bằng Tag với màu sắc tương ứng
        <Tag color={statusColor[status] || "default"}>
          {statusLabel[status] || status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      render: (_, record) => (
        <span>
          {/* Nút chỉnh sửa danh mục */}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() =>
              setModal({ open: true, edit: true, initial: record })
            }
          />
          {/* Nút xóa với xác nhận */}
          <Popconfirm
            title="Bạn chắc chắn muốn xoá danh mục này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Button
              type="link"
              icon={
                <span
                  className="anticon"
                  style={{ color: "red", fontSize: 18 }}
                >
                  🗑️
                </span>
              }
              danger
            />
          </Popconfirm>
        </span>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      {/* Thanh công cụ với nút thêm và ô tìm kiếm */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        {/* Nút thêm danh mục mới */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A" }}
          onClick={() => setModal({ open: true, edit: false, initial: {} })}
        >
          Thêm danh mục
        </Button>
        {/* Ô tìm kiếm danh mục */}
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên/mô tả"
          style={{ width: 280 }}
          onChange={(e) => {
            isSearching.current = true; // Đánh dấu đang search để reset page
            setKeyword(e.target.value);
          }}
          value={keyword}
        />
      </div>
      
      {/* Bảng hiển thị danh sách danh mục thiết bị */}
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
      
      {/* Modal thêm/sửa danh mục thiết bị */}
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
