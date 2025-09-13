import { useFarmStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import {
  ArrowLeftOutlined,
  TeamOutlined,
  UserOutlined,
  AppstoreOutlined,
  PlusOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  List,
  Spin,
  Upload,
  message,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

/**
 * Component FarmDetail - Hiển thị chi tiết thông tin trang trại
 * Bao gồm: thông tin trang trại, chủ trang trại, danh sách nông dân, chuyên gia và các vườn
 * Cho phép chỉnh sửa thông tin trang trại
 */
export default function FarmDetail() {
  // Lấy ID trang trại từ URL params
  const { id } = useParams();
  
  // Hook navigation để điều hướng
  const navigate = useNavigate();
  
  // Destructure các function và state từ farm store
  const { farmDetail, getFarmDetail, updateFarm, loading } = useFarmStore();
  
  // Form instance để quản lý form chỉnh sửa
  const [form] = Form.useForm();
  
  // State để quản lý trạng thái đang lưu
  const [saving, setSaving] = useState(false);
  
  // State để quản lý danh sách file upload ảnh
  const [fileList, setFileList] = useState([]);

  // Effect để lấy chi tiết trang trại khi component mount hoặc ID thay đổi
  useEffect(() => {
    getFarmDetail(id);
  }, [id, getFarmDetail]);

  // Effect để cập nhật form và fileList khi có dữ liệu farmDetail
  useEffect(() => {
    if (farmDetail) {
      // Set giá trị cho form từ dữ liệu trang trại
      form.setFieldsValue(farmDetail?.farm || {});
      
      // Nếu có ảnh, set fileList với ảnh hiện tại
      if (farmDetail.farm?.image) {
        setFileList([
          {
            uid: "-1",
            name: "farm.jpg",
            // Xử lý URL ảnh (kiểm tra xem có phải là URL đầy đủ hay chỉ là path)
            url: farmDetail.farm.image.startsWith("http")
              ? farmDetail.farm.image
              : ImageBaseUrl + farmDetail.farm.image,
            status: "done",
          },
        ]);
      } else {
        // Nếu không có ảnh, reset fileList
        setFileList([]);
      }
    }
  }, [farmDetail, form]);

  /**
   * Handler cho việc thay đổi file upload
   * @param {Object} param - Object chứa fileList mới
   * @param {Array} param.fileList - Danh sách file mới
   */
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  /**
   * Tạo initials từ tên (lấy chữ cái đầu của mỗi từ)
   * @param {string} name - Tên cần tạo initials
   * @returns {string} - Initials được tạo
   */
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "";

  /**
   * Handler cho việc lưu thay đổi thông tin trang trại
   * Bao gồm validate form, xử lý ảnh và gọi API update
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate form và lấy giá trị
      const values = await form.validateFields();
      
      // Xử lý dữ liệu ảnh
      let imageData = null;
      if (fileList[0]?.originFileObj) {
        // Nếu là file mới upload
        imageData = fileList[0].originFileObj;
      } else if (fileList[0]?.url) {
        // Nếu là ảnh hiện tại
        imageData = fileList[0].url;
      }
      
      // Gọi API update trang trại
      await updateFarm(id, { ...values, image: imageData });
      
      message.success("Cập nhật thành công!");
      
      // Reload lại dữ liệu trang trại
      getFarmDetail(id);
    } catch (err) {
      message.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Hiển thị loading spinner nếu đang tải dữ liệu hoặc chưa có dữ liệu
  if (loading || !farmDetail)
    return <Spin style={{ margin: "80px auto", display: "block" }} />;

  // Lấy thông tin trang trại từ farmDetail
  const farm = farmDetail.farm;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* Header với nút quay lại và tiêu đề trang */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
        }}
      >
        {/* Nút quay lại trang trước */}
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
        {/* Tiêu đề hiển thị tên trang trại */}
        <Title
          level={3}
          style={{ margin: 0, color: "#1a1a1a", fontWeight: 600 }}
        >
          Trang trại: {farm.name}
        </Title>
      </div>

      {/* Layout 2 cột chính */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* Cột trái: Form chỉnh sửa thông tin trang trại */}
        <div style={{ flex: 1, minWidth: 360 }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
            }}
            bodyStyle={{ padding: 24 }}
            hoverable
          >
            <Title
              level={5}
              style={{ marginBottom: 16, color: "#1a1a1a", fontWeight: 600 }}
            >
              Thông tin & chỉnh sửa
            </Title>
            {/* Form chỉnh sửa thông tin trang trại */}
            <Form form={form} layout="vertical">
              {/* Upload ảnh trang trại */}
              <Form.Item label="Ảnh trang trại">
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false} // Ngăn không cho upload tự động
                  maxCount={1} // Chỉ cho phép upload 1 ảnh
                  fileList={fileList}
                  onChange={handleChange}
                  accept="image/*" // Chỉ chấp nhận file ảnh
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8, fontSize: 13 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              
              {/* Input tên trang trại */}
              <Form.Item
                name="name"
                label="Tên trang trại"
                rules={[
                  { required: true, message: "Vui lòng nhập tên trang trại" },
                ]}
              >
                <Input placeholder="Nhập tên trang trại" size="large" />
              </Form.Item>
              
              {/* Textarea mô tả trang trại */}
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea
                  placeholder="Nhập mô tả trang trại"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              
              {/* Input địa chỉ trang trại */}
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input placeholder="Nhập địa chỉ trang trại" size="large" />
              </Form.Item>
              {/* Các nút hành động */}
              <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                {/* Nút lưu thay đổi */}
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
                  loading={saving} // Hiển thị loading khi đang lưu
                >
                  Lưu thay đổi
                </Button>
                {/* Nút hủy - reset form về trạng thái ban đầu */}
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
          </Card>
        </div>

        {/* Cột phải: Thông tin chủ trang trại, nông dân, chuyên gia và các vườn */}
        <div style={{ flex: 1.5, minWidth: 360 }}>
          {/* Card thông tin chủ trang trại */}
          <Card
            title={
              <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 16 }}>
                <UserOutlined style={{ marginRight: 8 }} /> Chủ trang trại
              </span>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
            }}
            bodyStyle={{ padding: 20 }}
            hoverable
          >
            {/* Hiển thị thông tin chủ trang trại */}
            <Descriptions
              size="middle"
              column={1}
              labelStyle={{ fontWeight: 600, width: 100, color: "#595959" }}
              contentStyle={{ fontWeight: 500, color: "#1a1a1a" }}
            >
              <Descriptions.Item label="Tên">
                {farmDetail.owner?.fullName || (
                  <Text type="secondary">Chưa có</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {farmDetail.owner?.email || (
                  <Text type="secondary">Chưa có</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Card danh sách nông dân */}
          <Card
            title={
              <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 16 }}>
                <TeamOutlined style={{ marginRight: 8 }} /> Danh sách nông dân
              </span>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
            }}
            bodyStyle={{ padding: 20 }}
            hoverable
          >
            {/* List hiển thị danh sách nông dân */}
            <List
              dataSource={farmDetail.farmers || []}
              renderItem={(farmer) => (
                <List.Item style={{ padding: "12px 0" }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ background: "#a6d6b9", fontSize: 16 }}
                        icon={<UserOutlined />}
                      >
                        {getInitials(farmer.fullName)}
                      </Avatar>
                    }
                    title={
                      <span style={{ fontWeight: 500, color: "#1a1a1a" }}>
                        {farmer.fullName}
                      </span>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {farmer.email}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Chưa có nông dân nào" }}
            />
          </Card>

          {/* Card danh sách chuyên gia */}
          <Card
            title={
              <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 16 }}>
                <SolutionOutlined style={{ marginRight: 8 }} /> Danh sách chuyên
                gia
              </span>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
            }}
            bodyStyle={{ padding: 20 }}
            hoverable
          >
            {/* List hiển thị danh sách chuyên gia */}
            <List
              dataSource={farmDetail.experts || []}
              renderItem={(expert) => (
                <List.Item style={{ padding: "12px 0" }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ background: "#b7d7e8", fontSize: 16 }}
                        icon={<SolutionOutlined />}
                      >
                        {getInitials(expert.fullName)}
                      </Avatar>
                    }
                    title={
                      <span style={{ fontWeight: 500, color: "#1a1a1a" }}>
                        {expert.fullName}
                      </span>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {expert.email}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Chưa có chuyên gia nào" }}
            />
          </Card>

          {/* Card danh sách các vườn trực thuộc */}
          <Card
            title={
              <span style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 16 }}>
                <AppstoreOutlined style={{ marginRight: 8 }} /> Các vườn trực
                thuộc
              </span>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
            }}
            bodyStyle={{ padding: 20 }}
            hoverable
          >
            {/* List hiển thị danh sách các vườn */}
            <List
              dataSource={farmDetail.gardens || []}
              renderItem={(garden) => (
                <List.Item style={{ padding: "12px 0" }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        shape="square"
                        size={48}
                        src={
                          garden.image &&
                          (garden.image.startsWith("http")
                            ? garden.image
                            : ImageBaseUrl + garden.image)
                        }
                        style={{
                          background: "#e6f4ea",
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      >
                        {garden.name?.charAt(0)}
                      </Avatar>
                    }
                    title={
                      <span style={{ fontWeight: 500, color: "#1a1a1a" }}>
                        {garden.name}
                      </span>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {garden.description}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Chưa có vườn nào" }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}