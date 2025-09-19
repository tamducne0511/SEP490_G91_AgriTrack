import { useParams, useNavigate } from "react-router-dom";
import { useFarmScheduleStore } from "@/stores/farmScheduleStore";
import { useAuthStore } from "@/stores";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Modal,
  message,
  Spin,
  Upload,
  Row,
  Col,
  Image,
  Card,
  Typography,
  Drawer,
  List,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import EditorTinyMCE from "@/components/EditorTinyMCE";
import dayjs from "dayjs";
import { ImageBaseUrl } from "@/variables/common";
import "./style.css";

const { Title } = Typography;

export default function FarmScheduleTreeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isFarmAdmin = user?.role === "farm-admin";

  const {
    scheduleDetail,
    loading,
    error,
    fetchScheduleDetail,
    updateSchedule,
    deleteSchedule,
    generateTasksByAI,
  } = useFarmScheduleStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [desc, setDesc] = useState(""); // TinyMCE HTML string
  const [treeDesc, setTreeDesc] = useState(""); // TinyMCE HTML string
  const [fileList, setFileList] = useState([]);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState([]);

  // Fetch schedule detail khi trang được load
  useEffect(() => {
    if (id) fetchScheduleDetail(id);
  }, [id, fetchScheduleDetail]);

  // Khi có dữ liệu chi tiết lịch, điền vào form
  useEffect(() => {
    if (scheduleDetail) {
      form.setFieldsValue({
        title: scheduleDetail.title,
        treeName: scheduleDetail.treeName,
        dates: [dayjs(scheduleDetail.startAt), dayjs(scheduleDetail.endAt)],
      });
      setDesc(scheduleDetail.description);
      setTreeDesc(scheduleDetail.treeDescription);

      setFileList(
        scheduleDetail.image
          ? [
              {
                uid: "-1",
                name: "schedule_image.jpg",
                status: "done",
                url: scheduleDetail.image.startsWith("http")
                  ? scheduleDetail.image
                  : ImageBaseUrl + scheduleDetail.image,
              },
            ]
          : []
      );
    }
  }, [scheduleDetail]);

  // Xóa lịch
  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa lịch",
      content: "Bạn có chắc chắn muốn xóa lịch này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteSchedule(id);
          message.success("Xóa lịch thành công!");
          navigate("/farm-schedule"); // Quay lại trang danh sách
        } catch (err) {
          message.error("Xóa lịch không thành công");
        }
      },
    });
  };

  // Lưu thông tin đã sửa
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("treeName", values.treeName);
      formData.append("startAt", values.dates[0].format("YYYY-MM-DD"));
      formData.append("endAt", values.dates[1].format("YYYY-MM-DD"));
      formData.append("description", desc);
      formData.append("treeDescription", treeDesc);

      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      await updateSchedule(id, formData);
      message.success("Cập nhật lịch thành công!");
      setIsEditMode(false);
    } catch (err) {
      message.error("Có lỗi xảy ra khi cập nhật lịch");
    }
  };

  const handleEditorLoad = () => setIsEditorLoaded(true);

  // Xử lý khi xóa ảnh
  const handleRemoveImage = () => setFileList([]);

  // Xử lý khi chọn ảnh mới
  const handleFileChange = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  // ----- READ ONLY VIEW (Farm Admin) -----
  if (isFarmAdmin) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16, marginRight: 8 }}
        >
          Quay lại
        </Button>
        {loading ? (
          <Spin style={{ margin: 40 }} />
        ) : error ? (
          <div style={{ color: "red", padding: 28 }}>{error}</div>
        ) : (
          <Card
            style={{
              borderRadius: 20,
              boxShadow: "0 4px 24px #5cdb9733",
              marginBottom: 32,
              marginTop: 20,
            }}
          >
            <Title level={4} style={{ marginBottom: 16 }}>
              {scheduleDetail?.title || "Lịch trang trại"}
            </Title>
            <div style={{ fontSize: 16, marginBottom: 12 }}>
              <b>Tên cây: </b>
              {scheduleDetail?.treeName}
            </div>
            <div style={{ fontSize: 15, color: "#888", marginBottom: 12 }}>
              <b>Thời gian: </b>
              {dayjs(scheduleDetail?.startAt).format("HH:mm YYYY-MM-DD")} ~
              {dayjs(scheduleDetail?.endAt).format("HH:mm YYYY-MM-DD")}
            </div>
            {fileList.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <Image
                  src={fileList[0].url}
                  alt="Ảnh"
                  style={{
                    borderRadius: 12,
                    border: "1px solid #eee",
                    maxHeight: 320,
                    maxWidth: "100%",
                    objectFit: "cover",
                  }}
                  preview
                />
              </div>
            )}
            <div style={{ margin: "12px 0" }}>
              <Title level={5}>Mô tả lịch</Title>
              <div
                className="editor-content"
                style={{
                  background: "#f7f7fa",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 18,
                  minHeight: 80,
                  marginBottom: 18,
                }}
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
            <div>
              <Title level={5}>Mô tả cây</Title>
              <div
                className="editor-content"
                style={{
                  background: "#f7f7fa",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 18,
                  minHeight: 80,
                }}
                dangerouslySetInnerHTML={{ __html: treeDesc }}
              />
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ----- EDIT/VIEW (Non-admin) -----
  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, marginRight: 8 }}
      >
        Quay lại
      </Button>
      {loading ? (
        <Spin style={{ margin: 40 }} />
      ) : error ? (
        <div style={{ color: "red", padding: 28 }}>{error}</div>
      ) : (
        <>
          <Button icon={<DeleteOutlined />} onClick={handleDelete} danger>
            Xóa lịch
          </Button>
          {isEditMode ? (
            <Button
              icon={<ReadOutlined />}
              onClick={() => setIsEditMode(false)}
              style={{ marginLeft: 16 }}
            >
              Chế độ xem
            </Button>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditMode(true)}
              style={{ marginLeft: 16 }}
            >
              Chỉnh sửa
            </Button>
            
            
          )}

          {/* Tạo việc bằng AI */}
          {!isEditMode && (
            <Button
              type="primary"
              style={{ marginLeft: 16, background: "#23643A" }}
              onClick={() => {
                Modal.confirm({
                  title: "Tạo công việc bằng AI?",
                  content:
                    "AI sẽ phân tích mô tả lịch và tạo các công việc liên tiếp trong khoảng thời gian.",
                  okText: "Tạo ngay",
                  cancelText: "Hủy",
                  onOk: async () => {
                    try {
                      setGenLoading(true);
                      const tasks = await generateTasksByAI(id);
                      setGenResult(tasks || []);
                      setGenOpen(true);
                      message.success("Đã tạo công việc bằng AI!");
                    } catch (err) {
                      message.error(err?.message || "Không thể tạo công việc bằng AI");
                    } finally {
                      setGenLoading(false);
                    }
                  },
                });
              }}
            >
              Tạo việc bằng AI
            </Button>
          )}

          {genLoading && <Spin style={{ marginLeft: 12 }} />}

          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 24, maxWidth: 750 }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[{ required: true }]}
                >
                  <Input disabled={!isEditMode} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="treeName"
                  label="Tên cây"
                  rules={[{ required: true }]}
                >
                  <Input disabled={!isEditMode} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="dates"
              label="Khoảng thời gian"
              rules={[{ required: true }]}
            >
              <DatePicker.RangePicker
                format="YYYY-MM-DD"
                disabled={!isEditMode}
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* Mô tả lịch - luôn là 1 hàng riêng */}
            {isEditMode ? (
              <Form.Item label="Mô tả lịch">
                <EditorTinyMCE
                  value={desc}
                  onChange={setDesc}
                  readOnly={!isEditMode}
                  placeholder="Nhập mô tả lịch..."
                  onEditorLoad={handleEditorLoad}
                />
              </Form.Item>
            ) : (
              <Form.Item label="Mô tả lịch">
                <div
                  className="editor-content"
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: 14,
                    minHeight: 80,
                    borderRadius: 8,
                  }}
                  dangerouslySetInnerHTML={{ __html: desc }}
                />
              </Form.Item>
            )}

            {/* Mô tả cây - luôn là 1 hàng riêng */}
            {isEditMode ? (
              <Form.Item label="Mô tả cây">
                <EditorTinyMCE
                  value={treeDesc}
                  onChange={setTreeDesc}
                  readOnly={!isEditMode}
                  placeholder="Nhập mô tả cây..."
                  onEditorLoad={handleEditorLoad}
                />
              </Form.Item>
            ) : (
              <Form.Item label="Mô tả cây">
                <div
                  className="editor-content"
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: 14,
                    minHeight: 80,
                    borderRadius: 8,
                  }}
                  dangerouslySetInnerHTML={{ __html: treeDesc }}
                />
              </Form.Item>
            )}

            {/* Ảnh */}
            <Form.Item label="Ảnh (không bắt buộc)">
              {fileList.length > 0 ? (
                <div
                  style={{
                    maxWidth: "500px",
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={
                      fileList[0].url ||
                      (fileList[0].originFileObj &&
                        URL.createObjectURL(fileList[0].originFileObj))
                    }
                    alt="Image"
                    width="100%"
                    height="auto"
                    style={{
                      borderRadius: 8,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      marginBottom: 8,
                    }}
                  />
                  {isEditMode && (
                    <Button onClick={handleRemoveImage} danger>
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              ) : (
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  fileList={fileList}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={!isEditMode}
                  listType="picture-card"
                >
                  <Button disabled={!isEditMode}>Chọn ảnh</Button>
                </Upload>
              )}
            </Form.Item>

            {isEditMode && (
              <Form.Item>
                <Button type="primary" onClick={handleSave}>
                  Lưu
                </Button>
              </Form.Item>
            )}
          </Form>
          {/* Kết quả tạo công việc bằng AI */}
          <Drawer
            title="Kết quả tạo công việc AI"
            open={genOpen}
            onClose={() => setGenOpen(false)}
            width={560}
          >
            <List
              dataSource={genResult}
              rowKey="_id"
              renderItem={(t) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: "#666", margin: "4px 0" }}>{t.description}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      Ưu tiên: <b>{t.priority}</b> &nbsp;|&nbsp;
                      {t.startDate && `Từ: ${new Date(t.startDate).toLocaleDateString("vi-VN")}`} &nbsp;→&nbsp;
                      {t.endDate && `Đến: ${new Date(t.endDate).toLocaleDateString("vi-VN")}`}
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <div style={{ textAlign: "right", marginTop: 12 }}>
              <Button onClick={() => setGenOpen(false)}>Đóng</Button>
            </div>
          </Drawer>
        </>
      )}
    </div>
  );
}
