import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore, useNewsStore } from "@/stores";
import { RoutePaths } from "@/routes";
import {
  Card,
  Button,
  Row,
  Col,
  Spin,
  Tag,
  Space,
  Typography,
  Divider,
  message,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { 
    currentNews, 
    loading, 
    fetchNewsById, 
    clearCurrentNews 
  } = useNewsStore();
  
  const [loadingNews, setLoadingNews] = useState(false);

  const isExpert = user?.role === "expert";
  const currentUserId = user?.id || user?._id;
  const authorId = typeof currentNews?.authorId === "string"
    ? currentNews?.authorId
    : (currentNews?.authorId?._id || currentNews?.authorId?.id);
  const isOwner = !!(currentNews && currentUserId && authorId && String(authorId) === String(currentUserId));

  useEffect(() => {
    if (id) {
      loadNews();
    }

    return () => {
      clearCurrentNews();
    };
  }, [id]);

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      await fetchNewsById(id);
    } catch (error) {
      message.error("Không thể tải thông tin tin tức");
      navigate(RoutePaths.NEWS_LIST);
    } finally {
      setLoadingNews(false);
    }
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

  if (loadingNews || loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentNews) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Card>
          <h3>Không tìm thấy tin tức</h3>
          <Button onClick={() => navigate(RoutePaths.NEWS_LIST)}>
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  // Check if non-expert user is trying to view non-published news
  if (!isExpert && currentNews.status !== "published") {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Card>
          <h3>Tin tức này chưa được xuất bản</h3>
          <p>Bạn không có quyền xem tin tức này.</p>
          <Button onClick={() => navigate(RoutePaths.NEWS_LIST)}>
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f6" }}>
      {/* Header with back button */}
      <div style={{ 
        background: "white", 
        borderBottom: "1px solid #f0f0f0",
        padding: "16px 32px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(RoutePaths.NEWS_LIST)}
            style={{ border: "none", boxShadow: "none" }}
          >
            Quay lại danh sách
          </Button>
          
          {isExpert && isOwner && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(RoutePaths.NEWS_EDIT(currentNews._id))}
              style={{
                backgroundColor: "#23643A",
                borderColor: "#23643A",
              }}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        <Card
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            border: "none",
          }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Featured Image */}
          {currentNews.image && (
            <div style={{ 
              height: 400, 
              overflow: "hidden",
              position: "relative"
            }}>
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}${currentNews.image}`}
                alt={currentNews.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                background: "linear-gradient(transparent, rgba(0,0,0,0.3))"
              }} />
            </div>
          )}

          {/* Article Content */}
          <div style={{ padding: "48px" }}>
            {/* Title */}
            <Title level={1} style={{ 
              color: "#23643A", 
              marginBottom: 24,
              textAlign: "center",
              fontSize: "2.8rem",
              fontWeight: 700,
              lineHeight: 1.2
            }}>
              {currentNews.title}
            </Title>

            {/* Meta Information */}
            <div style={{ 
              textAlign: "center", 
              marginBottom: 48,
              paddingBottom: 24,
              borderBottom: "1px solid #f0f0f0"
            }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span style={{ color: "#666", fontSize: 16 }}>
                    {currentNews.authorId?.fullName}
                  </span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarOutlined style={{ color: "#666" }} />
                  <span style={{ color: "#666", fontSize: 16 }}>
                    {dayjs(currentNews.createdAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
                
                <Tag color={getStatusColor(currentNews.status)} style={{ fontSize: 14, padding: "4px 12px" }}>
                  {getStatusText(currentNews.status)}
                </Tag>
              </div>
            </div>

            {/* Content */}
            <div style={{
              lineHeight: 1.8,
              fontSize: "18px",
              color: "#333",
              maxWidth: "800px",
              margin: "0 auto"
            }}>
              <div 
                dangerouslySetInnerHTML={{ __html: currentNews.content }}
                style={{
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    color: "#23643A",
                    marginTop: "32px",
                    marginBottom: "16px",
                    fontWeight: 600,
                  },
                  "& p": {
                    marginBottom: "20px",
                    textAlign: "justify",
                  },
                  "& ul, & ol": {
                    paddingLeft: "24px",
                    marginBottom: "20px",
                  },
                  "& blockquote": {
                    borderLeft: "4px solid #23643A",
                    paddingLeft: "20px",
                    margin: "24px 0",
                    fontStyle: "italic",
                    color: "#666",
                    backgroundColor: "#f9f9f9",
                    padding: "16px 20px",
                    borderRadius: "4px",
                  },
                  "& table": {
                    width: "100%",
                    borderCollapse: "collapse",
                    margin: "24px 0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                  "& th, & td": {
                    border: "1px solid #e8e8e8",
                    padding: "12px",
                    textAlign: "left",
                  },
                  "& th": {
                    backgroundColor: "#f5f5f5",
                    fontWeight: "600",
                    color: "#23643A",
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    margin: "16px 0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }
                }}
              />
            </div>

            {/* Footer */}
            <div style={{ 
              textAlign: "center", 
              color: "#999",
              fontSize: "14px",
              marginTop: 48,
              paddingTop: 24,
              borderTop: "1px solid #f0f0f0"
            }}>
              <Space>
                <CalendarOutlined />
                <span>
                  Cập nhật lần cuối: {dayjs(currentNews.updatedAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </Space>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewsDetail;
