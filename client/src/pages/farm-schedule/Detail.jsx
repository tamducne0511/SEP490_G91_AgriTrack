import EditorTinyMCE from "@/components/EditorTinyMCE";
import { RoutePaths } from "@/routes";
import { useAuthStore } from "@/stores";
import { useFarmScheduleStore } from "@/stores/farmScheduleStore";
import { ImageBaseUrl } from "@/variables/common";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Text, Title } = Typography;

export default function FarmScheduleDetailPage() {
  const { id: farmId } = useParams();
  const { user } = useAuthStore();
  const isFarmAdmin = user?.role === "farm-admin";

  const {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    creating,
  } = useFarmScheduleStore();
  const navigate = useNavigate();

  // Thêm mới
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [desc, setDesc] = useState(""); // TinyMCE HTML string
  const [treeDesc, setTreeDesc] = useState(""); // TinyMCE HTML string
  const [isEditorLoaded, setIsEditorLoaded] = useState(false); // Track TinyMCE loading

  useEffect(() => {
    if (farmId) fetchSchedules(farmId);
  }, [farmId]);

  // Thêm lịch mới
  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("farmId", farmId);
      formData.append("title", values.title);
      formData.append("description", desc);
      formData.append("treeDescription", treeDesc);
      formData.append("startAt", values.dates[0].format("YYYY-MM-DD"));
      formData.append("endAt", values.dates[1].format("YYYY-MM-DD"));
      formData.append("treeName", values.treeName);
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      await createSchedule(formData);
      message.success("Tạo lịch thành công!");
      setAddModal(false);
      form.resetFields();
      setDesc("");
      setTreeDesc("");
      setFileList([]);
      fetchSchedules(farmId);
    } catch (err) {
      message.error(err?.message || "Không thể tạo lịch");
    }
  };

  const handleEditorLoad = () => {
    setIsEditorLoaded(true); // TinyMCE đã load xong
  };

  return (
    <div>
      {/* Nút quay lại */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)} // Quay lại trang trước
        style={{ marginBottom: 16, marginRight: 8 }}
      >
        Quay lại
      </Button>

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            📅 Danh sách lịch của trang trại
          </Title>
        }
        extra={
          !isFarmAdmin && (
            <Button
              onClick={() => setAddModal(true)}
              type="primary"
              icon={<CalendarOutlined />}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Thêm lịch mới
            </Button>
          )
        }
        style={{
          margin: "auto",
          borderRadius: 20,
          boxShadow: "0 4px 24px #5cdb9733",
          marginBottom: 32,
        }}
      >
        {loading ? (
          <Spin style={{ margin: 40 }} />
        ) : error ? (
          <div style={{ color: "red", padding: 28 }}>{error}</div>
        ) : (
          <List
            dataSource={schedules}
            locale={{
              emptyText: (
                <Text type="secondary">
                  Chưa có lịch nào cho trang trại này.
                </Text>
              ),
            }}
            renderItem={(item) => (
              <List.Item
                style={{
                  borderBottom: "1px solid #f3f3f3",
                  padding: "22px 36px 12px 28px",
                  background: item.status ? "#f6ffed" : "#fff",
                  borderLeft: item.status
                    ? "5px solid #52c41a"
                    : "5px solid #f0f0f0",
                }}
                actions={[
                  <Tooltip title="Chi tiết lịch" key="view">
                    <Button
                      onClick={() =>
                        navigate(RoutePaths.FARM_SCHEDULE_TREE_DETAIL(item._id))
                      }
                      icon={<EyeOutlined />}
                      shape="circle"
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.image ? (
                      <Avatar
                        shape="square"
                        size={64}
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : ImageBaseUrl + item.image
                        }
                        style={{ borderRadius: 14, background: "#fafafa" }}
                        icon={<FileImageOutlined />}
                      />
                    ) : (
                      <Avatar
                        shape="square"
                        size={64}
                        style={{ background: "#eee", borderRadius: 14 }}
                      >
                        <FileImageOutlined />
                      </Avatar>
                    )
                  }
                  title={
                    <Space direction="horizontal" align="center" size={8}>
                      <span style={{ fontWeight: 600, fontSize: 17 }}>
                        {item.title}
                      </span>
                      {item.status ? (
                        <Tag color="green" style={{ fontWeight: 500 }}>
                          Hoạt động
                        </Tag>
                      ) : (
                        <Tag color="gray" style={{ fontWeight: 500 }}>
                          Kết thúc
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <>
                      <div style={{ color: "#888", fontSize: 13 }}>
                        <CalendarOutlined />{" "}
                        <b>{dayjs(item.startAt).format("YYYY-MM-DD")}</b> ~{" "}
                        <b>{dayjs(item.endAt).format("YYYY-MM-DD")}</b>
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Modal Thêm mới */}
      <Modal
        title={
          <span style={{ fontWeight: 600, fontSize: 22 }}>Tạo lịch mới</span>
        }
        open={addModal}
        onCancel={() => setAddModal(false)}
        onOk={handleAdd}
        okText="Tạo lịch"
        confirmLoading={creating}
        destroyOnClose
        maskClosable={false}
        closable={!creating}
        okButtonProps={{ disabled: isFarmAdmin }}
        cancelButtonProps={{ disabled: isFarmAdmin }}
        width="92vw"
        style={{ top: 16, maxWidth: "1040px", padding: 0 }}
        bodyStyle={{ padding: 28 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề lịch" disabled={isFarmAdmin} />
          </Form.Item>

          <Row gutter={24}>
            {/* Editor Mô tả lịch */}
            <Col xs={24} md={12}>
              <Form.Item label="Mô tả lịch">
                <EditorTinyMCE
                  value={desc}
                  onEditorLoad={handleEditorLoad}
                  isEditorLoaded={isEditorLoaded}
                  onChange={setDesc}
                  readOnly={isFarmAdmin}
                  placeholder="Nhập mô tả lịch..."
                />
              </Form.Item>
            </Col>
            {/* Editor Mô tả cây */}
            <Col xs={24} md={12}>
              <Form.Item
                name="treeDescription"
                label="Mô tả cây"
                rules={[{ required: true, message: "Nhập mô tả cây" }]}
              >
                <EditorTinyMCE
                  value={treeDesc}
                  onChange={setTreeDesc}
                  onEditorLoad={handleEditorLoad}
                  isEditorLoaded={isEditorLoaded}
                  readOnly={isFarmAdmin}
                  placeholder="Nhập mô tả cây..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="treeName"
            label="Tên cây"
            rules={[{ required: true, message: "Nhập tên cây" }]}
          >
            <Input disabled={isFarmAdmin} />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Khoảng thời gian"
            rules={[{ required: true, message: "Chọn thời gian" }]}
          >
            <DatePicker.RangePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              disabled={isFarmAdmin}
            />
          </Form.Item>
          <Form.Item label="Ảnh (bắt buộc)">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              listType="picture"
              disabled={isFarmAdmin}
            >
              <Button disabled={isFarmAdmin}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
