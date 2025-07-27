import { useEffect, useState } from "react";
import { useTaskQuestionStore, useAuthStore } from "@/stores";
import { Table, Spin, message, Button, Input, Tooltip } from "antd";
import { PlusOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes";

export default function FarmTaskQuestionList() {
  const { farm } = useAuthStore();
  const farmId = farm?._id;

  const { questions, loading, error, fetchQuestions } = useTaskQuestionStore();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Xử lý fetch có keyword
  useEffect(() => {
    if (farmId) fetchQuestions(farmId, { keyword, page });
  }, [farmId, keyword, page]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const columns = [
    {
      title: "STT",
      align: "center",
      width: 70,
      render: (_, __, idx) => (page - 1) * 10 + idx + 1,
    },
    {
      title: "Câu hỏi",
      dataIndex: "title",
      key: "title",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Người hỏi",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (u) => u?.fullName || u?.email,
      align: "left",
      width: 180,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 160,
      render: (v) => v ? new Date(v).toLocaleString("vi-VN") : "",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#23643A", fontSize: 18 }} />}
            onClick={() => navigate(RoutePaths.MY_FARM_TASK_QUESTION_DETAIL(record.treeId))}
          />
        </Tooltip>
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            background: "#23643A",
            border: 0,
            borderRadius: 8,
            fontWeight: 600,
          }}
          onClick={() => navigate(RoutePaths.MY_FARM_TASK_QUESTION_CREATE)}
        >
          Đặt câu hỏi
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
      <h2 style={{ fontWeight: 700, marginBottom: 16, color: "#23643A" }}>
        Danh sách câu hỏi của Farm
      </h2>
      {loading ? (
        <Spin style={{ margin: 48 }} />
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={questions}
          pagination={{
            current: page,
            total: questions.length,
            pageSize: 10,
            showSizeChanger: false,
            onChange: setPage,
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
      )}
    </div>
  );
}
