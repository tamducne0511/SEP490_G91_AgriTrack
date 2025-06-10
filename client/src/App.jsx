import { ConfigProvider } from "antd";
import AppRoutes from "./routes";
import "./style.css";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#23643A",
          colorPrimaryHover: "#388e5e",
          colorPrimaryActive: "#1b4c2c",
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
};

export default App;
