// src/components/navbar/index.jsx
import { LogoApp } from "@/assets/images";
import { RoutePaths } from "@/routes/routes-constants";
import { useAuthStore } from "@/stores";
import { EUser } from "@/variables/common";
import {
  AimOutlined,
  BellOutlined,
  BookOutlined,
  CopyOutlined,
  DashboardOutlined,
  FormOutlined,
  LogoutOutlined,
  RestOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Dropdown, Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_BY_ROLE = {
  admin: [
    {
      key: RoutePaths.DASHBOARD,
      icon: <DashboardOutlined />,
      label: "Thống kê",
    },
    {
      key: RoutePaths.EXPERT_LIST,
      icon: <TeamOutlined />,
      label: "Quản lý chuyên gia",
    },
    {
      key: RoutePaths.FARM_ADMIN_LIST,
      icon: <TeamOutlined />,
      label: "Quản lý chủ trang trại",
    },
    {
      key: RoutePaths.FARM_LIST,
      icon: <AimOutlined />,
      label: "Quản lý trang trại",
    },
  ],
  "farm-admin": [
    {
      key: RoutePaths.GARDEN_LIST,
      icon: <AimOutlined />,
      label: "Quản lý vườn",
    },
    {
      key: RoutePaths.FARMER_LIST,
      icon: <UsergroupAddOutlined />,
      label: "Quản lý nông dân",
    },
    {
      key: RoutePaths.TASK_LIST,
      icon: <CopyOutlined />,
      label: "Quản lý công việc",
    },
    {
      key: RoutePaths.EQUIPMENT_MANAGER,
      icon: <TagsOutlined />,
      label: "Quản lý thiết bị",
    },
    // {
    //   key: RoutePaths.EQUIPMENT_LIST,
    //   icon: <RestOutlined />,
    //   label: "Quản lý thiết bị",
    // },
    {
      key: RoutePaths.NOTIFICATION_LIST,
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ],
  expert: [
    {
      key: RoutePaths.REQUEST_LIST,
      icon: <BookOutlined />,
      label: "Danh sách yêu cầu",
    },
    {
      key: RoutePaths.NOTIFICATION_LIST,
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ],
  farmer: [
    {
      key: RoutePaths.MY_TASK_LIST,
      icon: <FormOutlined />,
      label: "Công việc của tôi",
    },
  ],
};

const { Sider, Header } = Layout;

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const user = JSON.parse(localStorage.getItem(EUser.CURRENT_USER)) || {};
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user.role || "admin";
  const navItems = NAV_BY_ROLE[role] || [];

  // Dropdown menu actions
  const handleMenuClick = ({ key }) => {
    if (key === "logout") logout();
    else if (key === "profile") navigate(RoutePaths.USER_PROFILE);
    else if (key === "password") navigate(RoutePaths.CHANGE_PASSWORD);
  };

  // Custom Dropdown menu
  const userMenu = (
    <Menu
      onClick={handleMenuClick}
      style={{
        borderRadius: 16,
        minWidth: 200,
        boxShadow: "0 8px 32px rgba(42,80,180,0.15)",
        padding: "12px 0",
        overflow: "hidden",
        marginTop: 8,
      }}
      items={[
        {
          key: "profile",
          label: (
            <span style={{ fontWeight: 500, fontSize: 15 }}>
              Thông tin cá nhân
            </span>
          ),
          icon: <UserOutlined style={{ color: "#297C2D" }} />,
        },
        {
          key: "password",
          label: (
            <span style={{ fontWeight: 500, fontSize: 15 }}>Đổi mật khẩu</span>
          ),
          icon: <FormOutlined style={{ color: "#297C2D" }} />,
        },
        {
          key: "logout",
          label: (
            <span style={{ fontWeight: 500, color: "#e00", fontSize: 15 }}>
              Đăng xuất
            </span>
          ),
          icon: <LogoutOutlined style={{ color: "#e00" }} />,
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sider
        width={260}
        style={{
          background: "#295C2D",
          color: "#fff",
          boxShadow: "2px 0 8px #0000000d",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          paddingTop: 64,
        }}
        theme="dark"
      >
        <div style={{ padding: 24, textAlign: "center" }}>
          <img
            src={LogoApp}
            alt="logo"
            style={{ width: 110, marginBottom: 4 }}
          />
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 0,
              letterSpacing: 1,
            }}
          >
            Agri<span style={{ color: "#A0D468" }}>track</span>
          </div>
          <div
            style={{
              color: "#fff",
              fontWeight: 300,
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            Nho sạch - Chạm vị tin
          </div>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={navItems}
          style={{ background: "transparent", borderRight: 0, marginTop: 24 }}
        />
      </Sider>

      {/* MAIN PART */}
      <Layout
        style={{ marginLeft: 260, background: "#f6f6f6", minHeight: "100vh" }}
      >
        {/* HEADER */}
        <Header
          style={{
            background: "#1E643A",
            boxShadow: "0 2px 16px #0001",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 36px",
            height: 70,
            zIndex: 50,
            marginLeft: -260,
          }}
        >
          <Dropdown
            overlay={userMenu}
            placement="bottomRight"
            trigger={["click"]}
            overlayStyle={{ borderRadius: 16 }}
            arrow
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                background: "rgba(255,255,255,0.09)",
                borderRadius: 22,
                padding: "7px 22px 7px 12px",
                boxShadow: "0 2px 8px #0002",
                border: "1px solid #fff3",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography.Text strong style={{ color: "#fff", fontSize: 16 }}>
                  {user?.fullName || "Nguyễn Văn A"}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: "#D9F8B4" }}>
                  {user?.role === "farm-admin"
                    ? "Chủ trang trại"
                    : user?.role === "expert"
                    ? "Chuyên gia"
                    : user?.role === "admin"
                    ? "Quản trị hệ thống"
                    : user?.role}
                </Typography.Text>
              </div>
              <UserOutlined
                style={{
                  fontSize: 30,
                  color: "#A0D468",
                  marginLeft: 4,
                  background: "#fff",
                  borderRadius: "50%",
                  padding: 2,
                  boxShadow: "0 1px 5px #0001",
                }}
              />
            </div>
          </Dropdown>
        </Header>
        <div
          style={{
            margin: "24px 32px 0 32px",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {children}
        </div>
      </Layout>
    </Layout>
  );
};

export default Navbar;
