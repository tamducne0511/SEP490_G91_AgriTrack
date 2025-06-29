import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Card,
  Descriptions,
  Tag,
  Avatar,
  List,
  Spin,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useGardenStore, useTaskStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";

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

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { fetchTaskDetail, taskDetail, updateTask, loading } = useTaskStore();
  const { gardens, fetchGardens } = useGardenStore();

  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTaskDetail(id);
    fetchGardens();
  }, [id]);

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
    }
  }, [taskDetail]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = form.getFieldsValue();
      let imageData = null;
      if (fileList[0]?.originFileObj) imageData = fileList[0].originFileObj;
      else if (fileList[0]?.url) imageData = fileList[0].url;
      await updateTask(id, { ...values, image: imageData });
      message.success("Cập nhật công việc thành công!");
      fetchTaskDetail(id);
    } catch {
      message.error("Cập nhật thất bại!");
    }
    setSaving(false);
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
        margin: "30px auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 2px 16px #1b7a4022",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Back + Title */}
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
        <Title level={4} style={{ margin: 0 }}>
          Chi tiết công việc
        </Title>
      </div>

      <div style={{ display: "flex", gap: 36 }}>
        {/* Left column */}
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
            <Title level={5} style={{ marginBottom: 12 }}>
              Thông tin & chỉnh sửa
            </Title>
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
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item
                name="name"
                label="Tên công việc"
                rules={[{ required: true, message: "Nhập tên công việc" }]}
              >
                <Input placeholder="Tên công việc" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Nhập mô tả" }]}
              >
                <Input placeholder="Mô tả" />
              </Form.Item>

              <Form.Item
                name="gardenId"
                label="Vườn"
                rules={[{ required: true, message: "Chọn vườn" }]}
              >
                <Select
                  placeholder="Chọn vườn"
                  options={gardens.map((g) => ({
                    value: g._id,
                    label: g.name,
                  }))}
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
              </div>
            </Form>
          </Card>
        </div>

        {/* Right column: task info */}
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
                  {taskDetail.priority}
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

          <Card
            title="Người đang thực hiện"
            bordered={false}
            style={{
              borderRadius: 13,
              boxShadow: "0 1px 8px #0001",
            }}
          >
            <List
              dataSource={taskDetail.farmers || []}
              renderItem={(farmer) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#a6d6b9" }}>
                        {getInitials(farmer.fullName)}
                      </Avatar>
                    }
                    title={<Text strong>{farmer.fullName}</Text>}
                    description={farmer.email}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Chưa có nông dân được gán" }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
