import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RoutePaths } from "@/routes";
import Navbar from "@/components/navbar";
import { EAuthToken } from "@/variables/common";
import { getDefaultRoute } from "@/utils/common";
import { useAuthStore } from "@/stores";

// Không cần Layout, Header, Content ở đây nữa – đã nằm trong Navbar component!
import { Spin } from "antd";
const AuthLayout = () => {
  const location = useLocation();
  const { getMe, user, isAuthenticated, loading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
  const initializeAuth = async () => {
      // Kiểm tra token trước
      const token = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
      
      if (!token) {
        setIsInitializing(false);
        return;
      }

      if (isAuthenticated()) {
        try {
          await getMe();
        } catch (error) {
          console.error("Failed to get user data:", error);
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [getMe, isAuthenticated]);

 // Hiển thị loading khi đang khởi tạo
  if (isInitializing || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={RoutePaths.LOGIN} replace />;
  }

  if (
    user?.role &&
    (location.pathname === "/" || location.pathname === RoutePaths.LOGIN)
  ) {
    return <Navigate to={getDefaultRoute(user.role).path} replace />;
  }

  // Navbar sẽ tự render phần header và content trong main layout
  return (
    <Navbar>
      <Outlet />
    </Navbar>
  );
};

export default AuthLayout;
