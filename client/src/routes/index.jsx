import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import PublicLayout from "@/layouts/PublicLayout";
import ChangePassword from "@/pages/change-password";
import Dashboard from "@/pages/dashboard";
import EquipmentList from "@/pages/equipments";
import EquipmentCategoryList from "@/pages/equipments/categories";
import EquipmentDetail from "@/pages/equipments/Detail";
import EquipmentManager from "@/pages/equipments/EquipmentManager";
import FarmList from "@/pages/farms";
import FarmDetail from "@/pages/farms/Detail";
import GardenList from "@/pages/gardens";
import LoginPage from "@/pages/login";
import FarmerTaskList from "@/pages/my-tasks";
import NotificationList from "@/pages/notification";
import TaskList from "@/pages/tasks";
import UserProfile from "@/pages/user-profile";
import ExpertDetail from "@/pages/users/expert/Detail";
import ExpertList from "@/pages/users/expert/ExpertList";
import FarmAdminList from "@/pages/users/farm-admin";
import FarmAdminDetail from "@/pages/users/farm-admin/Detail";
import FarmerList from "@/pages/users/farmer";
import RedirectHome from "./RedirectHome";
import { RoutePaths } from "./routes-constants";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <RedirectHome />,
      },
      {
        path: RoutePaths.EXPERT_LIST,
        element: <ExpertList />,
      },
      {
        path: RoutePaths.FARM_ADMIN_LIST,
        element: <FarmAdminList />,
      },
      {
        path: RoutePaths.FARM_LIST,
        element: <FarmList />,
      },
      {
        path: RoutePaths.EQUIPMENT_MANAGER,
        element: <EquipmentManager />,
      },
      {
        path: "/farm-detail/:id",
        element: <FarmDetail />,
      },
      {
        path: "/expert-detail/:id",
        element: <ExpertDetail />,
      },
      {
        path: "/farm-admin-detail/:id",
        element: <FarmAdminDetail />,
      },
      {
        path: "/equipment-detail/:id",
        element: <EquipmentDetail />,
      },
      {
        path: RoutePaths.GARDEN_LIST,
        element: <GardenList />,
      },
      {
        path: RoutePaths.FARMER_LIST,
        element: <FarmerList />,
      },
      {
        path: RoutePaths.NOTIFICATION_LIST,
        element: <NotificationList />,
      },
      {
        path: RoutePaths.TASK_LIST,
        element: <TaskList />,
      },
      {
        path: RoutePaths.EQUIPMENT_CATEGORY_LIST,
        element: <EquipmentCategoryList />,
      },
      {
        path: RoutePaths.EQUIPMENT_LIST,
        element: <EquipmentList />,
      },
      {
        path: RoutePaths.CHANGE_PASSWORD,
        element: <ChangePassword />,
      },
      {
        path: RoutePaths.USER_PROFILE,
        element: <UserProfile />,
      },
      {
        path: RoutePaths.DASHBOARD,
        element: <Dashboard />,
      },

      {
        path: RoutePaths.MY_TASK_LIST,
        element: <FarmerTaskList />,
      },
    ],
  },

  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <RedirectHome />,
      },
      {
        path: RoutePaths.LOGIN,
        element: <LoginPage />,
      },
    ],
  },
  // {
  //   path: "*",
  //   Component: NotFoundPage,
  // },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
export { RoutePaths };
