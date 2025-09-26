import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore, useNewsStore } from "@/stores";
import { RoutePaths } from "@/routes";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Row,
  Col,
  Spin,
  Space,
} from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const { TextArea } = Input;
const { Option } = Select;

const NewsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { 
    currentNews, 
    loading, 
    fetchNewsById, 
    createNews, 
    updateNews, 
    clearCurrentNews 
  } = useNewsStore();
  
  const [form] = Form.useForm();
  const [editorContent, setEditorContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  const isEdit = !!id;
  const isExpert = user?.role === "expert";

  useEffect(() => {
    if (!isExpert) {
      navigate(RoutePaths.NEWS_LIST);
      return;
    }

    if (isEdit) {
      loadNews();
    }

    return () => {
      clearCurrentNews();
    };
  }, [id, isExpert, navigate]);

  useEffect(() => {
    if (currentNews && isEdit) {
      form.setFieldsValue({
        title: currentNews.title,
        status: currentNews.status,
      });
      setEditorContent(currentNews.content || "");
      setRemoveExistingImage(false);
    }
  }, [currentNews, form, isEdit]);

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      await fetchNewsById(id);
    } catch (error) {
      message.error("Không thể tải thông tin tin tức");
      navigate(RoutePaths.NEWS_LIST);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!editorContent.trim()) {
      message.error("Vui lòng nhập nội dung tin tức");
      return;
    }

    setSubmitting(true);
    try {
      const newsData = {
        title: values.title,
        content: editorContent,
        status: values.status,
        image: imageFile,
        removeImage: isEdit ? removeExistingImage : false,
      };

      if (isEdit) {
        await updateNews(id, newsData);
        message.success("Cập nhật tin tức thành công");
      } else {
        await createNews(newsData);
        message.success("Tạo tin tức thành công");
      }

      navigate(RoutePaths.NEWS_LIST);
    } catch (error) {
      message.error(isEdit ? "Cập nhật tin tức thất bại" : "Tạo tin tức thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!form.getFieldValue("title") || !editorContent.trim()) {
      message.error("Vui lòng nhập đầy đủ thông tin để xem trước");
      return;
    }

    // Open preview in new tab
    const previewContent = `
      <html>
        <head>
          <title>Xem trước: ${form.getFieldValue("title")}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #23643A; padding-bottom: 10px; margin-bottom: 20px; }
            .title { color: #23643A; font-size: 24px; font-weight: bold; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${form.getFieldValue("title")}</h1>
          </div>
          <div class="content">${editorContent}</div>
        </body>
      </html>
    `;

    const newWindow = window.open();
    newWindow.document.write(previewContent);
  };

  const handleImageChange = (info) => {
    const { file } = info;
    
    // Since we're using beforeUpload={() => false}, the file won't be uploaded
    // We just store the file object for later use
    if (file) {
      setImageFile(file);
      setRemoveExistingImage(false);
      message.success("Ảnh đã được chọn");
    }
  };

  const handleManualFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveExistingImage(false);
      message.success("Ảnh đã được chọn");
      // reset input to allow re-choosing same file later
      e.target.value = "";
    }
  };

  if (loadingNews) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 32, minHeight: "100vh", background: "#f6f6f6" }}>
      <Card
        style={{
          marginBottom: 32,
          boxShadow: "0 2px 8px #0001",
          borderRadius: 13,
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(RoutePaths.NEWS_LIST)}
                style={{ marginRight: 16 }}
              >
                Quay lại
              </Button>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24, display: "inline" }}>
                {isEdit ? "Chỉnh sửa tin tức" : "Tạo tin tức mới"}
              </h2>
            </Col>
            
            <Col>
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  disabled={submitting}
                >
                  Xem trước
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "draft",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề" },
                  { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" },
                  { max: 200, message: "Tiêu đề không được vượt quá 200 ký tự" },
                ]}
              >
                <Input
                  placeholder="Nhập tiêu đề tin tức..."
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Nội dung"
                required
              >
                <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px" }}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorContent}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorContent(data);
                    }}
                    config={{
                      toolbar: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "outdent",
                        "indent",
                        "|",
                        "blockQuote",
                        "insertTable",
                        "undo",
                        "redo"
                      ],
                      language: "vi",
                    }}
                  />
                </div>
              </Form.Item>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select size="large">
                  <Option value="draft">Bản nháp</Option>
                  <Option value="published">Xuất bản</Option>
                  <Option value="archived">Lưu trữ</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Ảnh đại diện"
              >
                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  accept="image/*"
                >
                  {!imageFile && (!currentNews?.image || removeExistingImage) && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>
                {/* Hidden input kept in case needed later */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleManualFileChange} style={{ display: "none" }} />
                
                {imageFile && (
                  <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      style={{ width: "100%", maxWidth: 200, borderRadius: 6 }}
                    />
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        setImageFile(null);
                      }}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        background: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        padding: 0,
                        height: 24,
                        width: 24,
                      }}
                      icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                    />
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      Ảnh mới
                    </div>
                  </div>
                )}
                
                {currentNews?.image && !imageFile && !removeExistingImage && (
                  <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL || ''}${currentNews.image}`}
                      alt="Current"
                      style={{ width: "100%", maxWidth: 200, borderRadius: 6 }}
                    />
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        setRemoveExistingImage(true);
                      }}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        background: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        padding: 0,
                        height: 24,
                        width: 24,
                      }}
                      icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                    />
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      Ảnh hiện tại
                    </div>
                  </div>
                )}
                {removeExistingImage && !imageFile && (
                  <div style={{ marginTop: 8, color: "#ff4d4f", fontSize: 12 }}>
                    Ảnh hiện tại sẽ được gỡ bỏ khi lưu.
                  </div>
                )}
              </Form.Item>

              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={submitting}
                  style={{
                    backgroundColor: "#23643A",
                    borderColor: "#23643A",
                    width: "100%",
                  }}
                >
                  {isEdit ? "Cập nhật tin tức" : "Tạo tin tức"}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewsForm;
