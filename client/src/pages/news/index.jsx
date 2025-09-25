import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useNewsStore } from "@/stores";
import { RoutePaths } from "@/routes";
import {
  Card,
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
  Typography,
  Image,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

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
      status: statusFilter || (isExpert ? undefined : "published"),
      search: searchText || undefined,
    };
    await fetchNews(filters);
  }, [currentPage, pageSize, statusFilter, searchText, fetchNews, isExpert]);

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

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

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
            
            {isExpert && (
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
            )}
            
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
          {news && news.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {news.map((article) => {
                  const currentUserId = user?.id || user?._id;
                  const authorId = typeof article?.authorId === "string"
                    ? article.authorId
                    : (article?.authorId?._id || article?.authorId?.id);
                  const canManage = isExpert && currentUserId && authorId && String(authorId) === String(currentUserId);
                  
                  return (
                    <Col xs={24} sm={12} lg={8} key={article._id}>
                      <Card
                        hoverable
                        style={{
                          height: "100%",
                          borderRadius: 12,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                        }}
                        bodyStyle={{ padding: 0 }}
                        cover={
                          article.image ? (
                            <div style={{ height: 200, overflow: "hidden" }}>
                              <Image
                                src={`${process.env.REACT_APP_API_BASE_URL}${article.image}`}
                                alt={article.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                preview={false}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                height: 200,
                                background: "linear-gradient(135deg, #23643A 0%, #4CAF50 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 24,
                                fontWeight: "bold",
                              }}
                            >
                              📰
                            </div>
                          )
                        }
                        actions={[
                          <Tooltip title="Xem chi tiết">
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() => navigate(RoutePaths.NEWS_DETAIL(article._id))}
                            >
                              Xem
                            </Button>
                          </Tooltip>,
                          ...(canManage ? [
                            <Tooltip title="Chỉnh sửa">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate(RoutePaths.NEWS_EDIT(article._id))}
                              >
                                Sửa
                              </Button>
                            </Tooltip>,
                            <Popconfirm
                              title="Bạn có chắc chắn muốn xóa tin tức này?"
                              onConfirm={() => handleDelete(article._id)}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Tooltip title="Xóa">
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                >
                                  Xóa
                                </Button>
                              </Tooltip>
                            </Popconfirm>
                          ] : [])
                        ]}
                      >
                        <div style={{ padding: 20 }}>
                          {/* Status Badge */}
                          <div style={{ marginBottom: 12 }}>
                            <Tag color={getStatusColor(article.status)} style={{ margin: 0 }}>
                              {getStatusText(article.status)}
                            </Tag>
                          </div>

                          {/* Title */}
                          <Title
                            level={4}
                            style={{
                              marginBottom: 12,
                              fontSize: 18,
                              lineHeight: 1.4,
                              color: "#23643A",
                              cursor: "pointer",
                            }}
                            onClick={() => navigate(RoutePaths.NEWS_DETAIL(article._id))}
                          >
                            {article.title}
                          </Title>

                          {/* Excerpt */}
                          <Paragraph
                            style={{
                              color: "#666",
                              fontSize: 14,
                              lineHeight: 1.6,
                              marginBottom: 16,
                              minHeight: 60,
                            }}
                            ellipsis={{ rows: 3 }}
                          >
                            {truncateText(stripHtml(article.content))}
                          </Paragraph>

                          {/* Meta Information */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingTop: 12,
                              borderTop: "1px solid #f0f0f0",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Avatar size="small" icon={<UserOutlined />} />
                              <Text style={{ fontSize: 12, color: "#999" }}>
                                {article.authorId?.fullName || "Unknown"}
                              </Text>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <CalendarOutlined style={{ fontSize: 12, color: "#999" }} />
                              <Text style={{ fontSize: 12, color: "#999" }}>
                                {dayjs(article.createdAt).format("DD/MM/YYYY")}
                              </Text>
                            </div>
                          </div>
              </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              {/* Pagination */}
              {pagination && pagination.total > pagination.limit && (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <Button
                      disabled={pagination.page === 1}
                      onClick={() => {
                        setCurrentPage(pagination.page - 1);
                      }}
                    >
                      Trước
                    </Button>
                    <span style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      padding: "0 16px",
                      color: "#666"
                    }}>
                      Trang {pagination.page} / {pagination.pages}
                    </span>
                    <Button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => {
                        setCurrentPage(pagination.page + 1);
                      }}
                    >
                      Sau
                    </Button>
                  </div>
                  <div style={{ marginTop: 8, color: "#999", fontSize: 14 }}>
                    Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total} tin tức
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: "#ccc" }}>📰</div>
              <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
                Chưa có tin tức nào
              </Title>
              <Text style={{ color: "#999" }}>
                {isExpert ? "Hãy tạo tin tức đầu tiên của bạn!" : "Không có tin tức nào để hiển thị."}
              </Text>
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default NewsList;
