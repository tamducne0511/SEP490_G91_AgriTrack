// src/layouts/AuthLayout.tsx
import React from "react";
import { Layout } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RoutePaths } from "@/routes";
import Navbar from "@/components/navbar";
import { EAuthToken, EUser } from "@/variables/common";
import { getDefaultRoute } from "@/utils/common";

const { Content } = Layout;

const AuthLayout = () => {
  const isAuth = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
  const location = useLocation();

  if (!isAuth) return <Navigate to={RoutePaths.LOGIN} replace />;
  const user = JSON.parse(localStorage.getItem(EUser.CURRENT_USER) || "{}");
  // Nếu đã login, đang ở "/" hoặc "/login", thì redirect về đúng trang
  if (
    user?.role &&
    (location.pathname === "/" || location.pathname === RoutePaths.LOGIN)
  ) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout style={{ marginLeft: 250 }}>
        <Content
          style={{ margin: "24px", padding: "24px", background: "#fff" }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AuthLayout;
