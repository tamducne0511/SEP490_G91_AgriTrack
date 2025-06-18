import { Tabs } from "antd";
import EquipmentCategoryPage from "./categories"; // index.jsx trong categories là category list
import EquipmentListPage from "./index"; // index.jsx ngoài cùng là equipment list
import { AppstoreOutlined, DatabaseOutlined } from "@ant-design/icons";

export default function EquipmentManager() {
  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 14,
        minHeight: 450,
        boxShadow: "0 2px 12px #e0e6ed80",
      }}
    >
      <Tabs
        defaultActiveKey="categories"
        size="large"
        items={[
          {
            key: "categories",
            label: (
              <span>
                <DatabaseOutlined /> Danh mục thiết bị
              </span>
            ),
            children: <EquipmentCategoryPage />,
          },
          {
            key: "equipments",
            label: (
              <span>
                <AppstoreOutlined /> Thiết bị
              </span>
            ),
            children: <EquipmentListPage />,
          },
        ]}
      />
    </div>
  );
}
