import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/routes";
import { useAuthStore } from "@/stores";
import { getDefaultRoute } from "@/utils/common";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleGoHome = () => {
    // Nếu user đã đăng nhập, chuyển về trang chủ theo role
    if (user?.role) {
      const defaultRoute = getDefaultRoute(user.role);
      navigate(defaultRoute.path);
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    navigate(RoutePaths.LOGIN);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Result
          status="403"
          title="401 - Không có quyền truy cập"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
          extra={[
            <Button
              type="primary"
              key="home"
              size="large"
              onClick={handleGoHome}
              style={{
                background: "#23643A",
                borderColor: "#23643A",
                borderRadius: "8px",
                marginRight: "12px",
                fontWeight: "600",
                padding: "8px 24px",
                height: "40px",
              }}
            >
              Về trang chủ
            </Button>,
            <Button
              key="logout"
              size="large"
              onClick={handleLogout}
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                padding: "8px 24px",
                height: "40px",
                border: "1px solid #d9d9d9",
              }}
            >
              Đăng xuất
            </Button>,
          ]}
        />
        
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "12px",
            border: "1px solid #e9ecef",
          }}
        >
          <h4 style={{ color: "#495057", marginBottom: "12px" }}>
            Thông tin tài khoản hiện tại:
          </h4>
          <div style={{ color: "#6c757d", fontSize: "14px" }}>
            <p><strong>Vai trò:</strong> {user?.role || "Không xác định"}</p>
            <p><strong>Email:</strong> {user?.email || "Không xác định"}</p>
            <p><strong>Tên:</strong> {user?.fullName || "Không xác định"}</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#fff3cd",
            borderRadius: "8px",
            border: "1px solid #ffeaa7",
          }}
        >
          <p style={{ color: "#856404", fontSize: "14px", margin: 0 }}>
            <strong>💡 Gợi ý:</strong> Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
