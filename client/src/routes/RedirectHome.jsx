import React from "react";
import { useNavigate } from "react-router-dom";
import { EUser } from "@/variables/common";
import { RoutePaths } from "./routes-constants";

const RedirectHome = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const userStr = localStorage.getItem(EUser.CURRENT_USER);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "admin")
          navigate(RoutePaths.DASHBOARD, { replace: true });
        else if (user.role === "farm-admin")
          navigate(RoutePaths.GARDEN_LIST, { replace: true });
        else if (user.role === "farmer")
          navigate(RoutePaths.MY_TASK_LIST, { replace: true });
        else if (user.role === "expert")
          navigate(RoutePaths.REQUEST_LIST, { replace: true });
        else navigate(RoutePaths.LOGIN, { replace: true });
      } catch {
        navigate(RoutePaths.LOGIN, { replace: true });
      }
    } else {
      navigate(RoutePaths.LOGIN, { replace: true });
    }
  }, [navigate]);

  return null;
};

export default RedirectHome;
