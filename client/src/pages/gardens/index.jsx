import { useGardenStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Popconfirm, Table, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GardenModal from "./GardenModal";
import { RoutePaths } from "@/routes";
const statusLabel = {
  false: "Đã xoá",
  true: "Hoạt động",
};

const statusColor = {
  false: "red",
  true: "green",
};
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
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchGardens({ page, keyword });
  }, [page, keyword, fetchGardens]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      let imageFile =
        values.image?.[0]?.originFileObj || values.image || undefined;
      if (modal.edit) {
        await updateGarden(modal.initial._id, { ...values, image: imageFile });
        message.success("Cập nhật vườn thành công!");
      } else {
        await createGarden({ ...values, image: imageFile });
        message.success("Thêm vườn thành công!");
      }
      setModal({ open: false, edit: false, initial: {} });
      fetchGardens({ page, keyword });
    } catch (e) {}
    setConfirmLoading(false);
  };

  const handleDelete = async (record) => {
    try {
      await deleteGarden(record._id);
      message.success("Xoá vườn thành công!");
      fetchGardens({ page, keyword });
    } catch {}
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, idx) =>
        (page - 1) * (pagination.pageSize || 10) + idx + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Tên vườn",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      align: "center",
      width: 260,
      ellipsis: true,
    },
    {
      title: "Ảnh vườn",
      dataIndex: "image",
      key: "image",
      align: "center",
      width: 130,
      render: (url) =>
        url ? (
          <img
            src={ImageBaseUrl + url}
            alt=""
            style={{
              height: 46,
              width: 72,
              objectFit: "cover",
              borderRadius: 6,
              boxShadow: "0 2px 6px #0001",
            }}
          />
        ) : (
          <span style={{ color: "#999" }}>Không có ảnh</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={statusColor[status] || "default"}>
          {statusLabel[status] || status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
              style={{ color: "#23643A", fontWeight: 700, borderRadius: 6 }}
              onClick={() => navigate(RoutePaths.GARDEN_DETAIL(record._id))}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn chắc chắn muốn xoá vườn này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title="Xóa">
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
                style={{
                  color: "#b8000b",
                  fontWeight: 700,
                  borderRadius: 6,
                }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 13,
        padding: 24,
        boxShadow: "0 2px 12px #00000013",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            background: "#23643A",
            borderRadius: 7,
            fontWeight: 500,
            padding: "0 18px",
          }}
          onClick={() => setModal({ open: true, edit: false, initial: {} })}
        >
          Thêm vườn
        </Button>
        <Input
          allowClear
          placeholder="Tìm kiếm theo tên"
          prefix={<SearchOutlined style={{ color: "#23643A" }} />}
          style={{
            width: 260,
            borderRadius: 8,
            border: "1.5px solid #23643A",
            background: "#fafafa",
          }}
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
        scroll={{ x: "max-content" }}
        className="garden-table-custom"
      />
      <GardenModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
      />
      <style>
        {`
          .garden-table-custom .ant-table-thead > tr > th {
            background: #23643A !important;
            color: #fff !important;
            font-weight: 700;
            font-size: 15px;
            text-align: center;
            vertical-align: middle;
            white-space: nowrap;
          }
          .garden-table-custom .ant-table-thead > tr > th:first-child {
            border-top-left-radius: 10px !important;
          }
          .garden-table-custom .ant-table-thead > tr > th:last-child {
            border-top-right-radius: 10px !important;
          }
          .garden-table-custom .ant-table-cell {
            font-size: 15px;
          }
          .garden-table-custom .ant-table-tbody > tr > td {
            text-align: center;
            vertical-align: middle;
          }
        `}
      </style>
    </div>
  );
}
