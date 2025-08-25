import { RoutePaths } from "@/routes";
import { useAuthStore, useFarmStore, useGardenStore, useTaskStore } from "@/stores";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  message,
  Select,
  Tag,
  Typography,
  Upload
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const typeColor = {
  collect: "geekblue",
  "task-care": "green",
};

const typeLabel = {
  collect: "Thu hoạch",
  "task-care": "Chăm sóc",
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

export default function TaskCreate() {
  const { fetchGardens, gardens, gardensByFarm } =
    useGardenStore();
  const { createTask } = useTaskStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(undefined);
  const [selectedGardenId, setSelectedGardenId] = useState(undefined);
  const [formValues, setFormValues] = useState({});
  const { getMe, user, farmIds } = useAuthStore();

  useEffect(() => {
    getMe();
  }, [getMe]);

  const isExpert = user?.role === "expert";

  useEffect(() => {
    fetchGardens({ pageSize: 1000 }); // Lấy tất cả gardens
  }, [fetchGardens]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const availableGardens = gardens.filter(garden => 
    // Chỉ hiển thị garden còn hoạt động 
    garden.status === true
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      if (user?.role === "expert") {
        formData.append("farmId", selectedFarmId);
      }
      formData.append("gardenId", selectedGardenId);
      formData.append("type", values.type);
      formData.append("priority", values.priority);
      formData.append("endDate", values.endDate ? values.endDate : null);
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      await createTask(formData);
      message.success("Tạo công việc thành công!");
      navigate(RoutePaths.TASK_LIST);
    } catch (err) {
      message.error("Tạo công việc thất bại!");
      console.error("Submission error:", err);
    }
  };


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
        <Title level={4} style={{ margin: 0 }}>
          Thêm công việc mới
        </Title>
      </div>

      <div style={{ display: "flex", gap: 36 }}>
        <div style={{ flex: 1, minWidth: 340 }}>
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
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
              <Form.Item
                name="name"
                label="Tên công việc"
                rules={[{ required: true, message: "Nhập tên công việc" }]}
              >
                <Input placeholder="Tên công việc" size="large" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Nhập mô tả" }]}
              >
                <Input placeholder="Mô tả" size="large" />
              </Form.Item>
              {isExpert && (
                <Form.Item
                  name="farmId"
                  label="Trang trại"
                  rules={[{ required: true, message: "Chọn trang trại" }]}
                >
                  <Select
                    placeholder="Chọn trang trại"
                    value={selectedFarmId}
                    options={farmIds?.map((f) => ({
                      value: f.farm._id,
                      label: f.farm.name,
                    }))}
                    onChange={setSelectedFarmId}
                    size="large"
                  />
                </Form.Item>
              )}
              <Form.Item
                name="gardenId"
                label="Vườn"
                rules={[{ required: true, message: "Chọn vườn" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn vườn"
                  value={selectedGardenId}
                  options={
                    user?.role === "expert"
                      ? gardensByFarm.map((g) => ({
                          value: g._id,
                          label: g.name,
                        }))
                      : gardens.map((g) => ({ value: g._id, label: g.name }))
                  }
                  onChange={setSelectedGardenId}
                  size="large"
                  disabled={isExpert && !selectedFarmId}
                />
              </Form.Item>
        
              <Form.Item
                name="type"
                label="Loại công việc"
                rules={[
                  { required: true, message: "Chọn loại công việc" },
                  {
                    validator: (_, value) =>
                      value === "collect" || value === "task-care"
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Type must be collect or task-care")
                          ),
                  },
                ]}
              >
                <Select
                  placeholder="Chọn loại"
                  options={[
                    { value: "collect", label: "Thu hoạch" },
                    { value: "task-care", label: "Chăm sóc" },
                  ]}
                  size="large"
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
                />
              </Form.Item>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
              <Form.Item label="Ảnh minh hoạ">
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
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                <Button
                  type="primary"
                  style={{
                    background: "#23643A",
                    borderRadius: 8,
                    fontWeight: 500,
                    minWidth: 120,
                  }}
                  onClick={handleSubmit}
                  // loading={false}
                >
                  Lưu công việc
                </Button>
                <Button
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                    minWidth: 120,
                  }}
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
              </div>
            </Form>
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 340 }}>
          <Card
            title="Xem trước công việc"
            bordered={false}
            style={{
              borderRadius: 13,
              boxShadow: "0 1px 8px #0001",
              marginBottom: 18,
            }}
          >
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="Tên công việc">
                {formValues.name || <Text type="secondary">Chưa nhập</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {formValues.description || (
                  <Text type="secondary">Chưa nhập</Text>
                )}
              </Descriptions.Item>
              {isExpert && (
                <Descriptions.Item label="Trang trại">
                  {selectedFarmId ? (
                    (() => {
                      const selectedFarm = farmIds.find((f) =>
                        f.farm
                          ? f.farm._id === selectedFarmId
                          : f._id === selectedFarmId
                      );
                      return selectedFarm
                        ? selectedFarm.farm
                          ? selectedFarm.farm.name
                          : selectedFarm.name
                        : "Không xác định";
                    })()
                  ) : (
                    <Text type="secondary">Chưa chọn</Text>
                  )}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Vườn">
                {selectedGardenId ? (
                  gardens.find((g) => g._id === selectedGardenId)?.name ||
                  "Không xác định"
                ) : (
                  <Text type="secondary">Chưa chọn</Text>
                )}
              </Descriptions.Item>
           
              <Descriptions.Item label="Loại công việc">
                {formValues.type ? (
                  <Tag color={typeColor[formValues.type]}>
                    {typeLabel[formValues.type]}
                  </Tag>
                ) : (
                  <Text type="secondary">Chưa chọn</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Độ ưu tiên">
                {formValues.priority ? (
                  <Tag color={priorityColor[formValues.priority]}>
                    {priorityLabel[formValues.priority]}
                  </Tag>
                ) : (
                  <Text type="secondary">Chưa chọn</Text>
                )}
              </Descriptions.Item>
              {fileList.length > 0 && (
                <Descriptions.Item label="Ảnh">
                  <img
                    src={
                      fileList[0].url ||
                      URL.createObjectURL(fileList[0].originFileObj)
                    }
                    alt="Task"
                    style={{ width: "100%", maxWidth: 200, borderRadius: 8 }}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  );
}