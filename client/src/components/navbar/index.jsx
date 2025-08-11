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
  QuestionCircleFilled,
  QuestionCircleOutlined,
  ScheduleOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Dropdown, Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import NotificationQuesBell from "./NotificationQuesBell";

const ROLE_LABEL = {
  admin: "Quản trị hệ thống",
  "farm-admin": "Chủ trang trại",
  expert: "Chuyên gia",
  farmer: "Nông dân",
};

const NAV_BY_ROLE = (idUser) => ({
  admin: [
    {
      key: RoutePaths.DASHBOARD,
      paths: [RoutePaths.DASHBOARD],
      icon: <DashboardOutlined />,
      label: "Thống kê",
    },
    {
      key: RoutePaths.EXPERT_LIST,
      paths: [RoutePaths.EXPERT_LIST, "/expert-detail/"],
      icon: <TeamOutlined />,
      label: "Quản lý chuyên gia",
    },
    {
      key: RoutePaths.FARM_ADMIN_LIST,
      paths: [RoutePaths.FARM_ADMIN_LIST, "/farm-admin-detail/"],
      icon: <TeamOutlined />,
      label: "Quản lý chủ trang trại",
    },
    {
      key: RoutePaths.FARM_LIST,
      paths: [RoutePaths.FARM_LIST, "/farm-detail/"],
      icon: <AimOutlined />,
      label: "Quản lý trang trại",
    },
  ],
  "farm-admin": [
    {
      key: RoutePaths.GARDEN_LIST,
      paths: [RoutePaths.GARDEN_LIST, "/garden-detail/"],
      icon: <AimOutlined />,
      label: "Quản lý vườn",
    },
    {
      key: RoutePaths.FARMER_LIST,
      paths: [RoutePaths.FARMER_LIST, "/farmer-detail/"],
      icon: <UsergroupAddOutlined />,
      label: "Quản lý nông dân",
    },
    {
      key: RoutePaths.TASK_LIST,
      paths: [RoutePaths.TASK_LIST, "/task-detail/"],
      icon: <CopyOutlined />,
      label: "Quản lý công việc",
    },
    {
      key: RoutePaths.EQUIPMENT_MANAGER,
      paths: [
        RoutePaths.EQUIPMENT_MANAGER,
        RoutePaths.EQUIPMENT_LIST,
        RoutePaths.EQUIPMENT_CATEGORY_LIST,
      ],
      icon: <TagsOutlined />,
      label: "Quản lý thiết bị",
    },
    {
      key: RoutePaths.FARM_SCHEDULE_DETAIL(idUser),
      paths: [RoutePaths.FARM_SCHEDULE_DETAIL(idUser), "/farm-schedule/"],
      icon: <ScheduleOutlined />,
      label: "Lịch nông vụ",
    },
    {
      key: RoutePaths.NOTIFICATION_LIST,
      paths: [RoutePaths.NOTIFICATION_LIST],
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ],
  expert: [
    {
      key: RoutePaths.REQUEST_LIST,
      paths: [RoutePaths.REQUEST_LIST, "/request-detail/"],
      icon: <BookOutlined />,
      label: "Danh sách yêu cầu",
    },
    {
      key: RoutePaths.FARM_SCHEDULE_LIST,
      paths: [RoutePaths.FARM_SCHEDULE_LIST, "/farm-schedule/"],
      icon: <ScheduleOutlined />,
      label: "Lịch nông vụ",
    },
    {
      key: RoutePaths.NOTIFICATION_LIST,
      paths: [RoutePaths.NOTIFICATION_LIST],
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ],
  farmer: [
    {
      key: RoutePaths.MY_TASK_LIST,
      paths: [RoutePaths.MY_TASK_LIST, "/my-task/"],
      icon: <FormOutlined />,
      label: "Công việc của tôi",
    },
    {
      key: RoutePaths.MY_FARM_TASK_QUESTION,
      paths: [RoutePaths.MY_FARM_TASK_QUESTION, "/my-farm-task-question/"],
      icon: <QuestionCircleOutlined />,
      label: "Câu hỏi",
    },
  ],
});

const { Sider, Header } = Layout;

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const role = user?.role || "admin";
  const navItems = NAV_BY_ROLE(user?.farmId)[role] || [];

  const selectedKey = navItems.find((item) =>
    item.paths.some((path) => location.pathname.startsWith(path))
  )?.key;

  const handleMenuClick = ({ key }) => {
    if (key === "logout") logout();
    else if (key === "profile") navigate(RoutePaths.USER_PROFILE);
    else if (key === "password") navigate(RoutePaths.CHANGE_PASSWORD);
  };

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
  const roleLabel = ROLE_LABEL[user?.role] || user?.role || "";

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
        <div style={{ padding: "24px 24px 16px", textAlign: "center" }}>
          <img
            src={LogoApp}
            alt="logo"
            style={{ width: 110, marginBottom: 8 }}
          />
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 4,
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
              marginBottom: 16,
            }}
          >
            Nho sạch - Chạm vị tin
          </div>
        </div>
        <div
          style={{ height: 1, background: "#fff3", margin: "0 16px 24px" }}
        />
        <Menu
          className="custom-menu"
          mode="inline"
          theme="dark"
          selectedKeys={selectedKey ? [selectedKey] : []}
          onClick={({ key }) => navigate(key)}
          items={navItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          style={{ background: "transparent", borderRight: 0 }}
        />
      </Sider>
      <Layout
        style={{ marginLeft: 260, background: "#f6f6f6", minHeight: "100vh" }}
      >
        <Header
          style={{
            background: "#1E643A",
            boxShadow: "0 2px 16px #0001",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 36px",
            height: 70,
            zIndex: 50,
            marginLeft: -260,
          }}
        >
          <Typography.Text
            strong
            style={{ fontSize: 20, color: "#fff", letterSpacing: 1 }}
          >
            {roleLabel}
          </Typography.Text>

          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {role === "farmer" && <NotificationBell />}
            {["farmer", "expert", "farm-admin"].includes(role) && (
              <NotificationQuesBell />
            )}

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
                  <Typography.Text
                    strong
                    style={{ color: "#fff", fontSize: 16 }}
                  >
                    {user?.fullName || "Nguyễn Văn A"}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: "#D9F8B4" }}>
                    {roleLabel}
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
          </div>
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
