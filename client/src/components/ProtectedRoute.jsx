import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import Unauthorized from "@/pages/error/Unauthorized";

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/unauthorized" 
}) => {
  const { user, isAuthenticated } = useAuthStore();

  // Nếu không có token hoặc user, chuyển về trang login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Nếu không có user hoặc không có role, chuyển về trang unauthorized
  if (!user || !user.role) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu không có allowedRoles hoặc role của user không trong danh sách cho phép
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  // Nếu có quyền truy cập, render children
  return children;
};

export default ProtectedRoute;
