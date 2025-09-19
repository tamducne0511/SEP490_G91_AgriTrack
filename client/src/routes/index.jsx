import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import PublicLayout from "@/layouts/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChangePassword from "@/pages/change-password";
import Dashboard from "@/pages/dashboard";
import EquipmentList from "@/pages/equipments";
import EquipmentCategoryList from "@/pages/equipments/categories";
import EquipmentDetail from "@/pages/equipments/Detail";
import EquipmentManager from "@/pages/equipments/EquipmentManager";
import FarmListPage from "@/pages/farm-schedule";
import { default as FarmScheduleDetailPage } from "@/pages/farm-schedule/Detail";
import FarmScheduleTreeDetail from "@/pages/farm-schedule/DetailTree";
import FarmList from "@/pages/farms";
import FarmDetail from "@/pages/farms/Detail";
import GardenList from "@/pages/gardens";
import GardenDetail from "@/pages/gardens/Detail";
import LoginPage from "@/pages/login";
import FarmTaskQuestionList from "@/pages/my-farm-task-question";
import AddTaskQuestion from "@/pages/my-farm-task-question/AddTask";
import TreeQuestionDetail from "@/pages/my-farm-task-question/TaskQuesDetail";
import FarmerTaskList from "@/pages/my-tasks";
import FarmerTaskDetail from "@/pages/my-tasks/Detail";
import NotificationList from "@/pages/notification";
import ExpertTaskQuestionPage from "@/pages/requests";
import TaskList from "@/pages/tasks";
import TaskDetail from "@/pages/tasks/Detail";
import TaskCreate from "@/pages/tasks/TaskCreate";
import UserProfile from "@/pages/user-profile";
import ExpertDetail from "@/pages/users/expert/Detail";
import ExpertList from "@/pages/users/expert/ExpertList";
import FarmAdminList from "@/pages/users/farm-admin";
import FarmAdminDetail from "@/pages/users/farm-admin/Detail";
import FarmerList from "@/pages/users/farmer";
import FarmerDetail from "@/pages/users/farmer/Detail";
import Unauthorized from "@/pages/error/Unauthorized";
import RedirectHome from "./RedirectHome";
import { RoutePaths } from "./routes-constants";
import TaskGarnchart from "@/pages/tasks/Garnchart";

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
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ExpertList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.FARM_ADMIN_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <FarmAdminList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.FARM_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin"]}>
            <FarmList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.EQUIPMENT_MANAGER,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin"]}>
            <EquipmentManager />
          </ProtectedRoute>
        ),
      },
      {
        path: "/farm-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin"]}>
            <FarmDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/expert-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ExpertDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/farm-admin-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <FarmAdminDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/farmer-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["farm-admin", "expert"]}>
            <FarmerDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/garden-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin", "expert"]}>
            <GardenDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/task-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin", "expert"]}>
            <TaskDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-task/:id",
        element: (
          <ProtectedRoute allowedRoles={["farmer"]}>
            <FarmerTaskDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/equipment-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin"]}>
            <EquipmentDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-farm-task-question/:id",
        element: (
          <ProtectedRoute allowedRoles={["farmer", "expert"]}>
            <TreeQuestionDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.GARDEN_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin", "expert"]}>
            <GardenList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.FARMER_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin", "expert"]}>
            <FarmerList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.MY_FARM_TASK_QUESTION,
        element: (
          <ProtectedRoute allowedRoles={["farmer"]}>
            <FarmTaskQuestionList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.MY_FARM_TASK_QUESTION_CREATE,
        element: (
          <ProtectedRoute allowedRoles={["farmer"]}>
            <AddTaskQuestion />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.NOTIFICATION_LIST,
        element: <NotificationList />,
      },
      {
        path: RoutePaths.TASK_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin", "expert"]}>
            <TaskList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.TASK_GARNCHART,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin", "expert","farmer"]}>
            <TaskGarnchart />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.TASK_CREATE,
        element: (
          <ProtectedRoute allowedRoles={["farm-admin", "expert"]}>
            <TaskCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.EQUIPMENT_CATEGORY_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin"]}>
            <EquipmentCategoryList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.EQUIPMENT_LIST,
        element: (
          <ProtectedRoute allowedRoles={["admin", "farm-admin"]}>
            <EquipmentList />
          </ProtectedRoute>
        ),
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
        path: RoutePaths.REQUEST_LIST,
        element: (
          <ProtectedRoute allowedRoles={["expert"]}>
            <ExpertTaskQuestionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/unauthorized",
        element: <Unauthorized />,
      },
      {
        path: "/request-detail/:id",
        element: (
          <ProtectedRoute allowedRoles={["expert", "farmer", "farm-admin"]}>
            <TreeQuestionDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.MY_TASK_LIST,
        element: (
          <ProtectedRoute allowedRoles={["farmer"]}>
            <FarmerTaskList />
          </ProtectedRoute>
        ),
      },
      {
        path: RoutePaths.FARM_SCHEDULE_LIST,
        element: (
          <ProtectedRoute allowedRoles={["expert", "farm-admin"]}>
            <FarmListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/farm-schedule/:id",
        element: (
          <ProtectedRoute allowedRoles={["expert", "farm-admin"]}>
            <FarmScheduleDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/farm-schedule-tree/:id",
        element: (
          <ProtectedRoute allowedRoles={["expert", "farm-admin"]}>
            <FarmScheduleTreeDetail />
          </ProtectedRoute>
        ),
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