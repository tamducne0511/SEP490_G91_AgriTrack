// src/components/navbar/index.jsx
import React from "react";
import { Layout, Menu, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ScheduleOutlined,
  LogoutOutlined,
  AimOutlined,
  BellOutlined,
  UsergroupAddOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { LogoApp } from "@/assets/images";
import { RoutePaths } from "@/routes/routes-constants";
import { useAuthStore } from "@/stores";
import { EUser } from "@/variables/common";

const { Sider } = Layout;

const NAV_BY_ROLE = {
  admin: [
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
      key: RoutePaths.NOTIFICATION_LIST,
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ],
  expert: [
    {
      key: RoutePaths.NOTIFICATION_LIST,
      icon: <BellOutlined />,
      label: "Thông báo",
    },
    {
      key: RoutePaths.REQUEST_LIST,
      icon: <BookOutlined />,
      label: "Danh sách yêu cầu",
    },
    {
      key: RoutePaths.FARMER_LIST,
      icon: <UsergroupAddOutlined />,
      label: "Nông dân gửi lên",
    },
  ],
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const user = JSON.parse(localStorage.getItem(EUser.CURRENT_USER)) || {};

  // Role có thể là "admin", "farm-admin", "expert"
  const role = user.role || "admin";
  const navItems = NAV_BY_ROLE[role] || [];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") logout();
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          label: "Thông tin cá nhân",
          icon: <UserOutlined />,
        },
        {
          key: "logout",
          label: "Đăng xuất",
          icon: <LogoutOutlined />,
        },
      ]}
      onClick={handleMenuClick}
    />
  );

  return (
    <Sider
      width={250}
      style={{
        background: "#295C2D",
        color: "#fff",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
      }}
      theme="dark"
    >
      <div style={{ padding: 24, textAlign: "center" }}>
        <img src={LogoApp} alt="logo" style={{ width: 120, marginBottom: 8 }} />
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 0,
          }}
        >
          Agri<span style={{ color: "#A0D468" }}> track</span>
        </div>
        <div
          style={{
            color: "#fff",
            fontWeight: 300,
            fontSize: 14,
            marginBottom: 24,
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
        style={{ background: "transparent", borderRight: 0 }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Dropdown overlay={userMenu} placement="topCenter">
          <div style={{ cursor: "pointer" }}>
            <Avatar
              size={48}
              src={"https://randomuser.me/api/portraits/men/75.jpg"}
              style={{ marginBottom: 8 }}
            />
            <div style={{ color: "#fff", fontWeight: 500 }}>
              {user?.fullName}
            </div>
            <div style={{ color: "#A0D468", fontSize: 13, marginTop: 12 }}>
              {(user?.role || "").toUpperCase()}
            </div>
          </div>
        </Dropdown>
      </div>
    </Sider>
  );
};

export default Navbar;
