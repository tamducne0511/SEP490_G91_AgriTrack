import { useAuthStore, useGardenStore, useUserStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import { Button, Collapse, Empty, Spin, Tag, Typography, Avatar } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;

export default function ExpertTaskQuestionPage() {
  const { user } = useAuthStore();
  const expertId = user?._id;
  const navigate = useNavigate();
  const {
    getListFarmAssignedExpert,
    listFarmAssignedExpert,
    loading: loadingFarms,
  } = useUserStore();

  // Store: Garden + Tree
  const {
    gardensByFarm: gardens,
    loadingGardensByFarm,
    fetchGardensByFarmId,
    trees,
    loadingTrees,
    fetchTreesByGardenId,
  } = useGardenStore();

  // State điều khiển collapse
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [activeGardenIds, setActiveGardenIds] = useState({}); // { [farmId]: gardenId }
  const [treeGrid, setTreeGrid] = useState({}); // { [gardenId]: grid[][] }

  // Lấy danh sách farm của chuyên gia
  useEffect(() => {
    if (expertId) getListFarmAssignedExpert(expertId);
  }, [expertId]);

  // Khi click vào farm, lấy list garden
  const handleFarmCollapse = async ([farmId]) => {
    setActiveFarmId(farmId);
    setActiveGardenIds({}); // Reset khi đổi farm
    if (farmId) await fetchGardensByFarmId(farmId, { pageSize: 1000 });
  };

  // Khi click vào garden, lấy list tree
  const handleGardenCollapse = async (farmId, [gardenId]) => {
    setActiveGardenIds((prev) => ({ ...prev, [farmId]: gardenId }));
    if (gardenId) await fetchTreesByGardenId(gardenId);
  };

  // Build grid cho garden hiện tại
  useEffect(() => {
    if (trees?.length > 0) {
      const rows = Math.max(...trees.map((t) => t.row));
      const cols = Math.max(...trees.map((t) => t.col));
      const grid = [];
      for (let i = 0; i <= rows; i++) {
        const row = [];
        for (let j = 0; j <= cols; j++) {
          const tree = trees.find((t) => t.row === i && t.col === j);
          row.push(tree || null);
        }
        grid.push(row);
      }
      // Gán grid vào state với key là gardenId
      if (trees[0]?.gardenId) {
        setTreeGrid((prev) => ({ ...prev, [trees[0].gardenId]: grid }));
      }
    }
  }, [trees]);

  // Chuẩn hóa data farm list
  const farms = listFarmAssignedExpert?.list || listFarmAssignedExpert || [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        Quản lý câu hỏi công việc theo trang trại
      </Title>

      {loadingFarms ? (
        <Spin />
      ) : farms.length > 0 ? (
        <Collapse
          accordion
          onChange={handleFarmCollapse}
          activeKey={activeFarmId}
        >
          {farms.map(({ farm }) => (
            <Panel
              header={
                <span style={{ fontWeight: 600 }}>
                  🌿 {farm.name}
                  <Tag style={{ marginLeft: 8 }} color="blue">
                    {farm.address}
                  </Tag>
                </span>
              }
              key={farm._id}
            >
              {loadingGardensByFarm && activeFarmId === farm._id ? (
                <Spin />
              ) : gardens?.length > 0 ? (
                <Collapse
                  accordion
                  onChange={([gardenId]) =>
                    handleGardenCollapse(farm._id, [gardenId])
                  }
                  activeKey={activeGardenIds[farm._id]}
                  style={{ marginTop: 10 }}
                >
                  {gardens.map((garden) => (
                    <Panel
                      key={garden._id}
                      header={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {garden.image ? (
                            <Avatar
                              shape="square"
                              src={ImageBaseUrl + garden.image}
                              size={32}
                            />
                          ) : (
                            <Avatar shape="square" size={32}>
                              {garden.name?.slice(0, 1) || "V"}
                            </Avatar>
                          )}
                          <span style={{ fontWeight: 500 }}>{garden.name}</span>
                          <Tag color={garden.status ? "green" : "red"}>
                            {garden.status ? "Đang hoạt động" : "Ngừng"}
                          </Tag>
                        </div>
                      }
                    >
                      {loadingTrees &&
                      activeGardenIds[farm._id] === garden._id ? (
                        <Spin />
                      ) : treeGrid[garden._id]?.length > 0 ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${
                              treeGrid[garden._id][0]?.length
                            }, 1fr)`,
                            gap: 8,
                            marginTop: 16,
                          }}
                        >
                          {treeGrid[garden._id].map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                              <Button
                                key={`${rowIndex}-${colIndex}`}
                                style={{
                                  width: "100%",
                                  height: 50,
                                  backgroundColor: cell ? "#f0f0f0" : "#fafafa",
                                  borderRadius: 8,
                                  textAlign: "center",
                                  border: cell
                                    ? "1px solid #23643A"
                                    : "1px dashed #ccc",
                                  color: "#23643A",
                                  fontWeight: 500,
                                  position: "relative",
                                }}
                                disabled={!cell}
                                onClick={() => {
                                  if (cell)
                                    navigate(`/request-detail/${cell._id}`);
                                }}
                              >
                                {cell
                                  ? `${String.fromCharCode(65 + cell.row)}${
                                      cell.col
                                    }`
                                  : "-"}
                                {cell && cell.questionCount > 0 && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      top: 4,
                                      right: 10,
                                      background:
                                        cell?.latestQuestion?.user?.role ===
                                        "expert"
                                          ? "green"
                                          : "#ff4d4f",
                                      color: "#fff",
                                      borderRadius: 9,
                                      fontSize: 12,
                                      padding: "2px 7px",
                                    }}
                                  >
                                    {cell?.latestQuestion?.user?.role ===
                                    "expert"
                                      ? " ✅ "
                                      : "!"}
                                  </span>
                                )}
                              </Button>
                            ))
                          )}
                        </div>
                      ) : (
                        <Empty
                          description="Không có cây nào trong vườn này"
                          style={{ padding: 12 }}
                        />
                      )}
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty description="Không có vườn nào trong farm này" />
              )}
            </Panel>
          ))}
        </Collapse>
      ) : (
        <Empty description="Chuyên gia chưa được gán vào vườn nào" />
      )}
    </div>
  );
}
