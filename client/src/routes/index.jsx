import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import PublicLayout from "@/layouts/PublicLayout";
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
        path: "/farmer-detail/:id",
        element: <FarmerDetail />,
      },
      {
        path: "/garden-detail/:id",
        element: <GardenDetail />,
      },
      {
        path: "/task-detail/:id",
        element: <TaskDetail />,
      },
      {
        path: "/my-task/:id",
        element: <FarmerTaskDetail />,
      },
      {
        path: "/equipment-detail/:id",
        element: <EquipmentDetail />,
      },
      {
        path: "/my-farm-task-question/:id",
        element: <TreeQuestionDetail />,
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
        path: RoutePaths.MY_FARM_TASK_QUESTION,
        element: <FarmTaskQuestionList />,
      },
      {
        path: RoutePaths.MY_FARM_TASK_QUESTION_CREATE,
        element: <AddTaskQuestion />,
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
        path: RoutePaths.TASK_CREATE,
        element: <TaskCreate />,
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
        path: RoutePaths.REQUEST_LIST,
        element: <ExpertTaskQuestionPage />,
      },
      {
        path: "/request-detail/:id",
        element: <TreeQuestionDetail />,
      },
      {
        path: RoutePaths.MY_TASK_LIST,
        element: <FarmerTaskList />,
      },
      {
        path: RoutePaths.FARM_SCHEDULE_LIST,
        element: <FarmListPage />,
      },
      {
        path: "/farm-schedule/:id",
        element: <FarmScheduleDetailPage />,
      },
      {
        path: "/farm-schedule-tree/:id",
        element: <FarmScheduleTreeDetail />,
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
