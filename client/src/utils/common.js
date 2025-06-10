import GardenList from "@/pages/gardens";
import ExpertList from "@/pages/users/expert/ExpertList";
import { RoutePaths } from "@/routes";

export const getDefaultRoute = (role) => {
  if (role === "admin")
    return { path: RoutePaths.EXPERT_LIST, component: <ExpertList /> };
  if (role === "farm-admin")
    return { path: RoutePaths.GARDEN_LIST, component: <GardenList /> };

  return { path: RoutePaths.EXPERT_LIST, component: <ExpertList /> };
};
