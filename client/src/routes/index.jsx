import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import PublicLayout from "@/layouts/PublicLayout";
import LoginPage from "@/pages/login";
import { RoutePaths } from "./routes-constants";
import ExpertList from "@/pages/users/expert/ExpertList";
import FarmList from "@/pages/farms";
import FarmAdminList from "@/pages/users/farm-admin";
import GardenList from "@/pages/gardens";
import FarmerList from "@/pages/users/farmer";
import NotificationList from "@/pages/notification";
import TaskList from "@/pages/tasks";
import EquipmentCategoryList from "@/pages/equipments/categories";
import EquipmentList from "@/pages/equipments";
import FarmerTaskList from "@/pages/my-tasks";
import FarmDetail from "@/pages/farms/Detail";
import Dashboard from "@/pages/dashboard";
import UserProfile from "@/pages/user-profile";
import ChangePassword from "@/pages/change-password";
import ExpertDetail from "@/pages/users/expert/Detail";
import FarmAdminDetail from "@/pages/users/farm-admin/Detail";
import EquipmentManager from "@/pages/equipments/EquipmentManager";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
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
        path: RoutePaths.HOME,
        element: <LoginPage />,
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

      // Farmer routes
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
