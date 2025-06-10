import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  message,
  Popconfirm,
  Tooltip,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNotificationStore } from "@/stores";
import NotificationModal from "./NotificationModal";

export default function NotificationList() {
  const {
    notifications,
    pagination,
    loading,
    error,
    fetchNotifications,
    deleteNotification,
  } = useNotificationStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });

  useEffect(() => {
    fetchNotifications({ page, title: keyword });
  }, [page, keyword, fetchNotifications]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (record) => {
    try {
      await deleteNotification(record._id);
      message.success("Xoá thông báo thành công!");
      fetchNotifications({ page, title: keyword });
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
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Nội dung", dataIndex: "content", key: "content" },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) =>
        url ? (
          <Image width={80} src={url} alt="Ảnh" style={{ borderRadius: 6 }} />
        ) : (
          <Tag color="red">Không có ảnh</Tag>
        ),
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("vi-VN") : "",
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
            title="Bạn chắc chắn muốn xoá thông báo này?"
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
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#23643A" }}
          onClick={() => setModal({ open: true, edit: false, initial: {} })}
        >
          Thêm thông báo
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tiêu đề"
          style={{ width: 280 }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={notifications}
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
      <NotificationModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
        afterSubmit={() => {
          setModal({ open: false, edit: false, initial: {} });
          fetchNotifications({ page, title: keyword });
        }}
      />
    </div>
  );
}
