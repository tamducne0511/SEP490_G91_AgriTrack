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
  Select,
  Modal,
} from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useNotificationStore, useUserStore, useAuthStore } from "@/stores";
import NotificationModal from "./NotificationModal";
import { ImageBaseUrl } from "@/variables/common";
import { socket } from "@/services/socket";

export default function NotificationList() {
  const {
    notifications,
    pagination,
    loading,
    error,
    fetchNotifications,
    deleteNotification,
  } = useNotificationStore();

  // Lấy danh sách farm được gán (cho expert)
  const { getListFarmAssignedExpert, listFarmAssignedExpert } = useUserStore();
  const { user, farm } = useAuthStore();
  // Chọn farm để lọc/thêm noti
  const [selectedFarm, setSelectedFarm] = useState();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Lấy list farm cho Select khi user login là expert
  useEffect(() => {
    if (user?._id && user?.role === "expert") {
      getListFarmAssignedExpert(user?._id);
    }
  }, [user]);

  // Lọc noti theo farm, expert phải chọn farm mới fetch được noti
  useEffect(() => {
    if (user?.role === "expert") {
      if (selectedFarm) {
        fetchNotifications({
          page,
          keyword,
          farmId: selectedFarm,
          role: "expert",
        });
      }
    } else if (user?.role) {
      setSelectedFarm(farm?._id || "");
      fetchNotifications({
        page,
        keyword,
        role: user?.role,
      });
    }
  }, [page, keyword, selectedFarm, fetchNotifications, user, farm]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // Lắng nghe realtime notification hỏi đáp
  useEffect(() => {
    const handleNewQuesNoti = (data) => {
      // Khi có notification mới, fetch lại danh sách
      if (user?.role === "expert") {
        if (selectedFarm) {
          fetchNotifications({
            page,
            keyword,
            farmId: selectedFarm,
            role: "expert",
          });
        }
      } else {
        fetchNotifications({
          page,
          keyword,
          role: user?.role,
        });
      }
    };
    socket.on("new-question-notification", handleNewQuesNoti);
    return () => {
      socket.off("new-question-notification", handleNewQuesNoti);
    };
  }, [user, selectedFarm, page, keyword, fetchNotifications]);

  // Xóa noti có confirm popup
  const handleDelete = async (record) => {
    try {
      await deleteNotification(record._id);
      message.success("Xoá thông báo thành công!");
      // Fetch lại cho đúng filter hiện tại
      if (user?.role === "expert") {
        fetchNotifications({
          page,
          keyword,
          farmId: selectedFarm,
          role: "expert",
        });
      } else {
        fetchNotifications({
          page,
          keyword,
          role: user?.role,
        });
      }
    } catch {}
  };

  // Dữ liệu Select farm
  const farmOptions = (listFarmAssignedExpert || []).map(({ farm }) => ({
    label: farm?.name,
    value: farm?._id,
  }));

  // Bắt buộc phải chọn farm mới được thêm noti
  const showAddModal = () => {
    if (user?.role === "expert" && !selectedFarm) {
      Modal.warning({
        title: "Vui lòng chọn trang trại để tạo thông báo!",
      });
      return;
    }
    setEditRecord(null);
    setModalOpen(true);
  };

  const columns = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "left",
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      align: "left",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      align: "center",
      width: 100,
      render: (url) =>
        url ? (
          <Image
            width={80}
            src={ImageBaseUrl + url}
            alt="Ảnh"
            style={{ borderRadius: 8, border: "1px solid #f0f0f0" }}
          />
        ) : (
          <Tag color="red">Không có ảnh</Tag>
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
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#23643A", fontSize: 18 }} />}
              onClick={() => {
                setEditRecord(record);
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <Popconfirm
              title="Bạn chắc chắn muốn xoá thông báo này?"
              okText="Xoá"
              cancelText="Huỷ"
              onConfirm={() => handleDelete(record)}
            >
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
              />
            </Popconfirm>
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
        {user?.role === "expert" && (
          <Select
            options={farmOptions}
            placeholder="Chọn trang trại"
            style={{ width: 220, borderRadius: 8, background: "#fafafa" }}
            value={selectedFarm}
            onChange={setSelectedFarm}
            allowClear
          />
        )}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            background: "#23643A",
            border: 0,
            borderRadius: 8,
          }}
          onClick={showAddModal}
          disabled={user?.role === "expert" && !selectedFarm}
        >
          Thêm thông báo
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tiêu đề"
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
        dataSource={
          user?.role === "expert" && !selectedFarm ? [] : notifications
        }
        loading={loading}
        locale={{
          emptyText:
            user?.role === "expert" && !selectedFarm
              ? "Vui lòng chọn trang trại để xem thông báo."
              : "Không có thông báo nào.",
        }}
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
      <NotificationModal
        open={modalOpen}
        isEdit={!!editRecord}
        initialValues={editRecord || {}}
        farmId={selectedFarm}
        confirmLoading={confirmLoading}
        onOk={() => {
          setModalOpen(false);
          setEditRecord(null);
        }}
        onCancel={() => {
          setModalOpen(false);
          setEditRecord(null);
        }}
      />
    </div>
  );
}
