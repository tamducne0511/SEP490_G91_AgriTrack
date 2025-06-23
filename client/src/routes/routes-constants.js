export const RoutePaths = {
  // non auth
  LOGIN: "/login",

  // auth
  HOME: "/",
  EXPERT_LIST: "/expert-list",
  EXPERT_DETAIL: (id) => `/expert-detail/${id}`,
  FARMER_LIST: "/farmer-list",
  FARMER_DETAIL: (id) => `/farm-detail/${id}`,
  FARM_LIST: "/farm-list",
  FARM_ADMIN_LIST: "/farm-admin-list",
  FARM_ADMIN_DETAIL: (id) => `/farm-admin-detail/${id}`,
  GARDEN_LIST: "/garden-list",
  NOTIFICATION_LIST: "/notification-list",
  TASK_LIST: "/task-list",
  EQUIPMENT_LIST: "/equipment-list",
  EQUIPMENT_MANAGER: "/equipment-manager",
  EQUIPMENT_CATEGORY_LIST: "/equipment-category-list",
  MY_TASK_LIST: "/my-task-list",
  REQUEST_LIST: "/request-list",
  CHANGE_PASSWORD: "/change-password",
  DASHBOARD: "/dashboard",
  USER_PROFILE: "/user-profile",
};
