import React, { useEffect } from "react";
import { useDashboardStore } from "@/stores";
import { Card, Spin, Table, Row, Col, Tooltip as AntdTooltip } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Helper để rút gọn label và hiển thị tooltip
const truncate = (str, n) =>
  str.length > n ? str.substr(0, n - 1) + "…" : str;

// Đặt màu cho Pie chart
const PIE_COLORS = [
  "#FFD233",
  "#FF7A57",
  "#4972b3",
  "#6B47DC",
  "rgb(41, 92, 45)",
];

export default function Dashboard() {
  const { dashboard, fetchDashboard, loading } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const barData = [
    { label: "Trang trại", value: dashboard?.totalFarm || 0 },
    { label: "Vườn", value: dashboard?.totalGarden || 0 },
    { label: "Tổng Task", value: dashboard?.totalTask || 0 },
    { label: "Task Chăm sóc", value: dashboard?.totalCareTask || 0 },
    { label: "Task Thu hoạch", value: dashboard?.totalCollectTask || 0 },
    { label: "Nông dân", value: dashboard?.totalFarmer || 0 },
    { label: "Chủ trang trại", value: dashboard?.totalFarmAdmin || 0 },
    { label: "Chuyên gia", value: dashboard?.totalExpert || 0 },
    { label: "Thiết bị", value: dashboard?.totalEquipment || 0 },
    { label: "Loại thiết bị", value: dashboard?.totalEquipmentCategory || 0 },
  ];

  // Pie data
  const pieStaff = [
    { name: "Chủ trang trại", value: dashboard?.totalFarmAdmin || 0 },
    { name: "Nông dân", value: dashboard?.totalFarmer || 0 },
    { name: "Chuyên gia", value: dashboard?.totalExpert || 0 },
  ];
  const pieTask = [
    { name: "Task Chăm sóc", value: dashboard?.totalCareTask || 0 },
    { name: "Task Thu hoạch", value: dashboard?.totalCollectTask || 0 },
  ];

  // Table data
  const summaryList = barData;

  const columns = [
    { title: "Hạng mục", dataIndex: "label", key: "label" },
    { title: "Số lượng", dataIndex: "value", key: "value" },
  ];

  return (
    <div style={{ padding: 32, minHeight: "100vh", background: "#f6f6f6" }}>
      <h2 style={{ margin: "0 0 32px 8px", fontWeight: 700, fontSize: 24 }}>
        Dashboard Tổng Quan
      </h2>
      <Card
        style={{
          marginBottom: 32,
          boxShadow: "0 2px 8px #0001",
          borderRadius: 13,
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
        }}
        bodyStyle={{ padding: 32 }}
      >
        {loading || !dashboard ? (
          <Spin style={{ margin: 60 }} />
        ) : (
          <Row gutter={[32, 32]} align="top" justify="center">
            {/* Bar Chart */}
            <Col xs={24} lg={16}>
              <div
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 16,
                  boxShadow: "0 1px 8px #0001",
                  height: 420,
                  minWidth: 600,
                }}
              >
                <h3 style={{ marginBottom: 20, textAlign: "center" }}>
                  Thống kê số lượng
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="label"
                      interval={0}
                      tick={({ x, y, payload }) => (
                        <AntdTooltip title={payload.value}>
                          <text
                            x={x}
                            y={y + 14}
                            textAnchor="middle"
                            fontSize={13}
                            fill="#666"
                            style={{ cursor: "pointer" }}
                          >
                            {truncate(payload.value, 10)}
                          </text>
                        </AntdTooltip>
                      )}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="rgb(41, 92, 45)" barSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>
            {/* Pie Charts */}
            <Col xs={24} lg={8}>
              <div
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 16,
                  boxShadow: "0 1px 8px #0001",
                  marginBottom: 24,
                }}
              >
                <h4 style={{ textAlign: "center" }}>Tỉ lệ nhân sự</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieStaff}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ percent }) =>
                        percent > 0 ? `${(percent * 100).toFixed(1)}%` : ""
                      }
                    >
                      {pieStaff.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 16,
                  boxShadow: "0 1px 8px #0001",
                }}
              >
                <h4 style={{ textAlign: "center" }}>Tỉ lệ loại task</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieTask}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ percent }) =>
                        percent > 0 ? `${(percent * 100).toFixed(1)}%` : ""
                      }
                    >
                      {pieTask.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[(idx + 3) % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
            {/* Table List */}
            <Col xs={24}>
              <div
                style={{
                  marginTop: 32,
                  background: "#fff",
                  borderRadius: 15,
                  boxShadow: "0 1px 8px #0001",
                  maxWidth: 1100,
                  marginLeft: "auto",
                  marginRight: "auto",
                  overflowX: "auto",
                }}
              >
                <Table
                  dataSource={summaryList}
                  columns={columns}
                  pagination={false}
                  size="middle"
                  rowKey="label"
                />
              </div>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
}
