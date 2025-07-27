const LIMIT_ITEM_PER_PAGE = 20;
const USER_ROLE = {
  admin: "admin",
  farmAdmin: "farm-admin",
  farmer: "farmer",
  expert: "expert",
};

const EQUIPMENT_CHANGE_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

const EQUIPMENT_CHANGE_TYPE = {
  import: "import",
  export: "export",
};

const TASK_ASSIGN_STATUS = {
  unassign: "un-assign",
  assigned: "assigned",
  inprogress: "in-progress",
  canceled: "canceled",
  completed: "completed",
};

const TASK_TYPE = {
  collect: "collect",
  taskCare: "task-care",
};

module.exports = {
  LIMIT_ITEM_PER_PAGE,
  USER_ROLE,
  EQUIPMENT_CHANGE_STATUS,
  EQUIPMENT_CHANGE_TYPE,
  TASK_ASSIGN_STATUS,
  TASK_TYPE,
};
