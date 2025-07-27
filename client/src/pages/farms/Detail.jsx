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

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { farmDetail, getFarmDetail, updateFarm, loading } = useFarmStore();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    getFarmDetail(id);
  }, [id, getFarmDetail]);

  useEffect(() => {
    if (farmDetail) {
      form.setFieldsValue(farmDetail?.farm || {});
      if (farmDetail.farm?.image) {
        setFileList([
          {
            uid: "-1",
            name: "farm.jpg",
            url: farmDetail.farm.image.startsWith("http")
              ? farmDetail.farm.image
              : ImageBaseUrl + farmDetail.farm.image,
            status: "done",
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [farmDetail, form]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "";

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      let imageData = null;
      if (fileList[0]?.originFileObj) imageData = fileList[0].originFileObj;
      else if (fileList[0]?.url) imageData = fileList[0].url;
      await updateFarm(id, { ...values, image: imageData });
      message.success("Cập nhật thành công!");
      getFarmDetail(id);
    } catch (err) {
      message.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !farmDetail)
    return <Spin style={{ margin: "80px auto", display: "block" }} />;

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
          Trang trại: {farm.name}
        </Title>
      </div>

      {/* 2 columns */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* Left: Farm Info/Edit */}
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
            <Form form={form} layout="vertical">
              <Form.Item label="Ảnh trang trại">
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
                      <div style={{ marginTop: 8, fontSize: 13 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Form.Item
                name="name"
                label="Tên trang trại"
                rules={[
                  { required: true, message: "Vui lòng nhập tên trang trại" },
                ]}
              >
                <Input placeholder="Nhập tên trang trại" size="large" />
              </Form.Item>
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
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input placeholder="Nhập địa chỉ trang trại" size="large" />
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
          </Card>
        </div>

        {/* Right: Owner, Farmers, Experts, Gardens */}
        <div style={{ flex: 1.5, minWidth: 360 }}>
          {/* Owner */}
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

          {/* Farmers */}
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

          {/* Experts */}
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

          {/* Gardens */}
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
