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
  const isOwner = currentNews && currentNews.authorId?._id === user?.id;

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

  return (
    <div style={{ padding: 32, minHeight: "100vh", background: "#f6f6f6" }}>
      <Card
        style={{
          marginBottom: 32,
          boxShadow: "0 2px 8px #0001",
          borderRadius: 13,
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
        }}
        bodyStyle={{ padding: 32 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(RoutePaths.NEWS_LIST)}
                style={{ marginRight: 16 }}
              >
                Quay lại
              </Button>
            </Col>
            
            {isExpert && isOwner && (
              <Col>
                <Space>
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
                </Space>
              </Col>
            )}
          </Row>
        </div>

        {/* News Content */}
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Title */}
          <Title level={1} style={{ 
            color: "#23643A", 
            marginBottom: 16,
            textAlign: "center",
            fontSize: "2.5rem"
          }}>
            {currentNews.title}
          </Title>

          {/* Meta Information */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: 32,
            color: "#666"
          }}>
            <Space size="large" split={<Divider type="vertical" />}>
              <Space>
                <UserOutlined />
                <span>Tác giả: {currentNews.authorId?.fullName}</span>
              </Space>
              
              <Space>
                <CalendarOutlined />
                <span>
                  Ngày tạo: {dayjs(currentNews.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </Space>
              
              <Tag color={getStatusColor(currentNews.status)}>
                {getStatusText(currentNews.status)}
              </Tag>
            </Space>
          </div>

          {/* Featured Image */}
          {currentNews.image && (
            <div style={{ 
              marginBottom: 32, 
              textAlign: "center" 
            }}>
              <img
                src={`${process.env.REACT_APP_API_BASE_URL}${currentNews.image}`}
                alt={currentNews.title}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{
            lineHeight: 1.8,
            fontSize: "16px",
            color: "#333",
          }}>
            <div 
              dangerouslySetInnerHTML={{ __html: currentNews.content }}
              style={{
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  color: "#23643A",
                  marginTop: "24px",
                  marginBottom: "16px",
                },
                "& p": {
                  marginBottom: "16px",
                },
                "& ul, & ol": {
                  paddingLeft: "24px",
                  marginBottom: "16px",
                },
                "& blockquote": {
                  borderLeft: "4px solid #23643A",
                  paddingLeft: "16px",
                  margin: "16px 0",
                  fontStyle: "italic",
                  color: "#666",
                },
                "& table": {
                  width: "100%",
                  borderCollapse: "collapse",
                  margin: "16px 0",
                },
                "& th, & td": {
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                },
                "& th": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                },
              }}
            />
          </div>

          {/* Footer */}
          <Divider />
          <div style={{ 
            textAlign: "center", 
            color: "#666",
            fontSize: "14px"
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
  );
};

export default NewsDetail;
