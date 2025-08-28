import GardenList from "@/pages/gardens";
import ExpertList from "@/pages/users/expert/ExpertList";
import ExpertTaskQuestionPage from "@/pages/requests";
import FarmerTaskList from "@/pages/my-tasks";
import { RoutePaths } from "@/routes";

export const getDefaultRoute = (role) => {
  if (role === "admin")
    return { path: RoutePaths.EXPERT_LIST, component: <ExpertList /> };
  if (role === "farm-admin")
    return { path: RoutePaths.GARDEN_LIST, component: <GardenList /> };
  if (role === "expert")
    return { path: RoutePaths.REQUEST_LIST, component: <ExpertTaskQuestionPage /> };
  if (role === "farmer")
    return { path: RoutePaths.MY_TASK_LIST, component: <FarmerTaskList /> };
  return { path: RoutePaths.EXPERT_LIST, component: <ExpertList /> };
  
};
