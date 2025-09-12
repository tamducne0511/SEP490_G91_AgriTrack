// Import component Tabs từ Ant Design để tạo giao diện tab
import { Tabs } from "antd";
// Import trang quản lý danh mục thiết bị (categories/index.jsx)
import EquipmentCategoryPage from "./categories"; // index.jsx trong categories là category list
// Import trang danh sách thiết bị (equipments/index.jsx)
import EquipmentListPage from "./index"; // index.jsx ngoài cùng là equipment list
// Import các icon từ Ant Design để hiển thị trong tab
import { AppstoreOutlined, DatabaseOutlined } from "@ant-design/icons";
// Import component quản lý xuất/nhập thiết bị
import EquipmentChangeList from "./ListChangeEquip";

/**
 * EquipmentManager - Component chính quản lý thiết bị nông nghiệp
 * Sử dụng Tabs để chia thành 3 phần:
 * 1. Quản lý danh mục thiết bị
 * 2. Quản lý danh sách thiết bị
 * 3. Quản lý xuất/nhập thiết bị
 */
export default function EquipmentManager() {
  return (
    // Container chính với style card đẹp mắt
    <div
      style={{
        background: "#fff", // Nền trắng
        padding: 24, // Khoảng cách bên trong 24px
        borderRadius: 14, // Bo góc 14px
        minHeight: 450, // Chiều cao tối thiểu 450px
        boxShadow: "0 2px 12px #e0e6ed80", // Đổ bóng nhẹ
      }}
    >
      {/* Component Tabs chứa 3 tab con */}
      <Tabs
        defaultActiveKey="categories" // Tab mặc định được chọn là "categories"
        size="large" // Kích thước tab lớn
        items={[
          // Tab 1: Quản lý danh mục thiết bị
          {
            key: "categories", // Key duy nhất để identify tab
            label: (
              <span>
                <DatabaseOutlined /> Danh mục thiết bị {/* Icon + text hiển thị trên tab */}
              </span>
            ),
            children: <EquipmentCategoryPage />, // Component được render khi tab này active
          },
          // Tab 2: Quản lý danh sách thiết bị
          {
            key: "equipments", // Key duy nhất để identify tab
            label: (
              <span>
                <AppstoreOutlined /> Thiết bị {/* Icon + text hiển thị trên tab */}
              </span>
            ),
            children: <EquipmentListPage />, // Component được render khi tab này active
          },
          // Tab 3: Quản lý xuất/nhập thiết bị
           {
            key: "equip-changes", // Key duy nhất để identify tab
            label: (
              <span>
                <DatabaseOutlined /> Xuất / Nhập thiết bị {/* Icon + text hiển thị trên tab */}
              </span>
            ),
            children: <EquipmentChangeList />, // Component được render khi tab này active
          },
        ]}
      />
    </div>
  );
}
