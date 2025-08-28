import { useAuthStore, useNotificationStore } from "@/stores";
import { BellOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown, List, Spin, Modal, Image } from "antd";
import { useEffect, useState } from "react";
import { ImageBaseUrl, EAuthToken } from "@/variables/common";
import { useNavigate } from "react-router-dom";

const NotificationQuesBell = () => {
  // THAY ĐỔI 1: Sử dụng state và action dành cho "Questions" từ store
  const {
    notificationQues,
    loading,
    fetchNotificationsQues,
    totalQuesNotiUnread,
    markQuesNotificationAsRead,
    fetchQuesTotalNotiUnread,
  } = useNotificationStore();
  const { user, farm } = useAuthStore();

  const [visible, setVisible] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    // Chỉ gọi API nếu có token và user
    const token = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
    if (!token || !user) return;

    fetchNotificationsQues({ role: user?.role, id: farm?.id });

    const intervalId = setInterval(() => {
      // Kiểm tra token trước khi gọi API
      const currentToken = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
      if (!currentToken || !user) {
        clearInterval(intervalId);
        return;
      }
      
      fetchNotificationsQues({ role: user?.role, id: farm?._id });
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []); // Dependency array rỗng để chỉ chạy một lần

  const notificationCount =
    notificationQues?.filter((noti) => !noti.readBy.includes(user?._id))
      ?.length || 0;

  const navigate = useNavigate();
  const handlePreview = (item) => {
    markQuesNotificationAsRead(item._id);

    setVisible(false);
    navigate(`/request-detail/${item.tree._id}`);
  };

  const dropdownContent = (
    <div
      style={{
        minWidth: 340,
        maxWidth: 400,
        maxHeight: 420,
        overflowY: "auto",
        padding: 8,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px #1e643a22",
      }}
    >
      <Spin spinning={loading}>
        {!notificationQues || notificationQues.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            Không có thông báo
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notificationQues} // Sử dụng notificationQues làm nguồn dữ liệu
            renderItem={(item) => (
              <List.Item
                style={{
                  alignItems: "flex-start",
                  borderRadius: 8,
                  padding: 8,
                  transition: "background 0.2s",
                  cursor: "pointer",
                  background: item.readBy.includes(user?._id)
                    ? "white"
                    : "rgb(217, 248, 180)",
                }}
                onClick={() => handlePreview(item)}
              >
                <List.Item.Meta
                  style={{ alignItems: "center" }}
                  avatar={
                    item.image ? (
                      <Image
                        src={ImageBaseUrl + item.image}
                        alt="Ảnh"
                        width={48}
                        height={48}
                        style={{
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #eee",
                          background: "#fafbfa",
                        }}
                        preview={false}
                      />
                    ) : null
                  }
                  title={<span style={{ fontWeight: 600 }}>{item.title}</span>}
                  description={
                    <span>
                      <span
                        style={{
                          color: "#555",
                          fontSize: 14,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                        }}
                      >
                        {item.content}
                      </span>
                      <span style={{ color: "#999", fontSize: 12 }}>
                        {item.createdAt &&
                          new Date(item.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </div>
  );

  return (
    <>
      <Dropdown
        overlay={dropdownContent}
        trigger={["click"]}
        placement="bottomRight"
        open={visible}
        onOpenChange={setVisible}
        arrow
      >
        <Badge
          count={notificationCount}
          size="small"
          overflowCount={99}
          offset={[0, 6]}
        >
          <Button
            shape="circle"
            size="large"
            icon={
              <QuestionCircleOutlined style={{ fontSize: 28, color: "#fff" }} />
            }
            style={{
              background: "none",
              border: "none",
              boxShadow: "none",
            }}
          />
        </Badge>
      </Dropdown>

      {/* Modal Preview - Giữ nguyên không đổi */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        title="Chi tiết thông báo"
        width={520}
        centered
      >
        {previewData && (
          <div>
            {previewData.image ? (
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <Image
                  src={ImageBaseUrl + previewData.image}
                  alt="Ảnh"
                  width={320}
                  style={{
                    borderRadius: 10,
                    border: "1px solid #eee",
                    maxHeight: 200,
                    objectFit: "contain",
                  }}
                  preview={false}
                />
              </div>
            ) : null}
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
              {previewData.title}
            </div>
            <div style={{ color: "#666", marginBottom: 12 }}>
              {previewData.content}
            </div>
            <div style={{ color: "#888", fontSize: 13 }}>
              Ngày tạo:{" "}
              {previewData.createdAt &&
                new Date(previewData.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default NotificationQuesBell;
