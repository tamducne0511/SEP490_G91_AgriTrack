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
  Pagination,
  Select,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "@/services/socket";

const { Title, Text } = Typography;

const roleColor = {
  farmer: "green",
  expert: "geekblue",
};

// Function để trích xuất tên thành phố từ địa chỉ
const extractCityFromAddress = (address) => {
  if (!address) return "HaNoi"; // fallback
  
  const addressLower = address.toLowerCase();
  
  // Mapping các tên thành phố phổ biến
  const cityMappings = {
    "hà nội": "HaNoi",
    "hanoi": "HaNoi", 
    "tp. hồ chí minh": "Ho_Chi_Minh",
    "tp hồ chí minh": "Ho_Chi_Minh",
    "ho chi minh": "Ho_Chi_Minh",
    "hồ chí minh": "Ho_Chi_Minh",
    "đà nẵng": "Da_Nang",
    "da nang": "Da_Nang",
    "danang": "Da_Nang",
    "hải phòng": "Hai_Phong",
    "hai phong": "Hai_Phong",
    "cần thơ": "Can_Tho",
    "can tho": "Can_Tho",
    "huế": "Hue",
    "hue": "Hue",
    "nha trang": "Nha_Trang",
    "vũng tàu": "Vung_Tau",
    "vung tau": "Vung_Tau",
    "biên hòa": "Bien_Hoa",
    "bien hoa": "Bien_Hoa",
    "quy nhơn": "Quy_Nhon",
    "quy nhon": "Quy_Nhon"
  };
  
  // Tìm kiếm tên thành phố trong địa chỉ
  for (const [cityName, cityCode] of Object.entries(cityMappings)) {
    if (addressLower.includes(cityName)) {
      return cityCode;
    }
  }
  
  // Nếu không tìm thấy, trả về Hà Nội làm mặc định
  return "HaNoi";
};

export default function TreeQuestionDetail() {
  const { id: treeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isExpert = user?.role === "expert";
  const isFarmer = user?.role === "farmer";
  const isReply = user?.role === "farmer" || user?.role === "expert";

  const {
    treeQuestions,
    loadingTreeQuestions,
    errorTreeQuestions,
    fetchQuestionsByTree,
    treeQuestionsPagination,
    creating,
    createQuestion,
    askAI,
    loadingAI,
    errorAI,
    clearAIAnswer,
    weather,
    fetchWeather,
    loadingWeather,
    errorWeather,
    treeDetail,
    loadingTreeDetail,
    errorTreeDetail,
    fetchTreeDetail,
  } = useTaskQuestionStore();

  // State cho Modal đặt câu hỏi (chỉ Farmer)
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // State cho phân trang
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  
  // State cho chọn vị trí thời tiết
  const [selectedLocation, setSelectedLocation] = useState("HaNoi");

  // State cho trả lời từng câu hỏi
  const [replyForm, setReplyForm] = useState({}); // { [questionId]: text }
  const [aiSuggest, setAiSuggest] = useState({}); // { [questionId]: aiText }
  const [answerModal, setAnswerModal] = useState({
    open: false,
    question: null,
    textPrompt: "",
  });

  // Tự động fetch weather khi có thông tin trang trại
  useEffect(() => {
    if (treeDetail?.farm?.address) {
      const cityCode = extractCityFromAddress(treeDetail.farm.address);
      fetchWeather(cityCode);
      // Cập nhật selectedLocation để UI hiển thị đúng
      setSelectedLocation(cityCode);
    }
  }, [treeDetail?.farm?.address]);

  useEffect(() => {
    if (treeId) {
      fetchQuestionsByTree(treeId, page, keyword);
    }
  }, [treeId, page, keyword]);

  // Handlers cho phân trang và tìm kiếm
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleSearch = useCallback((value) => {
    setKeyword(value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  }, []);

  // Lắng nghe realtime với socket
  useEffect(() => {
    if (!treeId) return;
    const handleNewQuestion = (data) => {
      if (data.treeId === treeId) fetchQuestionsByTree(treeId, page, keyword);
    };
    const handleNewAnswer = (data) => {
      if (data.treeId === treeId) fetchQuestionsByTree(treeId, page, keyword);
    };
    socket.on("new-question", handleNewQuestion);
    socket.on("new-answer", handleNewAnswer);
    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("new-answer", handleNewAnswer);
    };
  }, [treeId, page, keyword]);

  useEffect(() => {
    if (treeId) fetchTreeDetail(treeId);
  }, [treeId]);
  // Lọc câu hỏi chính (không có parentId)
  const mainQuestions = treeQuestions?.filter((q) => !q.parentId);

  // Lấy replies cho từng câu hỏi
  const getRepliesForQuestion = (questionId) => {
    return treeQuestions?.filter((q) => q.parentId === questionId) || [];
  };

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
      fetchQuestionsByTree(treeId, page, keyword);
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
      formData.append(
        "title",
        checkedMap[questionId] ? "Khuyến nghị" : "Trả lời"
      );
      formData.append("content", replyContent);
      formData.append("treeId", treeId);
      formData.append("parentId", questionId);
      const res = await createQuestion(formData);
      await createNotificationQuesApi({
        questionId: res._id,
        title: checkedMap[questionId]
          ? `${user?.fullName} đã trả lời một câu hỏi, nhưng chuyên gia khuyến nghị xử lý toàn vườn`
          : `${user?.fullName} đã trả lời một câu hỏi`,
        content: res?.content || "N/A",
      });
      setReplyForm((prev) => ({ ...prev, [questionId]: "" }));
      setAiSuggest((prev) => ({ ...prev, [questionId]: "" }));
      fetchQuestionsByTree(treeId, page, keyword);
    } catch (err) {
      message.error(err?.message || "Không thể gửi trả lời");
    }
  };

  const [checkedMap, setCheckedMap] = useState({});

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
            title={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Dự báo thời tiết ngày mai ({forecastTomorrow?.date})</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: "#666" }}>Vị trí:</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 12, color: "#999" }}>
                      {treeDetail?.farm?.address || "Đang tải..."}
                    </span>
                    <Select
                      value={selectedLocation}
                      onChange={(value) => {
                        setSelectedLocation(value);
                        fetchWeather(value);
                      }}
                      style={{ width: 200 }}
                      placeholder="Chọn vị trí"
                      options={[
                        { value: "HaNoi", label: "Hà Nội" },
                        { value: "HoChiMinh", label: "TP. Hồ Chí Minh" },
                        { value: "DaNang", label: "Đà Nẵng" },
                        { value: "HaiPhong", label: "Hải Phòng" },
                        { value: "CanTho", label: "Cần Thơ" },
                        { value: "Hue", label: "Huế" },
                        { value: "NhaTrang", label: "Nha Trang" },
                        { value: "VungTau", label: "Vũng Tàu" },
                        { value: "BienHoa", label: "Biên Hòa" },
                        { value: "QuyNhon", label: "Quy Nhơn" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            }
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
        {/* Header với tìm kiếm và thông tin */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3 style={{ margin: 0, color: "#23643A", fontWeight: 600 }}>
              Danh sách câu hỏi ({treeQuestionsPagination?.total || 0} câu hỏi)
            </h3>
          </div>
        </div>
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
            renderItem={(q) =>
              console.log(q) || (
                <List.Item
                  style={{
                    borderBottom: "1px solid #f4f4f4",
                    padding: "20px 32px 8px",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Text strong style={{ fontSize: 16 }}>
                      {q.title}
                    </Text>
                    <Tag
                      color={roleColor[q.createdBy?.role] || "gray"}
                      style={{ fontWeight: 600 }}
                    >
                      {q.createdBy?.role === "expert"
                        ? "Chuyên gia"
                        : "Nông dân"}
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
                      style={{
                        maxWidth: 220,
                        borderRadius: 7,
                        margin: "10px 0",
                      }}
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
                  {isReply && q?.createdBy?.role === "farmer" && (
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
                        placeholder={
                          isExpert
                            ? "Nhập câu trả lời hoặc dùng AI gợi ý"
                            : "Nhập câu trả lời của bạn"
                        }
                        autoSize={{ minRows: 1, maxRows: 20 }}
                        style={{ marginBottom: 8 }}
                      />
                      {isExpert && (
                        <div style={{ marginBottom: 8 }}>
                          <label>
                            <input
                              type="checkbox"
                              checked={checkedMap[q._id] || false}
                              onChange={() =>
                                setCheckedMap((prev) => ({
                                  ...prev,
                                  [q._id]: !prev[q._id], // toggle riêng cho question này
                                }))
                              }
                            />
                            Khuyến nghị xử lý toàn vườn
                          </label>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 10 }}>
                        {isExpert && (
                          <div>
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
                                  message.warning(
                                    "Chưa có dữ liệu dự báo ngày mai."
                                  );
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
                                  message.error(
                                    err?.message || "Không thể hỏi AI"
                                  );
                                }
                              }}
                              loading={loadingAI}
                              style={{ fontWeight: 500 }}
                            >
                              Gợi ý chăm sóc theo thời tiết
                            </Button>
                          </div>
                        )}

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

                  {/* Hiển thị replies */}
                  {getRepliesForQuestion(q._id).length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        marginLeft: 20,
                        borderLeft: "2px solid #e8f5e8",
                        paddingLeft: 16,
                      }}
                    >
                      {getRepliesForQuestion(q._id).map((reply) => (
                        <div
                          key={reply._id}
                          style={{
                            marginBottom: 12,
                            padding: "12px 16px",
                            background: "#f8fafb",
                            borderRadius: 8,
                            border: "1px solid #e8f5e8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <Tag
                              color={roleColor[reply.createdBy?.role] || "gray"}
                              style={{ fontWeight: 600, fontSize: 11 }}
                            >
                              {reply.createdBy?.role === "expert"
                                ? "Chuyên gia"
                                : "Nông dân"}
                            </Tag>
                            {reply.createdBy?.role === "expert" && (
                              <Tag color="green" style={{ fontSize: 11 }}>
                                Đã trả lời
                              </Tag>
                            )}
                            {reply.createdBy?.role === "expert" &&
                              reply.title === "Khuyến nghị" && (
                                <Tag color="orange" style={{ fontSize: 11 }}>
                                  Khuyến nghị toàn vườn
                                </Tag>
                              )}
                          </div>
                          <div style={{ color: "#4e4e4e", marginBottom: 8 }}>
                            {reply.content}
                          </div>
                          {reply.image && (
                            <img
                              src={
                                reply.image.startsWith("http")
                                  ? reply.image
                                  : ImageBaseUrl + reply.image
                              }
                              alt="reply"
                              style={{
                                maxWidth: 180,
                                borderRadius: 6,
                                marginBottom: 8,
                              }}
                            />
                          )}
                          <div style={{ color: "#999", fontSize: 12 }}>
                            Trả lời bởi:{" "}
                            <b>
                              {reply.createdBy?.fullName ||
                                reply.createdBy?.email ||
                                "Ẩn danh"}
                            </b>
                            {" • "}
                            {new Date(reply.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </List.Item>
              )
            }
          />
        ) : (
          <div style={{ padding: 42, textAlign: "center", color: "#aaa" }}>
            <Text type="secondary">Chưa có câu hỏi nào cho cây này.</Text>
          </div>
        )}

        {/* Phân trang */}
        {treeQuestionsPagination?.total > 0 && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              current={page}
              total={treeQuestionsPagination.total}
              pageSize={treeQuestionsPagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} câu hỏi`
              }
            />
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