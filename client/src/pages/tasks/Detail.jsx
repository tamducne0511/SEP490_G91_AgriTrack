import { useGardenStore, useTaskStore, useUserStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
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
  Select,
  Tag,
  Tooltip,
  Descriptions,
  List,
  Avatar,
} from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const typeLabel = {
  collect: "Thu hoạch",
  "task-care": "Chăm sóc",
};

const typeColor = {
  collect: "geekblue",
  "task-care": "green",
};

const priorityColor = {
  high: "red",
  medium: "gold",
  low: "green",
};

const priorityLabel = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { fetchTaskDetail, taskDetail, updateTask, loading } = useTaskStore();
  const { gardens, fetchGardens } = useGardenStore();
  const { fetchUserDetail, userDetail, loading: userLoading } = useUserStore();
  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedGardenId, setSelectedGardenId] = useState(undefined);

  useEffect(() => {
    fetchTaskDetail(id);
    fetchGardens();
  }, [id, fetchTaskDetail, fetchGardens]);

  useEffect(() => {
    if (taskDetail) {
      form.setFieldsValue(taskDetail);
      if (taskDetail.image) {
        setFileList([
          {
            uid: "-1",
            name: "task.jpg",
            url: taskDetail.image.startsWith("http")
              ? taskDetail.image
              : ImageBaseUrl + taskDetail.image,
            status: "done",
          },
        ]);
      } else {
        setFileList([]);
      }
      setSelectedGardenId(taskDetail.gardenId);
    }
  }, [taskDetail, form]);

  useEffect(() => {
    if (taskDetail?.farmerId) {
      fetchUserDetail(taskDetail.farmerId);
    }
  }, [taskDetail, fetchUserDetail]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      if (!selectedGardenId) {
        message.error("Vui lòng chọn vườn!");
        return;
      }
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("gardenId", selectedGardenId);
      formData.append("type", values.type);
      formData.append("priority", values.priority);
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (fileList[0]?.url) {
        formData.append("image", fileList[0].url);
      }
      await updateTask(id, formData);
      message.success("Cập nhật công việc thành công!");
      setEditMode(false);
    } catch {
      message.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  if (loading || !taskDetail) return <Spin style={{ margin: 80 }} />;

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const garden = gardens.find((g) => g._id === taskDetail.gardenId);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 2px 16px #1b7a4022",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 1200,
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
          style={{ margin: 0, color: "#1a1a1a", fontWeight: 600 }}
        >
          Chi tiết công việc
        </Title>
      </div>

      <div style={{ display: "flex", gap: 36 }}>
        <div style={{ flex: 1.2, minWidth: 340 }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 13,
              boxShadow: "0 1px 8px #0001",
              marginBottom: 10,
            }}
            bodyStyle={{ padding: 24, paddingBottom: 12 }}
          >
            <Title
              level={5}
              style={{ marginBottom: 12, color: "#1a1a1a", fontWeight: 600 }}
            >
              {editMode ? "Chỉnh sửa thông tin" : "Thông tin công việc"}
            </Title>
            {editMode ? (
              <Form form={form} layout="vertical">
                <Form.Item label="Ảnh công việc">
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    maxCount={1}
                    fileList={fileList}
                    onChange={handleChange}
                    accept="image/*"
                    style={{ width: "100%" }}
                  >
                    {fileList.length >= 1 ? null : (
                      <div
                        style={{
                          width: "100%",
                          height: 120,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px dashed #d9d9d9",
                          borderRadius: 8,
                          background: "#fafafa",
                        }}
                      >
                        <PlusOutlined style={{ fontSize: 24, color: "#999" }} />
                        <div
                          style={{ marginTop: 8, color: "#666", fontSize: 14 }}
                        >
                          Tải ảnh
                        </div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="name"
                  label="Tên công việc"
                  rules={[{ required: true, message: "Nhập tên công việc" }]}
                >
                  <Input
                    placeholder="Tên công việc"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: "Nhập mô tả" }]}
                >
                  <Input
                    placeholder="Mô tả"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="gardenId"
                  label="Vườn"
                  rules={[{ required: true, message: "Chọn vườn" }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn vườn"
                    value={selectedGardenId}
                    options={gardens.map((g) => ({
                      value: g._id,
                      label: g.name,
                    }))}
                    onChange={setSelectedGardenId}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="type"
                  label="Loại công việc"
                  rules={[{ required: true, message: "Chọn loại công việc" }]}
                >
                  <Select
                    placeholder="Chọn loại"
                    options={[
                      { value: "collect", label: "Thu hoạch" },
                      { value: "task-care", label: "Chăm sóc" },
                    ]}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="priority"
                  label="Độ ưu tiên"
                  rules={[{ required: true, message: "Chọn độ ưu tiên" }]}
                >
                  <Select
                    placeholder="Chọn độ ưu tiên"
                    options={[
                      { value: "high", label: "Cao" },
                      { value: "medium", label: "Trung bình" },
                      { value: "low", label: "Thấp" },
                    ]}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                  <Button
                    type="primary"
                    style={{
                      background: "#23643A",
                      borderRadius: 8,
                      fontWeight: 500,
                      minWidth: 120,
                    }}
                    onClick={handleSave}
                    loading={saving}
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    style={{
                      borderRadius: 8,
                      fontWeight: 500,
                      minWidth: 120,
                    }}
                    onClick={() => setEditMode(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            ) : (
              <div>
                {taskDetail.image && (
                  <img
                    src={
                      taskDetail.image.startsWith("http")
                        ? taskDetail.image
                        : ImageBaseUrl + taskDetail.image
                    }
                    alt="Task"
                    style={{
                      width: "100%",
                      maxWidth: 300,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  />
                )}
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Tên công việc: </Text>
                  <Text>{taskDetail.name}</Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Mô tả: </Text>
                  <Text>{taskDetail.description}</Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Loại công việc: </Text>
                  <Tag color={typeColor[taskDetail.type]}>
                    {typeLabel[taskDetail.type]}
                  </Tag>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Độ ưu tiên: </Text>
                  <Tag color={priorityColor[taskDetail.priority]}>
                    {priorityLabel[taskDetail.priority]}
                  </Tag>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Vườn: </Text>
                  <Text>{garden?.name || "Không xác định"}</Text>
                </div>
                <Button
                  type="primary"
                  style={{
                    background: "#23643A",
                    borderRadius: 8,
                    fontWeight: 500,
                    minWidth: 120,
                  }}
                  onClick={() => setEditMode(true)}
                >
                  Chỉnh sửa
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div style={{ flex: 1.8, minWidth: 340 }}>
          <Card
            title="Thông tin chi tiết"
            bordered={false}
            style={{
              borderRadius: 13,
              marginBottom: 18,
              boxShadow: "0 1px 8px #0001",
            }}
          >
            <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="Loại công việc">
                <Tag color={typeColor[taskDetail.type]}>
                  {typeLabel[taskDetail.type]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Độ ưu tiên">
                <Tag color={priorityColor[taskDetail.priority]}>
                  {priorityLabel[taskDetail.priority] || taskDetail.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Vườn">
                {garden?.name || <Text type="secondary">Không xác định</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(taskDetail.createdAt).toLocaleString("vi-VN")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  );
}
