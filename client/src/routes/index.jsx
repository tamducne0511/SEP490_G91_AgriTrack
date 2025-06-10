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
        path: RoutePaths.HOME,
        element: <ExpertList />,
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
