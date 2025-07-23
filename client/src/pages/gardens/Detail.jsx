import { useGardenStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Spin,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function GardenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    gardenDetail,
    getGardenDetail,
    updateGarden,
    generateTrees,
    loading,
    trees,
    fetchTreesByGardenId,
  } = useGardenStore();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [treeGenerationVisible, setTreeGenerationVisible] = useState(false); // Modal for tree generation
  const [treeGenerationForm] = Form.useForm();
  const [grid, setGrid] = useState([]); // State to store the grid data

  useEffect(() => {
    getGardenDetail(id);
    fetchTreesByGardenId(id);
  }, [id, getGardenDetail]);

  useEffect(() => {
    if (gardenDetail) {
      form.setFieldsValue(gardenDetail);
      if (gardenDetail.image) {
        setFileList([
          {
            uid: "-1",
            name: "garden.jpg",
            url: gardenDetail.image.startsWith("http")
              ? gardenDetail.image
              : ImageBaseUrl + gardenDetail.image,
            status: "done",
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [gardenDetail, form]);

  // Set grid based on trees data
  useEffect(() => {
    if (trees?.length > 0) {
      const rows = Math.max(...trees.map((tree) => tree.row)); // Get the highest row number
      const cols = Math.max(...trees.map((tree) => tree.col)); // Get the highest col number
      const newGrid = [];

      for (let i = 0; i <= rows; i++) {
        const row = [];
        for (let j = 0; j <= cols; j++) {
          const tree = trees.find((t) => t.row === i && t.col === j);
          row.push(tree ? `${String.fromCharCode(65 + i)}${j}` : null); // Create grid with tree IDs
        }
        newGrid.push(row);
      }
      setGrid(newGrid);
    }
  }, [trees]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      let imageData = null;
      if (fileList[0]?.originFileObj) imageData = fileList[0].originFileObj;
      else if (fileList[0]?.url) imageData = fileList[0].url;
      await updateGarden(id, { ...values, image: imageData });
      message.success("Cập nhật thành công!");
      getGardenDetail(id);
      setIsEditMode(false); // Switch back to view mode
    } catch (err) {
      message.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateTrees = async () => {
    try {
      const values = await treeGenerationForm.validateFields();
      await generateTrees(id, values);
      message.success("Đã tạo cây thành công!");
      setTreeGenerationVisible(false); // Close modal after generation
    } catch (err) {
      message.error("Tạo cây thất bại!");
    }
  };

  if (loading || !gardenDetail)
    return <Spin style={{ margin: "80px auto", display: "block" }} />;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* Title + Back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined style={{ fontSize: 18 }} />}
          onClick={() => navigate(-1)}
          style={{
            borderRadius: 10,
            fontWeight: 500,
            padding: "0 20px",
            height: 40,
            borderColor: "#d9d9d9",
          }}
        >
          Quay lại
        </Button>
        <Title
          level={3}
          style={{ margin: 0, color: "#1a1a1a", fontWeight: 600 }}
        >
          Vườn: {gardenDetail.name}
        </Title>

        {/* Buttons for Edit and Generate Trees */}
        <div style={{ display: "flex", gap: 16 }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => setIsEditMode(true)} // Switch to edit mode
            type="primary"
            style={{
              borderRadius: 10,
              fontWeight: 500,
              padding: "0 24px",
              height: 40,
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            onClick={() => setTreeGenerationVisible(true)}
            disabled={trees.length > 0} // Disable if trees exist
            style={{
              background: trees.length > 0 ? "grey" : "#23643A",
              borderRadius: 10,
              fontWeight: 500,
              padding: "0 24px",
              height: 40,
            }}
          >
            Đánh số cây
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* Garden Info (View/Edit Mode) */}
        <div style={{ flex: 1, minWidth: 360 }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
            }}
            bodyStyle={{ padding: 24 }}
            hoverable
          >
            <Title
              level={5}
              style={{ marginBottom: 16, color: "#1a1a1a", fontWeight: 600 }}
            >
              Thông tin Vườn
            </Title>

            {/* Display mode */}
            {!isEditMode ? (
              <>
                <div>
                  <img
                    src={fileList[0]?.url || "default-image.png"}
                    alt="garden"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>
                <Text strong>Tên vườn: </Text> {gardenDetail.name}
                <br />
                <Text strong>Mô tả: </Text> {gardenDetail.description}
              </>
            ) : (
              // Edit mode (form)
              <Form form={form} layout="vertical">
                <Form.Item label="Ảnh vườn">
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    maxCount={1}
                    fileList={fileList}
                    onChange={handleChange}
                    accept="image/*"
                  >
                    {fileList.length >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8, fontSize: 13 }}>
                          Tải ảnh
                        </div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Tên vườn"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên vườn" },
                  ]}
                >
                  <Input placeholder="Nhập tên vườn" size="large" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <Input.TextArea
                    placeholder="Nhập mô tả vườn"
                    rows={4}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
                <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                  <Button
                    type="primary"
                    style={{
                      background: "#23643A",
                      borderRadius: 10,
                      fontWeight: 500,
                      padding: "0 24px",
                      height: 40,
                    }}
                    onClick={handleSave}
                    loading={saving}
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    style={{
                      borderRadius: 10,
                      fontWeight: 500,
                      padding: "0 24px",
                      height: 40,
                    }}
                    onClick={() => form.resetFields()}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </div>

        {/* Display Tree Grid */}
        {trees.length > 0 && (
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
            }}
            bodyStyle={{ padding: 24 }}
            hoverable
          >
            <Title
              level={5}
              style={{ marginBottom: 16, color: "#1a1a1a", fontWeight: 600 }}
            >
              Lưới Cây
            </Title>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${grid[0]?.length}, 1fr)`,
                gap: 8,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Button
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      width: "100%",
                      height: 50,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                      textAlign: "center",
                    }}
                  >
                    {cell || "-"}
                  </Button>
                ))
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Tree Generation Modal */}
      <Modal
        title="Đánh số cây cho Vườn"
        open={treeGenerationVisible}
        onOk={handleGenerateTrees}
        onCancel={() => setTreeGenerationVisible(false)}
        okText="Tạo cây"
        cancelText="Hủy"
      >
        <Form form={treeGenerationForm} layout="vertical">
          <Form.Item
            name="row"
            label="Số hàng"
            rules={[
              { required: true, message: "Vui lòng nhập số hàng" },
              {
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject(
                      "Số hàng phải là số nguyên dương lớn hơn 0"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số hàng" min={1} />
          </Form.Item>
          <Form.Item
            name="col"
            label="Số cột"
            rules={[
              { required: true, message: "Vui lòng nhập số cột" },
              {
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject(
                      "Số cột phải là số nguyên dương lớn hơn 0"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số cột" min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
