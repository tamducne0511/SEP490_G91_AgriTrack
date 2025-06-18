import React, { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RoutePaths } from "@/routes";
import Navbar from "@/components/navbar";
import { EAuthToken } from "@/variables/common";
import { getDefaultRoute } from "@/utils/common";
import { useAuthStore } from "@/stores";

// Không cần Layout, Header, Content ở đây nữa – đã nằm trong Navbar component!

const AuthLayout = () => {
  const isAuth = localStorage.getItem(EAuthToken.ACCESS_TOKEN);
  const location = useLocation();
  const { getMe, user } = useAuthStore();

  useEffect(() => {
    getMe();
  }, []);

  if (!isAuth) return <Navigate to={RoutePaths.LOGIN} replace />;

  if (
    user?.role &&
    (location.pathname === "/" || location.pathname === RoutePaths.LOGIN)
  ) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  // Navbar sẽ tự render phần header và content trong main layout
  return (
    <Navbar>
      <Outlet />
    </Navbar>
  );
};

export default AuthLayout;
