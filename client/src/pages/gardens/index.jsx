import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useGardenStore } from "@/stores";
import GardenModal from "./GardenModal";
import { ImageBaseUrl } from "@/variables/common";

export default function GardenList() {
  const {
    gardens,
    pagination,
    loading,
    error,
    fetchGardens,
    createGarden,
    updateGarden,
    deleteGarden,
  } = useGardenStore();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchGardens({ page, name: keyword });
  }, [page, keyword, fetchGardens]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      if (modal.edit) {
        await updateGarden(modal.initial._id, values);
        message.success("Cập nhật vườn thành công!");
      } else {
        await createGarden(values);
        message.success("Thêm vườn thành công!");
      }
      setModal({ open: false, edit: false, initial: {} });
      fetchGardens({ page, name: keyword });
    } catch {}
    setConfirmLoading(false);
  };

  const handleDelete = async (record) => {
    try {
      await deleteGarden(record._id);
      message.success("Xoá vườn thành công!");
      fetchGardens({ page, name: keyword });
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
    { title: "Tên vườn", dataIndex: "name", key: "name", align: "center" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Ảnh vườn",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (url) =>
        url ? (
          <img
            src={ImageBaseUrl + url}
            alt=""
            style={{
              height: 52,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : null,
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
            title="Bạn chắc chắn muốn xoá vườn này?"
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
          Thêm vườn
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên"
          style={{ width: 220 }}
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={gardens}
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
      <GardenModal
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
