// Import component EditorTinyMCE để tạo rich text editor
import EditorTinyMCE from "@/components/EditorTinyMCE";
// Import các route paths được định nghĩa trong hệ thống
import { RoutePaths } from "@/routes";
// Import store quản lý authentication (thông tin user đăng nhập)
import { useAuthStore } from "@/stores";
// Import store quản lý farm schedule (lịch trang trại)
import { useFarmScheduleStore } from "@/stores/farmScheduleStore";
// Import base URL cho hình ảnh
import { ImageBaseUrl } from "@/variables/common";
// Import các icon từ Ant Design
import {
  ArrowLeftOutlined, // Icon mũi tên trái (quay lại)
  CalendarOutlined, // Icon lịch
  EyeOutlined, // Icon mắt (xem chi tiết)
  FileImageOutlined, // Icon file ảnh
} from "@ant-design/icons";
// Import các component UI từ Ant Design
import {
  Avatar, // Component hiển thị avatar/ảnh đại diện
  Button, // Component nút bấm
  Card, // Component card container
  Col, // Component cột trong grid system
  DatePicker, // Component chọn ngày
  Form, // Component form
  Input, // Component input text
  List, // Component danh sách
  Modal, // Component modal popup
  Row, // Component hàng trong grid system
  Space, // Component tạo khoảng cách giữa các element
  Spin, // Component loading spinner
  Tag, // Component tag/label
  Tooltip, // Component tooltip khi hover
  Typography, // Component typography (Text, Title, etc.)
  Upload, // Component upload file
  message, // Component hiển thị thông báo
} from "antd";
// Import thư viện dayjs để xử lý ngày tháng
import dayjs from "dayjs";
// Import React hooks
import { useEffect, useState } from "react";
// Import React Router hooks để điều hướng và lấy params
import { useNavigate, useParams } from "react-router-dom";

// Destructure Typography components để sử dụng ngắn gọn
const { Text, Title } = Typography;

/**
 * FarmScheduleDetailPage - Trang chi tiết lịch trang trại
 * Hiển thị danh sách lịch của một trang trại cụ thể và cho phép tạo lịch mới
 */
export default function FarmScheduleDetailPage() {
  // Lấy farmId từ URL params (id của trang trại)
  const { id: farmId } = useParams();
  // Lấy thông tin user hiện tại từ auth store
  const { user } = useAuthStore();
  // Kiểm tra xem user có phải là farm-admin không (quyền hạn khác nhau)
  const isFarmAdmin = user?.role === "farm-admin";

  // Destructure các state và actions từ farm schedule store
  const {
    schedules, // Danh sách lịch của trang trại
    loading, // Trạng thái đang tải dữ liệu
    error, // Lỗi nếu có
    fetchSchedules, // Hàm lấy danh sách lịch
    createSchedule, // Hàm tạo lịch mới
    creating, // Trạng thái đang tạo lịch
  } = useFarmScheduleStore();
  // Hook để điều hướng trang
  const navigate = useNavigate();

  // State quản lý modal thêm lịch mới
  const [addModal, setAddModal] = useState(false);
  // Form instance để quản lý form data
  const [form] = Form.useForm();
  // State quản lý danh sách file upload (ảnh)
  const [fileList, setFileList] = useState([]);
  // State lưu nội dung HTML từ TinyMCE editor (mô tả lịch)
  const [desc, setDesc] = useState(""); // TinyMCE HTML string
  // State lưu nội dung HTML từ TinyMCE editor (mô tả cây)
  const [treeDesc, setTreeDesc] = useState(""); // TinyMCE HTML string
  // State theo dõi việc load TinyMCE editor (để tránh lỗi khi chưa load xong)
  const [isEditorLoaded, setIsEditorLoaded] = useState(false); // Track TinyMCE loading

  // Effect chạy khi component mount hoặc farmId thay đổi
  useEffect(() => {
    // Nếu có farmId thì gọi API lấy danh sách lịch của trang trại đó
    if (farmId) fetchSchedules(farmId);
  }, [farmId]);

  /**
   * Hàm xử lý tạo lịch mới
   * Validate form -> tạo FormData -> gọi API -> reset form -> refresh danh sách
   */
  const handleAdd = async () => {
    try {
      // Validate tất cả fields trong form, nếu lỗi sẽ throw exception
      const values = await form.validateFields();
      // Tạo FormData để gửi lên server (hỗ trợ file upload)
      const formData = new FormData();
      formData.append("farmId", farmId); // ID trang trại
      formData.append("title", values.title); // Tiêu đề lịch
      formData.append("description", desc); // Mô tả lịch (HTML từ TinyMCE)
      formData.append("treeDescription", treeDesc); // Mô tả cây (HTML từ TinyMCE)
      formData.append("startAt", values.dates[0].format("YYYY-MM-DD")); // Ngày bắt đầu
      formData.append("endAt", values.dates[1].format("YYYY-MM-DD")); // Ngày kết thúc
      formData.append("treeName", values.treeName); // Tên cây
      // Nếu có ảnh được chọn thì thêm vào FormData
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      // Gọi API tạo lịch mới
      await createSchedule(formData);
      // Hiển thị thông báo thành công
      message.success("Tạo lịch thành công!");
      // Đóng modal
      setAddModal(false);
      // Reset form về trạng thái ban đầu
      form.resetFields();
      // Reset các state khác
      setDesc("");
      setTreeDesc("");
      setFileList([]);
      // Refresh lại danh sách lịch để hiển thị lịch vừa tạo
      fetchSchedules(farmId);
    } catch (err) {
      // Hiển thị thông báo lỗi nếu có lỗi xảy ra
      message.error(err?.message || "Không thể tạo lịch");
    }
  };

  /**
   * Hàm callback khi TinyMCE editor đã load xong
   * Cần để tránh lỗi khi editor chưa sẵn sàng
   */
  const handleEditorLoad = () => {
    setIsEditorLoaded(true); // TinyMCE đã load xong
  };

  return (
    <div>
      {/* Nút quay lại trang trước */}
      <Button
        icon={<ArrowLeftOutlined />} // Icon mũi tên trái
        onClick={() => navigate(-1)} // Quay lại trang trước trong history
        style={{ marginBottom: 16, marginRight: 8 }} // Style cho nút
      >
        Quay lại
      </Button>

      {/* Card chính chứa danh sách lịch */}
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            📅 Danh sách lịch của trang trại {/* Tiêu đề card */}
          </Title>
        }
        extra={
          // Chỉ hiển thị nút "Thêm lịch mới" nếu user KHÔNG phải farm-admin
          !isFarmAdmin && (
            <Button
              onClick={() => setAddModal(true)} // Mở modal thêm lịch
              type="primary" // Kiểu nút primary (màu xanh)
              icon={<CalendarOutlined />} // Icon lịch
              style={{ borderRadius: 8, fontWeight: 600 }} // Style bo góc và font weight
            >
              Thêm lịch mới
            </Button>
          )
        }
        style={{
          margin: "auto", // Căn giữa card
          borderRadius: 20, // Bo góc 20px
          boxShadow: "0 4px 24px #5cdb9733", // Đổ bóng màu xanh nhạt
          marginBottom: 32, // Khoảng cách dưới 32px
        }}
      >
        {/* Hiển thị loading, error hoặc danh sách lịch */}
        {loading ? (
          // Hiển thị spinner khi đang tải dữ liệu
          <Spin style={{ margin: 40 }} />
        ) : error ? (
          // Hiển thị thông báo lỗi nếu có lỗi
          <div style={{ color: "red", padding: 28 }}>{error}</div>
        ) : (
          // Hiển thị danh sách lịch
          <List
            dataSource={schedules} // Dữ liệu danh sách lịch
            locale={{
              // Text hiển thị khi danh sách rỗng
              emptyText: (
                <Text type="secondary">
                  Chưa có lịch nào cho trang trại này.
                </Text>
              ),
            }}
            renderItem={(item) => (
              // Render từng item lịch trong danh sách
              <List.Item
                style={{
                  borderBottom: "1px solid #f3f3f3", // Viền dưới
                  padding: "22px 36px 12px 28px", // Padding cho item
                  // Nền xanh nhạt nếu lịch đang hoạt động, trắng nếu kết thúc
                  background: item.status ? "#f6ffed" : "#fff",
                  // Viền trái xanh nếu đang hoạt động, xám nếu kết thúc
                  borderLeft: item.status
                    ? "5px solid #52c41a"
                    : "5px solid #f0f0f0",
                }}
                actions={[
                  // Nút xem chi tiết lịch
                  <Tooltip title="Chi tiết lịch" key="view">
                    <Button
                      onClick={() =>
                        // Điều hướng đến trang chi tiết cây của lịch
                        navigate(RoutePaths.FARM_SCHEDULE_TREE_DETAIL(item._id))
                      }
                      icon={<EyeOutlined />} // Icon mắt
                      shape="circle" // Hình tròn
                    />
                  </Tooltip>,
                ]}
              >
                {/* Thông tin chi tiết của lịch */}
                <List.Item.Meta
                  avatar={
                    // Hiển thị ảnh lịch nếu có, nếu không thì hiển thị icon mặc định
                    item.image ? (
                      <Avatar
                        shape="square" // Hình vuông
                        size={64} // Kích thước 64px
                        src={
                          // Kiểm tra nếu ảnh là URL đầy đủ hay chỉ là path
                          item.image.startsWith("http")
                            ? item.image // URL đầy đủ
                            : ImageBaseUrl + item.image // Thêm base URL
                        }
                        style={{ borderRadius: 14, background: "#fafafa" }} // Bo góc và nền
                        icon={<FileImageOutlined />} // Icon mặc định khi load lỗi
                      />
                    ) : (
                      // Avatar mặc định khi không có ảnh
                      <Avatar
                        shape="square" // Hình vuông
                        size={64} // Kích thước 64px
                        style={{ background: "#eee", borderRadius: 14 }} // Nền xám và bo góc
                      >
                        <FileImageOutlined /> {/* Icon file ảnh */}
                      </Avatar>
                    )
                  }
                  title={
                    // Tiêu đề lịch và tag trạng thái
                    <Space direction="horizontal" align="center" size={8}>
                      <span style={{ fontWeight: 600, fontSize: 17 }}>
                        {item.title} {/* Tên lịch */}
                      </span>
                      {/* Tag hiển thị trạng thái lịch */}
                      {item.status ? (
                        <Tag color="green" style={{ fontWeight: 500 }}>
                          Hoạt động {/* Lịch đang hoạt động */}
                        </Tag>
                      ) : (
                        <Tag color="gray" style={{ fontWeight: 500 }}>
                          Kết thúc {/* Lịch đã kết thúc */}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    // Mô tả hiển thị khoảng thời gian của lịch
                    <>
                      <div style={{ color: "#888", fontSize: 13 }}>
                        <CalendarOutlined />{" "} {/* Icon lịch */}
                        <b>{dayjs(item.startAt).format("YYYY-MM-DD")}</b> ~{" "} {/* Ngày bắt đầu */}
                        <b>{dayjs(item.endAt).format("YYYY-MM-DD")}</b> {/* Ngày kết thúc */}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Modal tạo lịch mới */}
      <Modal
        title={
          <span style={{ fontWeight: 600, fontSize: 22 }}>Tạo lịch mới</span> // Tiêu đề modal
        }
        open={addModal} // Điều khiển hiển thị modal
        onCancel={() => setAddModal(false)} // Đóng modal khi bấm Cancel
        onOk={handleAdd} // Xử lý khi bấm OK (tạo lịch)
        okText="Tạo lịch" // Text nút OK
        confirmLoading={creating} // Hiển thị loading khi đang tạo
        destroyOnClose // Destroy component khi đóng modal
        maskClosable={false} // Không cho đóng khi click bên ngoài
        closable={!creating} // Không cho đóng khi đang tạo
        okButtonProps={{ disabled: isFarmAdmin }} // Disable nút OK nếu là farm-admin
        cancelButtonProps={{ disabled: isFarmAdmin }} // Disable nút Cancel nếu là farm-admin
        width="92vw" // Chiều rộng 92% viewport
        style={{ top: 16, maxWidth: "1040px", padding: 0 }} // Style modal
        bodyStyle={{ padding: 28 }} // Style body modal
      >
        {/* Form tạo lịch mới */}
        <Form form={form} layout="vertical">
          {/* Trường tiêu đề lịch */}
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề" }]} // Validation bắt buộc
          >
            <Input placeholder="Nhập tiêu đề lịch" disabled={isFarmAdmin} />
          </Form.Item>

          {/* Row chứa 2 editor TinyMCE */}
          <Row gutter={24}>
            {/* Editor Mô tả lịch - Cột trái */}
            <Col xs={24} md={12}>
              <Form.Item label="Mô tả lịch">
                <EditorTinyMCE
                  value={desc} // Giá trị hiện tại
                  onEditorLoad={handleEditorLoad} // Callback khi editor load xong
                  isEditorLoaded={isEditorLoaded} // Trạng thái load editor
                  onChange={setDesc} // Callback khi thay đổi nội dung
                  readOnly={isFarmAdmin} // Chỉ đọc nếu là farm-admin
                  placeholder="Nhập mô tả lịch..."
                />
              </Form.Item>
            </Col>
            {/* Editor Mô tả cây - Cột phải */}
            <Col xs={24} md={12}>
              <Form.Item
                name="treeDescription"
                label="Mô tả cây"
                rules={[{ required: true, message: "Nhập mô tả cây" }]} // Validation bắt buộc
              >
                <EditorTinyMCE
                  value={treeDesc} // Giá trị hiện tại
                  onChange={setTreeDesc} // Callback khi thay đổi nội dung
                  onEditorLoad={handleEditorLoad} // Callback khi editor load xong
                  isEditorLoaded={isEditorLoaded} // Trạng thái load editor
                  readOnly={isFarmAdmin} // Chỉ đọc nếu là farm-admin
                  placeholder="Nhập mô tả cây..."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Trường tên cây */}
          <Form.Item
            name="treeName"
            label="Tên cây"
            rules={[{ required: true, message: "Nhập tên cây" }]} // Validation bắt buộc
          >
            <Input disabled={isFarmAdmin} />
          </Form.Item>
          {/* Trường chọn khoảng thời gian */}
          <Form.Item
            name="dates"
            label="Khoảng thời gian"
            rules={[{ required: true, message: "Chọn thời gian" }]} // Validation bắt buộc
          >
            <DatePicker.RangePicker
              format="YYYY-MM-DD" // Format ngày tháng
              style={{ width: "100%" }} // Chiều rộng 100%
              disabled={isFarmAdmin} // Disable nếu là farm-admin
            />
          </Form.Item>
          {/* Trường upload ảnh */}
          <Form.Item label="Ảnh (bắt buộc)">
            <Upload
              beforeUpload={() => false} // Không upload tự động
              maxCount={1} // Chỉ cho phép 1 ảnh
              fileList={fileList} // Danh sách file hiện tại
              onChange={({ fileList }) => setFileList(fileList)} // Callback khi thay đổi file
              accept="image/*" // Chỉ chấp nhận file ảnh
              listType="picture" // Kiểu hiển thị danh sách
              disabled={isFarmAdmin} // Disable nếu là farm-admin
            >
              <Button disabled={isFarmAdmin}>Chọn ảnh</Button> {/* Nút chọn ảnh */}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
