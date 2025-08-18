import { RoutePaths } from "@/routes";
import { useFarmStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Popconfirm, Table,Tag, Tooltip } from "antd";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FarmModal from "./FarmModal";
const statusLabel = {
  false: "Đã xoá",
  true: "Hoạt động",
};

const statusColor = {
  false: "red",
  true: "green",
};
export default function FarmList() {
  const {
    farms,
    pagination,
    loading,
    error,
    fetchFarms,
    createFarm,
    deleteFarm,
    updateFarm,
  } = useFarmStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, edit: false, initial: {} });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const isSearching = useRef(false);

  useEffect(() => {
    fetchFarms({ page, keyword });
  }, [page, keyword, fetchFarms]);

  // Reset page khi keyword thay đổi (chỉ khi search, không phải khi pagination)
  useEffect(() => {
    if (isSearching.current) {
      setPage(1);
      isSearching.current = false;
    }
  }, [keyword]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleOk = async (values) => {
    setConfirmLoading(true);
    try {
      let imageFile =
        values.image?.[0]?.originFileObj || values.image || undefined;
      if (modal.edit) {
        await updateFarm(modal.initial._id, {
          ...values,
          image: imageFile,
        });
        message.success("Cập nhật trang trại thành công!");
      } else {
        await createFarm({ ...values, image: imageFile });
        message.success("Thêm trang trại thành công!");
      }
      setModal({ open: false, edit: false, initial: {} });
      fetchFarms({ page, keyword });
    } catch (e) {}
    setConfirmLoading(false);
  };

  const handleDelete = async (record) => {
    try {
      await deleteFarm(record._id);
      message.success("Xoá trang trại thành công!");
      fetchFarms({ page, keyword });
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
      title: "Tên trang trại",
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
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      align: "center",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Ảnh trang trại",
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
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              style={{ color: "#23643A", fontWeight: 700, borderRadius: 6 }}
              onClick={() => navigate(RoutePaths.FARM_DETAIL(record._id))}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn chắc chắn muốn xoá trang trại này?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title="Xóa">
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
      {/* Search/filter bar */}
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
          Thêm trang trại
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
          onChange={(e) => {
            isSearching.current = true;
            setKeyword(e.target.value);
          }}
          value={keyword}
        />
      </div>
      {/* Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={farms}
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
        className="farm-table-custom"
      />
      <FarmModal
        open={modal.open}
        isEdit={modal.edit}
        initialValues={modal.initial}
        confirmLoading={confirmLoading}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, edit: false, initial: {} })}
      />
      {/* Custom CSS cho table header bo góc và full chữ trắng, 1 dòng chữ */}
      <style>
        {`
        .farm-table-custom .ant-table-thead > tr > th {
          background: #23643A !important;
          color: #fff !important;
          font-weight: 700;
          font-size: 15px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }
        .farm-table-custom .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 10px !important;
        }
        .farm-table-custom .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 10px !important;
        }
        .farm-table-custom .ant-table-cell {
          font-size: 15px;
        }
        .farm-table-custom .ant-table-tbody > tr > td {
          text-align: center;
          vertical-align: middle;
        }
        `}
      </style>
    </div>
  );
}
