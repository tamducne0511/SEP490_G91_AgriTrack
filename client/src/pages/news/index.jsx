import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useNewsStore } from "@/stores";
import { RoutePaths } from "@/routes";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Row,
  Col,
  Spin,
  Switch,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const NewsList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { news, loading, pagination, fetchNews, deleteNews, error } = useNewsStore();
  
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isExpert = user?.role === "expert";

  const loadNews = useCallback(async () => {
    const filters = {
      page: currentPage,
      limit: pageSize,
      status: statusFilter || undefined,
      search: searchText || undefined,
    };
    await fetchNews(filters);
  }, [currentPage, pageSize, statusFilter, searchText, fetchNews]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNews(id);
      message.success("Xóa tin tức thành công");
      loadNews();
    } catch (error) {
      message.error("Xóa tin tức thất bại");
    }
  };

  const handleRefresh = () => {
    setSearchText("");
    setStatusFilter("");
    setCurrentPage(1);
    loadNews();
  };

  

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "orange";
      case "archived":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Đã xuất bản";
      case "draft":
        return "Bản nháp";
      case "archived":
        return "Đã lưu trữ";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text}>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: ["authorId", "fullName"],
      key: "author",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: isExpert ? 180 : 80,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(RoutePaths.NEWS_DETAIL(record._id))}
            />
          </Tooltip>
          
          {isExpert && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => navigate(RoutePaths.NEWS_EDIT(record._id))}
                />
              </Tooltip>
              
              <Tooltip title="Xóa">
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa tin tức này?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32, minHeight: "100vh", background: "#f6f6f6" }}>
      <Card
        style={{
          marginBottom: 32,
          boxShadow: "0 2px 8px #0001",
          borderRadius: 13,
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>
                Quản lý Tin tức
              </h2>
            </Col>
            
            <Col>
              <Space>
                
                
                {isExpert && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(RoutePaths.NEWS_CREATE)}
                    style={{
                      backgroundColor: "#23643A",
                      borderColor: "#23643A",
                    }}
                  >
                    Tạo tin tức mới
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>


        <div style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => !e.target.value && setSearchText("")}
              />
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                size="large"
                style={{ width: "100%" }}
                onChange={handleStatusFilter}
                value={statusFilter || undefined}
              >
                <Option value="draft">Bản nháp</Option>
                <Option value="published">Đã xuất bản</Option>
                <Option value="archived">Đã lưu trữ</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={handleRefresh}
                style={{ width: "100%" }}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          {(() => {
            // Always render table if we have data or pagination
            const shouldRenderTable = pagination || (news && news.length > 0);
            
            return shouldRenderTable ? (
              <Table
                columns={columns}
                dataSource={news || []}
                rowKey="_id"
                pagination={pagination ? {
                  current: pagination.page || 1,
                  pageSize: pagination.limit || 10,
                  total: pagination.total || 0,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} tin tức`,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                } : false}
                scroll={{ x: 800 }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Đang tải dữ liệu...</p>
              </div>
            );
          })()}
        </Spin>
      </Card>
    </div>
  );
};

export default NewsList;
