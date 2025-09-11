import { useAuthStore, useUserStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import { List, Card, Button, Spin, Typography, Tag, Avatar } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

export default function FarmListPage() {
  const { user } = useAuthStore();
  const expertId = user?._id;
  const { getListFarmAssignedExpert, listFarmAssignedExpert, loading } =
    useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (expertId) {
      getListFarmAssignedExpert(expertId);
    }
  }, [expertId]);

  const farms = listFarmAssignedExpert || [];

  return (
    <div>
      <Card
        bordered
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3} style={{ marginBottom: 24 }}>
          Danh sách trang trại của tôi
        </Title>
        {loading ? (
          <Spin />
        ) : (
          <List
            grid={{ gutter: 18, column: 2 }}
            dataSource={farms}
            renderItem={({ farm }, idx) => (
              <List.Item>
                <Card
                  bordered
                  style={{ minHeight: 170 }}
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <Avatar
                        shape="square"
                        size={44}
                        src={ImageBaseUrl + farm.image}
                        style={{ background: "#f0f0f0" }}
                      >
                        {farm.name?.[0] || "F"}
                      </Avatar>
                      <span style={{ fontWeight: 600, fontSize: 17 }}>
                        {farm.name}
                      </span>
                    </div>
                  }
                  extra={
                    <Button
                      type="primary"
                      onClick={() => navigate(`/farm-schedule/${farm._id}`)}
                    >
                      Chi tiết
                    </Button>
                  }
                >
                  <div>
                    <Tag color="green">#{idx + 1}</Tag>
                    <Text type="secondary">{farm.address}</Text>
                  </div>
                  {farm.description && (
                    <div style={{ marginTop: 6 }}>
                      <Text>{farm.description}</Text>
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
