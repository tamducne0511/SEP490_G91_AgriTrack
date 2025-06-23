import React, { useEffect, useState } from "react";
import { Table, Button, Input, Tag, message, Popconfirm, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useFarmerStore, useTaskStore } from "@/stores";
import FarmerModal from "./FarmerModal";
import AssignTaskModal from "./AssignTaskModal";

export default function FarmerList() {
  const {
    farmers,
    pagination,
    loading,
    error,
    fetchFarmers,
    createFarmer,
    updateFarmer,
    deleteFarmer,
  } = useFarmerStore();

  const { assignTaskToFarmer } = useTaskStore();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [assignTaskModal, setAssignTaskModal] = useState({
    open: false,
    farmerId: null,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchFarmers({ page, name: keyword });
  }, [page, keyword, fetchFarmers]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      if (modal.edit) {
        await updateFarmer(modal.initial._id, values);
        message.success("Cập nhật nông dân thành công!");
      } else {
        await createFarmer(values);
        message.success("Thêm nông dân thành công!");
      }
      setModal({ open: false, edit: false, initial: {} });
      fetchFarmers({ page, name: keyword });
    } catch {}
    setConfirmLoading(false);
  };

  const handleDelete = async (record) => {
    try {
      await deleteFarmer(record._id);
      message.success("Xoá nông dân thành công!");
      fetchFarmers({ page, name: keyword });
    } catch {}
  };

  const handleAssignTask = async (taskId) => {
    if (!taskId || !assignTaskModal.farmerId) return;
    try {
      await assignTaskToFarmer(taskId, assignTaskModal.farmerId);
      message.success("Gán công việc thành công!");
      setAssignTaskModal({ open: false, farmerId: null });
      fetchFarmers({ page, name: keyword });
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
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Tên nông dân", dataIndex: "fullName", key: "fullName" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
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
            title="Bạn chắc chắn muốn xoá nông dân này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Popconfirm>
          <Button
            type="link"
            style={{ color: "#23643A" }}
            onClick={() =>
              setAssignTaskModal({ open: true, farmerId: record._id })
            }
          >
            Gán task
          </Button>
        </span>
      ),
      width: 240, // tăng width cho đủ chỗ
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
          Thêm nông dân
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên"
          style={{ width: 280 }}
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
      />
      <FarmerModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
      />
      <AssignTaskModal
        open={assignTaskModal.open}
        farmerId={assignTaskModal.farmerId}
        onOk={handleAssignTask}
        onCancel={() => setAssignTaskModal({ open: false, farmerId: null })}
      />
    </div>
  );
}
