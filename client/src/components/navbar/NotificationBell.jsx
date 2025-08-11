import { useAuthStore, useNotificationStore } from "@/stores";
import { BellOutlined } from "@ant-design/icons";
import { Badge, Button, Dropdown, List, Spin, Modal, Image } from "antd";
import { useEffect, useState } from "react";
import { ImageBaseUrl } from "@/variables/common";

const NotificationBell = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    pagination,
    fetchTotalNotiUnread,
    totalUnread,
    markNotificationAsRead,
  } = useNotificationStore();
  const [visible, setVisible] = useState(false);

  const { user } = useAuthStore();

  // State cho modal preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchNotifications({ page: 1 });
    fetchTotalNotiUnread();

    const intervalId = setInterval(() => {
      fetchNotifications({ page: 1 });
      fetchTotalNotiUnread();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Hàm mở modal preview
  const handlePreview = (item) => {
    setPreviewData(item);
    setPreviewOpen(true);
    setVisible(false);
    markNotificationAsRead(item._id);
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
        {!notifications || notifications.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            Không có thông báo
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
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
          count={totalUnread}
          size="small"
          overflowCount={99}
          offset={[0, 6]}
        >
          <Button
            shape="circle"
            size="large"
            icon={<BellOutlined style={{ fontSize: 28, color: "#fff" }} />}
            style={{
              background: "none",
              border: "none",
              boxShadow: "none",
            }}
          />
        </Badge>
      </Dropdown>

      {/* Modal Preview notification */}
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

export default NotificationBell;
