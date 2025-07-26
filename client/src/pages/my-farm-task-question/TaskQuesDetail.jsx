import { createNotificationQuesApi } from "@/services";
import { useAuthStore, useTaskQuestionStore } from "@/stores";
import { ImageBaseUrl } from "@/variables/common";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  RobotOutlined,
  SunOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

const roleColor = {
  farmer: "green",
  expert: "geekblue",
};

export default function TreeQuestionDetail() {
  const { id: treeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isExpert = user?.role === "expert";
  const isFarmer = user?.role === "farmer";

  const {
    treeQuestions,
    loadingTreeQuestions,
    errorTreeQuestions,
    fetchQuestionsByTree,
    creating,
    createQuestion,
    askAI,
    loadingAI,
    errorAI,
    clearAIAnswer,
    weather,
    fetchWeather,
    treeDetail,
    loadingTreeDetail,
    errorTreeDetail,
    fetchTreeDetail,
  } = useTaskQuestionStore();

  // State cho Modal đặt câu hỏi (chỉ Farmer)
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // State cho trả lời từng câu hỏi
  const [replyForm, setReplyForm] = useState({}); // { [questionId]: text }
  const [aiSuggest, setAiSuggest] = useState({}); // { [questionId]: aiText }
  const [answerModal, setAnswerModal] = useState({
    open: false,
    question: null,
    textPrompt: "",
  });

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (treeId) {
      fetchQuestionsByTree(treeId);
    }
  }, [treeId]); // Giữ treeId trong dependency array

  useEffect(() => {
    if (treeId) fetchTreeDetail(treeId);
  }, [treeId]);
  // Hiển thị dạng chat: gom câu hỏi chính và reply
  const mainQuestions = treeQuestions?.filter((q) => !q.parentId);
  const repliesByQuestion = {};
  treeQuestions?.forEach((q) => {
    if (q.parentId) {
      repliesByQuestion[q.parentId] = repliesByQuestion[q.parentId] || [];
      repliesByQuestion[q.parentId].push(q);
    }
  });

  // Đặt câu hỏi (chỉ Farmer)
  const handleAddQuestion = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("treeId", treeId);
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      const res = await createQuestion(formData);
      await createNotificationQuesApi({
        questionId: res._id,
        title: `${user?.fullName} đã gửi một câu hỏi cho chuyên gia`,
        content: res?.content || "N/A",
      });
      message.success("Gửi câu hỏi thành công!");
      setAddModal(false);
      form.resetFields();
      setFileList([]);
      fetchQuestionsByTree(treeId);
    } catch (err) {
      message.error(err?.message || "Không thể gửi câu hỏi");
    }
  };

  // Gọi AI suggestion (expert)
  const handleAskAI = async (question) => {
    try {
      const textPrompt = answerModal.textPrompt?.trim() || "Đây là bệnh gì?";
      let payload = { textPrompt };

      // Nếu có ảnh thì thêm imageUrl, không thì thôi
      if (question.image) {
        payload.imageUrl = question.image.startsWith("http")
          ? question.image
          : ImageBaseUrl + question.image;
      }

      const res = await askAI(payload);
      setAiSuggest((prev) => ({ ...prev, [question._id]: res.reply || res }));
      setReplyForm((prev) => ({ ...prev, [question._id]: res.reply || res }));
    } catch (err) {
      message.error(err?.message || "Không thể hỏi AI");
    }
  };

  // Expert gửi trả lời
  const handleReply = async (questionId) => {
    const replyContent = replyForm[questionId]?.trim();
    if (!replyContent) return;
    try {
      const formData = new FormData();
      formData.append("title", "Trả lời");
      formData.append("content", replyContent);
      formData.append("treeId", treeId);
      formData.append("parentId", questionId);
      const res = await createQuestion(formData);
      await createNotificationQuesApi({
        questionId: res._id,
        title: `${user?.fullName} đã trả lời một câu hỏi`,
        content: res?.content || "N/A",
      });
      setReplyForm((prev) => ({ ...prev, [questionId]: "" }));
      setAiSuggest((prev) => ({ ...prev, [questionId]: "" }));
      fetchQuestionsByTree(treeId);
    } catch (err) {
      message.error(err?.message || "Không thể gửi trả lời");
    }
  };
  const forecastTomorrow = weather?.forecast?.forecastday?.[1];
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 16px #1b7a4022",
        padding: 32,
        minHeight: 450,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, fontWeight: 500 }}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          Trao đổi hỏi đáp về cây này
        </Title>
        <div style={{ flex: 1 }} />
        {isFarmer && (
          <Button
            icon={<PlusOutlined />}
            style={{
              background: "#23643A",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
            }}
            onClick={() => setAddModal(true)}
            disabled={!isFarmer} // Chỉ farmer mới đặt câu hỏi
          >
            Đặt câu hỏi
          </Button>
        )}
      </div>
      <div style={{}}>
        {loadingTreeDetail ? (
          <Spin />
        ) : errorTreeDetail ? (
          <Alert type="error" message={errorTreeDetail} />
        ) : treeDetail ? (
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              marginBottom: 16,
              background: "#eafbf3",
              boxShadow: "0 2px 8px #23643a13",
              padding: "18px 34px",
              maxWidth: 200,
              marginLeft: "auto",
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* Nếu có hình cây thì show Avatar/image */}
            {treeDetail.detail?.image && (
              <img
                src={ImageBaseUrl + treeDetail.detail.image}
                alt="tree"
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 14,
                  marginRight: 12,
                  objectFit: "cover",
                  background: "#fafafa",
                }}
              />
            )}
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#23643A" }}>
                Cây số:{" "}
                {treeDetail.detail &&
                  `${String.fromCharCode(65 + (treeDetail.detail.row || 0))}${
                    treeDetail.detail.col
                  }`}
              </div>
              <div style={{ color: "#444", margin: "5px 0 0 0", fontSize: 15 }}>
                Vườn: <b>{treeDetail.garden?.name}</b>
              </div>
              <div style={{ color: "#777", fontSize: 13 }}>
                (Hàng: {treeDetail.detail?.row}, Cột: {treeDetail.detail?.col})
              </div>
            </div>
          </Card>
        ) : null}

        {forecastTomorrow && (
          <Card
            title={`Dự báo thời tiết ngày mai (${forecastTomorrow?.date})`}
            bordered={false}
            style={{
              borderRadius: 16,
              marginBottom: 24,
              background: "#eafbf3",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <img
                src={
                  forecastTomorrow?.day?.condition?.icon
                    ? forecastTomorrow?.day.condition.icon.startsWith("http")
                      ? forecastTomorrow?.day.condition.icon
                      : "https:" + forecastTomorrow?.day.condition.icon
                    : ""
                }
                alt={forecastTomorrow?.day?.condition?.text}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  background: "#fff",
                  marginBottom: 8,
                }}
              />
              <div>
                <div
                  style={{ fontWeight: 600, fontSize: 18, color: "#23643A" }}
                >
                  {weather?.location?.name}, {weather?.location?.country}
                </div>
                <div
                  style={{ color: "#23643A", fontSize: 16, margin: "4px 0" }}
                >
                  {forecastTomorrow?.day?.condition?.text}
                </div>
                <div style={{ color: "#444" }}>
                  <b>Nhiệt độ TB:</b> {forecastTomorrow?.day?.avgtemp_c}°C
                  &nbsp;|&nbsp;
                  <b>Cao nhất:</b> {forecastTomorrow?.day?.maxtemp_c}°C
                  &nbsp;|&nbsp;
                  <b>Thấp nhất:</b> {forecastTomorrow?.day?.mintemp_c}°C <br />
                  <b>Độ ẩm TB:</b> {forecastTomorrow?.day?.avghumidity}%
                  &nbsp;|&nbsp;
                  <b>Mưa:</b> {forecastTomorrow?.day?.totalprecip_mm}mm <br />
                  <b>Gió tối đa:</b> {forecastTomorrow?.day?.maxwind_kph} km/h{" "}
                  <br />
                  <b>Khả năng mưa:</b>{" "}
                  {forecastTomorrow?.day?.daily_chance_of_rain}%
                </div>
                <div style={{ color: "#98a4a6", fontSize: 13, marginTop: 6 }}>
                  Mặt trời mọc: {forecastTomorrow?.astro?.sunrise} &nbsp;|&nbsp;
                  Lặn: {forecastTomorrow?.astro?.sunset}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: 14, minHeight: 300 }}
        bodyStyle={{ padding: 0 }}
      >
        {loadingTreeQuestions ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : errorTreeQuestions ? (
          <Alert
            type="error"
            message={errorTreeQuestions}
            style={{ margin: 20 }}
          />
        ) : mainQuestions?.length > 0 ? (
          <List
            dataSource={mainQuestions}
            rowKey="_id"
            renderItem={(q) => (
              <List.Item
                style={{
                  borderBottom: "1px solid #f4f4f4",
                  padding: "20px 32px 8px",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {q.title}
                  </Text>
                  <Tag
                    color={roleColor[q.createdBy?.role] || "gray"}
                    style={{ fontWeight: 600 }}
                  >
                    {q.createdBy?.role === "expert" ? "Chuyên gia" : "Nông dân"}
                  </Tag>
                </div>
                <div style={{ margin: "4px 0", color: "#4e4e4e" }}>
                  {q.content}
                </div>
                {q.image && (
                  <img
                    src={
                      q.image.startsWith("http")
                        ? q.image
                        : ImageBaseUrl + q.image
                    }
                    alt="question"
                    style={{ maxWidth: 220, borderRadius: 7, margin: "10px 0" }}
                  />
                )}
                <div style={{ color: "#999", fontSize: 13 }}>
                  Đặt bởi:{" "}
                  <b>
                    {q.createdBy?.fullName || q.createdBy?.email || "Ẩn danh"}
                  </b>
                  {" • "}
                  {new Date(q.createdAt).toLocaleString("vi-VN")}
                </div>
                {/* FORM trả lời (EXPERT) */}
                {isExpert && q?.createdBy?.role === "farmer" && (
                  <div
                    style={{
                      marginTop: 10,
                      background: "#f7fafd",
                      borderRadius: 7,
                      padding: 12,
                      width: "100%",
                    }}
                  >
                    <Input.TextArea
                      value={replyForm[q._id] ?? ""}
                      onChange={(e) =>
                        setReplyForm((prev) => ({
                          ...prev,
                          [q._id]: e.target.value,
                        }))
                      }
                      placeholder="Nhập câu trả lời hoặc dùng AI gợi ý"
                      autoSize={{ minRows: 1, maxRows: 20 }}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <Button
                        icon={<RobotOutlined />}
                        onClick={async () => {
                          setAnswerModal({
                            open: true,
                            question: q,
                            textPrompt: "Giải đáp cho tôi vấn đề này?",
                          });
                        }}
                        loading={loadingAI}
                        style={{ fontWeight: 500 }}
                      >
                        Gợi ý AI
                      </Button>

                      <Button
                        icon={<SunOutlined />}
                        onClick={async () => {
                          if (!forecastTomorrow) {
                            message.warning("Chưa có dữ liệu dự báo ngày mai.");
                            return;
                          }
                          const textPrompt =
                            `Dự báo thời tiết ngày mai tại ${weather?.location?.name}, ${weather?.location?.country}: ` +
                            `${forecastTomorrow?.day?.condition?.text}, nhiệt độ trung bình ${forecastTomorrow?.day?.avgtemp_c}°C (cao nhất ${forecastTomorrow?.day?.maxtemp_c}°C, thấp nhất ${forecastTomorrow?.day?.mintemp_c}°C), ` +
                            `độ ẩm trung bình ${forecastTomorrow?.day?.avghumidity}%, lượng mưa dự kiến ${forecastTomorrow?.day?.totalprecip_mm}mm, gió tối đa ${forecastTomorrow?.day?.maxwind_kph} km/h. ` +
                            `Với điều kiện này, nên chăm sóc cây như thế nào?`;

                          try {
                            setAnswerModal({
                              open: true,
                              question: q,
                              textPrompt,
                            });
                          } catch (err) {
                            message.error(err?.message || "Không thể hỏi AI");
                          }
                        }}
                        loading={loadingAI}
                        style={{ fontWeight: 500 }}
                      >
                        Gợi ý chăm sóc theo thời tiết
                      </Button>

                      <Button
                        type="primary"
                        onClick={() => handleReply(q._id)}
                        loading={creating}
                        disabled={!replyForm[q._id]?.trim()}
                        style={{ fontWeight: 600 }}
                      >
                        Gửi trả lời
                      </Button>
                    </div>
                  </div>
                )}
              </List.Item>
            )}
          />
        ) : (
          <div style={{ padding: 42, textAlign: "center", color: "#aaa" }}>
            <Text type="secondary">Chưa có câu hỏi nào cho cây này.</Text>
          </div>
        )}
      </Card>

      {/* Modal đặt câu hỏi */}
      <Modal
        title="Đặt câu hỏi mới cho cây"
        open={addModal}
        onCancel={() => setAddModal(false)}
        onOk={handleAddQuestion}
        okText="Gửi câu hỏi"
        cancelText="Hủy"
        confirmLoading={creating}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề câu hỏi" }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
          >
            <Input.TextArea placeholder="Nhập nội dung" rows={4} />
          </Form.Item>
          <Form.Item name="image" label="Ảnh minh hoạ">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Tải ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Gợi ý từ AI"
        open={answerModal.open}
        onCancel={() => {
          setAnswerModal({ open: false, question: null, textPrompt: "" });
          clearAIAnswer();
        }}
        footer={[
          <Button
            key="askai"
            type="primary"
            onClick={async () => {
              if (!answerModal.textPrompt?.trim()) {
                message.warning("Vui lòng nhập nội dung prompt.");
                return;
              }
              try {
                await handleAskAI({
                  ...answerModal.question,
                  textPrompt: answerModal.textPrompt,
                });
              } catch (err) {}
            }}
            loading={loadingAI}
            disabled={!answerModal.textPrompt?.trim()}
          >
            Lấy gợi ý từ AI
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setAnswerModal({ open: false, question: null, textPrompt: "" });
              clearAIAnswer();
            }}
          >
            Đóng
          </Button>,
        ]}
        destroyOnClose
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: "#23643A", fontWeight: 500 }}>
            Prompt gửi tới AI:
          </Text>
          <Input.TextArea
            value={answerModal.textPrompt}
            onChange={(e) =>
              setAnswerModal((prev) => ({
                ...prev,
                textPrompt: e.target.value,
              }))
            }
            autoSize={{ minRows: 3, maxRows: 7 }}
            placeholder="Nhập hoặc sửa prompt để AI trả lời..."
            style={{ marginTop: 8, fontSize: 15 }}
            disabled={loadingAI}
          />
        </div>
        <div style={{ minHeight: 70 }}>
          {loadingAI ? (
            <Spin tip="Đang lấy gợi ý AI..." />
          ) : errorAI ? (
            <Alert type="error" message={errorAI} />
          ) : aiSuggest[answerModal.question?._id] ? (
            <div
              style={{
                background: "#eef5fc",
                borderRadius: 8,
                padding: 14,
                color: "#23643a",
                fontWeight: 500,
                fontSize: 16,
                whiteSpace: "pre-line",
                marginTop: 10,
              }}
            >
              {aiSuggest[answerModal.question._id]}
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <Button
                  size="small"
                  type="link"
                  onClick={() => {
                    setReplyForm((prev) => ({
                      ...prev,
                      [answerModal.question._id]:
                        aiSuggest[answerModal.question._id],
                    }));
                    message.success("Đã chèn gợi ý vào ô trả lời!");
                    setAnswerModal({
                      open: false,
                      question: null,
                      textPrompt: "",
                    });
                    clearAIAnswer();
                  }}
                >
                  Chèn vào ô trả lời
                </Button>
              </div>
            </div>
          ) : (
            <Text type="secondary">Nhấn "Lấy gợi ý từ AI" để nhận gợi ý.</Text>
          )}
        </div>
      </Modal>

      <style>{`
        @media (max-width: 700px) {
          .ant-card { padding: 0 !important; }
          .ant-modal { width: 95vw !important; }
          div[style*="padding: 32px"] { padding: 8px !important; }
        }
      `}</style>
    </div>
  );
}
