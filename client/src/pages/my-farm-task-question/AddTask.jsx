import { useEffect, useState } from "react";
import { useAuthStore, useGardenStore, useTaskQuestionStore } from "@/stores";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
  Spin,
  Card,
  Typography,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createNotificationQuesApi } from "@/services";

const { Title, Text } = Typography;

// Helper: Chuyển số row -> A, B, C...
const getRowLabel = (row) => String.fromCharCode(65 + row);

export default function AddTaskQuestion() {
  const [form] = Form.useForm();
  const {
    gardens,
    fetchGardens,
    trees,
    fetchTreesByGardenId,
    loading: gardenLoading,
  } = useGardenStore();
  const { creating, createQuestion } = useTaskQuestionStore();
  const { user } = useAuthStore();

  const [selectedGarden, setSelectedGarden] = useState();
  const [selectedTree, setSelectedTree] = useState();

  const availableGardens = gardens.filter(garden =>
    // Chỉ hiển thị garden còn hoạt động 
    garden.status === true
  );
  useEffect(() => {
    fetchGardens();
  }, []);

  useEffect(() => {
    if (selectedGarden) fetchTreesByGardenId(selectedGarden);
    else setSelectedTree(undefined);
  }, [selectedGarden]);

  // Tính số row, col lớn nhất để tạo grid
  const maxRow = trees.length ? Math.max(...trees.map((t) => t.row)) : 0;
  const maxCol = trees.length ? Math.max(...trees.map((t) => t.col)) : 0;

  // Hiển thị grid cây (label: A1, A2, ...)
  const renderTreeGrid = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${maxCol + 1}, 48px)`,
        gap: 10,
        background: "#f6faf8",
        padding: 18,
        borderRadius: 10,
        border: "1.5px solid #e1eae3",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: maxRow + 1 }, (_, rowIdx) =>
        Array.from({ length: maxCol + 1 }, (_, colIdx) => {
          const tree = trees.find((t) => t.row === rowIdx && t.col === colIdx);
          if (!tree)
            return (
              <div
                key={`empty-${rowIdx}-${colIdx}`}
                style={{
                  width: 48,
                  height: 48,
                  background: "#eef2f3",
                  borderRadius: 7,
                  border: "1px dashed #b7b7b7",
                }}
              />
            );
          const isSelected = selectedTree === tree._id;
          return (
            <Button
              key={tree._id}
              type={isSelected ? "primary" : "default"}
              onClick={() => setSelectedTree(tree._id)}
              style={{
                width: 48,
                height: 48,
                background: isSelected ? "#23643A" : "#fff",
                color: isSelected ? "#fff" : "#23643A",
                border: `2px solid ${isSelected ? "#23643A" : "#b7b7b7"}`,
                borderRadius: 7,
                fontWeight: 600,
                fontSize: 15,
                boxShadow: isSelected
                  ? "0 2px 6px #23643A20"
                  : "0 1px 2px #eaeaea70",
                transition: "all 0.18s",
                outline: "none",
              }}
              tabIndex={-1}
            >
              {getRowLabel(tree.row)}
              {tree.col + 1}
            </Button>
          );
        })
      )}
    </div>
  );

  const handleSubmit = async (values) => {
    if (!selectedGarden) return message.error("Vui lòng chọn vườn");
    if (!selectedTree) return message.error("Vui lòng chọn cây");
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("treeId", selectedTree);
    if (values.image?.file) formData.append("image", values.image.file);

    try {
      const res = await createQuestion(formData);

      message.success("Gửi câu hỏi thành công!");
      await createNotificationQuesApi({
        questionId: res._id,
        title: `${user?.fullName} đã gửi một câu hỏi cho chuyên gia`,
        content: res?.content || "N/A",
      });
      form.resetFields();
      setSelectedGarden(undefined);
      setSelectedTree(undefined);
    } catch (err) {
      message.error(err?.message || "Không thể gửi câu hỏi");
    }
  };
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 36,
        margin: "40px auto",
        boxShadow: "0 4px 24px #1b7a4020",
      }}
    >
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{
          background: "none",
          boxShadow: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              borderRadius: 8,
              fontWeight: 500,
              padding: "0 16px",
              height: 38,
            }}
          >
            Quay lại
          </Button>
          <Title
            level={4}
            style={{ color: "#23643A", margin: 0, textAlign: "center" }}
          >
            Đặt câu hỏi mới
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label={<b>Chọn vườn</b>}
            required
            rules={[{ required: true, message: "Chọn vườn" }]}
          >
            <Select
              value={selectedGarden}
              onChange={(val) => {
                setSelectedGarden(val);
                setSelectedTree(undefined);
              }}
              placeholder="Chọn vườn"
              loading={gardenLoading}
              options={availableGardens.map((g) => ({
                value: g._id,
                label: g.name,
              }))}
              allowClear
              size="large"
              style={{
                borderRadius: 8,
                border: "1.5px solid #23643A33",
                background: "#fafcfb",
              }}
            />
          </Form.Item>
          {selectedGarden && (
            <Form.Item
              label={<b>Chọn cây (dạng lưới)</b>}
              required
              style={{ marginBottom: 10 }}
            >
              {gardenLoading ? (
                <Spin />
              ) : trees.length ? (
                renderTreeGrid()
              ) : (
                <Text type="secondary">Không có dữ liệu cây.</Text>
              )}
              {selectedTree === undefined && (
                <div style={{ color: "#eb2f06", marginTop: 4 }}>
                  * Vui lòng chọn một cây
                </div>
              )}
            </Form.Item>
          )}
          <Form.Item
            name="title"
            label={<b>Tiêu đề</b>}
            rules={[{ required: true, message: "Nhập tiêu đề" }]}
            style={{ marginBottom: 14 }}
          >
            <Input placeholder="Nhập tiêu đề câu hỏi" size="large" />
          </Form.Item>
          <Form.Item
            name="content"
            label={<b>Nội dung</b>}
            rules={[{ required: true, message: "Nhập nội dung" }]}
            style={{ marginBottom: 14 }}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung câu hỏi"
              size="large"
              style={{
                borderRadius: 8,
                border: "1.3px solid #d8e9e2",
                background: "#f9fafb",
              }}
            />
          </Form.Item>
          <Form.Item name="image" label={<b>Ảnh minh hoạ</b>}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button
                icon={<UploadOutlined />}
                style={{
                  borderRadius: 7,
                  border: "1.5px solid #b7b7b7",
                  fontWeight: 500,
                  background: "#f9fafb",
                }}
              >
                Tải ảnh
              </Button>
            </Upload>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={creating}
            style={{
              background: "#23643A",
              borderColor: "#23643A",
              fontWeight: 600,
              borderRadius: 8,
              width: "100%",
              fontSize: 17,
              marginTop: 6,
              boxShadow: "0 2px 6px #23643A20",
              height: 44,
            }}
          >
            Gửi câu hỏi
          </Button>
        </Form>
      </Card>
    </div>
  );
}
