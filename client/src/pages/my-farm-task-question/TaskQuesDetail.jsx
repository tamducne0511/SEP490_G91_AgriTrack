// Import API service để tạo thông báo câu hỏi
import { createNotificationQuesApi} from "@/services";
// Import các store để quản lý state (auth và task question)
import { useAuthStore, useTaskQuestionStore } from "@/stores";
// Import URL base cho hiển thị hình ảnh
import { ImageBaseUrl } from "@/variables/common";
// Import các icon từ Ant Design
import {
  ArrowLeftOutlined,  // Icon quay lại
  PlusOutlined,       // Icon thêm mới
  RobotOutlined,      // Icon AI
  SunOutlined,        // Icon thời tiết
  UploadOutlined,     // Icon upload
} from "@ant-design/icons";
// Import các component UI từ Ant Design
import {
  Alert,      // Component hiển thị thông báo
  Button,     // Component nút bấm
  Card,       // Component thẻ
  Form,       // Component form
  Input,      // Component input
  List,       // Component danh sách
  Modal,      // Component popup
  Pagination, // Component phân trang
  Spin,       // Component loading
  Tag,        // Component tag
  Typography, // Component typography
  Upload,     // Component upload file
  message,    // Component thông báo toast
} from "antd";
// Import React hooks
import { useEffect, useState, useCallback } from "react";
// Import React Router hooks để điều hướng và lấy params từ URL
import { useNavigate, useParams } from "react-router-dom";
// Import socket service để real-time communication
import { socket } from "@/services/socket";

// Destructure Title và Text từ Typography component
const { Title, Text } = Typography;

/**
 * Mapping màu sắc cho các role người dùng
 * farmer: màu xanh lá (nông dân)
 * expert: màu xanh dương (chuyên gia)
 */
const roleColor = {
  farmer: "green",
  expert: "geekblue",
};

/**
 * Component trang chi tiết câu hỏi về cây
 * Cho phép nông dân đặt câu hỏi và chuyên gia trả lời
 * Hỗ trợ AI gợi ý và xem thông tin thời tiết
 */
export default function TreeQuestionDetail() {
  // Lấy ID của cây từ URL params
  const { id: treeId } = useParams();
  // Hook để điều hướng trang
  const navigate = useNavigate();
  // Lấy thông tin user hiện tại từ auth store
  const { user } = useAuthStore();
  
  // Kiểm tra role của user để xác định quyền hạn
  const isExpert = user?.role === "expert";     // Là chuyên gia
  const isFarmer = user?.role === "farmer";     // Là nông dân
  const isReply = user?.role === "farmer" || user?.role === "expert"; // Có quyền trả lời

  // Lấy tất cả state và actions từ task question store
  const {
    treeQuestions,           // Danh sách câu hỏi của cây
    loadingTreeQuestions,    // Trạng thái loading khi fetch câu hỏi
    errorTreeQuestions,      // Lỗi khi fetch câu hỏi
    fetchQuestionsByTree,    // Action fetch câu hỏi theo cây
    treeQuestionsPagination, // Thông tin phân trang câu hỏi
    creating,                // Trạng thái đang tạo câu hỏi
    createQuestion,          // Action tạo câu hỏi mới
    askAI,                   // Action hỏi AI
    loadingAI,               // Trạng thái loading AI
    errorAI,                 // Lỗi từ AI
    clearAIAnswer,           // Action xóa câu trả lời AI
    weather,                 // Dữ liệu thời tiết
    fetchWeather,            // Action fetch thời tiết
    loadingWeather,          // Trạng thái loading thời tiết
    treeDetail,              // Chi tiết thông tin cây
    loadingTreeDetail,       // Trạng thái loading chi tiết cây
    errorTreeDetail,         // Lỗi khi fetch chi tiết cây
    fetchTreeDetail,         // Action fetch chi tiết cây
  } = useTaskQuestionStore();

  // ========== STATE MANAGEMENT ==========
  
  // State cho Modal đặt câu hỏi (chỉ Farmer mới được đặt câu hỏi)
  const [addModal, setAddModal] = useState(false);      // Mở/đóng modal thêm câu hỏi
  const [form] = Form.useForm();                        // Form instance để quản lý form
  const [fileList, setFileList] = useState([]);         // Danh sách file ảnh đã upload
  const [farmDetail, setFarmDetail] = useState(null);   // Chi tiết thông tin farm
  const [page, setPage] = useState(1);                  // Trang hiện tại cho pagination
  const [keyword, setKeyword] = useState("");           // Từ khóa tìm kiếm câu hỏi

  // State cho trả lời từng câu hỏi (dùng object để lưu theo questionId)
  const [replyForm, setReplyForm] = useState({});        // { [questionId]: text } - Nội dung trả lời
  const [aiSuggest, setAiSuggest] = useState({});        // { [questionId]: aiText } - Gợi ý từ AI
  const [weatherForQuestion, setWeatherForQuestion] = useState({}); // { [questionId]: weatherData } - Thời tiết theo câu hỏi
  const [answerModal, setAnswerModal] = useState({       // State quản lý modal AI
    open: false,        // Mở/đóng modal
    question: null,     // Câu hỏi đang được hỏi AI
    textPrompt: "",    // Prompt gửi cho AI
  });

  // ========== USE EFFECT HOOKS ==========
  
  /**
   * Effect cập nhật farmDetail khi treeDetail thay đổi
   * Chỉ cập nhật thông tin farm, không fetch thời tiết ở đây
   */
  const [value, setValue] = useState("");
  useEffect(() => {
    if (treeDetail?.farm) {
      setFarmDetail(treeDetail.farm);
      // Không cần gọi fetchWeather ở đây nữa vì sẽ gọi khi có câu hỏi cụ thể
    }
  }, [treeDetail]);

  /**
   * Effect fetch danh sách câu hỏi khi treeId, page, hoặc keyword thay đổi
   * Được gọi khi:
   * - Component mount lần đầu
   * - Chuyển trang
   * - Thay đổi từ khóa tìm kiếm
   */
  useEffect(() => {
    if (treeId) {
      fetchQuestionsByTree(treeId, page, keyword);
    }
  }, [treeId, page, keyword]);

  // ========== EVENT HANDLERS ==========
  
  /**
   * Handler thay đổi trang (dùng useCallback để tối ưu performance)
   * @param {number} newPage - Trang mới
   */
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  /**
   * Handler tìm kiếm câu hỏi
   * Reset về trang 1 khi thay đổi từ khóa tìm kiếm
   * @param {string} value - Từ khóa tìm kiếm
   */
  const handleSearch = useCallback((value) => {
    setKeyword(value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  }, []);

  /**
   * Effect lắng nghe real-time updates qua socket
   * Tự động refresh danh sách câu hỏi khi có câu hỏi mới hoặc câu trả lời mới
   */
  useEffect(() => {
    if (!treeId) return; // Không có treeId thì không lắng nghe
    
    // Handler khi có câu hỏi mới
    const handleNewQuestion = (data) => {
      if (data.treeId === treeId) fetchQuestionsByTree(treeId, page, keyword);
    };
    
    // Handler khi có câu trả lời mới
    const handleNewAnswer = (data) => {
      if (data.treeId === treeId) fetchQuestionsByTree(treeId, page, keyword);
    };
    
    // Đăng ký lắng nghe socket events
    socket.on("new-question", handleNewQuestion);
    socket.on("new-answer", handleNewAnswer);
    
    // Cleanup: Hủy đăng ký khi component unmount hoặc dependencies thay đổi
    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("new-answer", handleNewAnswer);
    };
  }, [treeId, page, keyword]);

  /**
   * Effect fetch chi tiết thông tin cây khi treeId thay đổi
   */
  useEffect(() => {
    if (treeId) fetchTreeDetail(treeId);
  }, [treeId]);
  // ========== HELPER FUNCTIONS ==========
  
  /**
   * Lọc câu hỏi chính (không phải reply)
   * Câu hỏi chính là những câu hỏi không có parentId
   */
  const mainQuestions = treeQuestions?.filter((q) => !q.parentId);

  /**
   * Lấy tất cả replies của một câu hỏi cụ thể
   * @param {string} questionId - ID của câu hỏi
   * @returns {Array} Danh sách replies
   */
  const getRepliesForQuestion = (questionId) => {
    return treeQuestions?.filter((q) => q.parentId === questionId) || [];
  };

  // ========== MAIN ACTION HANDLERS ==========
  
  /**
   * Handler đặt câu hỏi mới (chỉ Farmer mới được sử dụng)
   * Tạo câu hỏi với ảnh đính kèm và gửi thông báo cho chuyên gia
   */
  const handleAddQuestion = async () => {
    try {
      // Validate form fields trước khi submit
      const values = await form.validateFields();
      
      // Tạo FormData để gửi file ảnh
      const formData = new FormData();
      formData.append("title", values.title);      // Tiêu đề câu hỏi
      formData.append("content", values.content);  // Nội dung câu hỏi
      formData.append("treeId", treeId);           // ID của cây
      
      // Thêm ảnh nếu có upload
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      
      // Gọi API tạo câu hỏi
      const res = await createQuestion(formData);
      
      // Tạo thông báo cho chuyên gia
      await createNotificationQuesApi({
        questionId: res._id,
        title: `${user?.fullName} đã gửi một câu hỏi cho chuyên gia`,
        content: res?.content || "N/A",
      });
      
      // Hiển thị thông báo thành công và reset form
      message.success("Gửi câu hỏi thành công!");
      setAddModal(false);           // Đóng modal
      form.resetFields();           // Reset form fields
      setFileList([]);              // Xóa danh sách file
      fetchQuestionsByTree(treeId, page, keyword); // Refresh danh sách câu hỏi
    } catch (err) {
      message.error(err?.message || "Không thể gửi câu hỏi");
    }
  };

  /**
   * Handler gọi AI để lấy gợi ý (chỉ Expert sử dụng)
   * Gửi prompt và ảnh (nếu có) cho AI để nhận gợi ý trả lời
   * @param {Object} question - Câu hỏi cần hỏi AI
   */
  const handleAskAI = async (question) => {
    try {
      // Lấy text prompt hoặc dùng default prompt
      const textPrompt = answerModal.textPrompt?.trim() || "Đây là bệnh gì?";
      let payload = { textPrompt };

      // Thêm URL ảnh vào payload nếu câu hỏi có ảnh
      if (question.image) {
        payload.imageUrl = question.image.startsWith("http")
          ? question.image                    // Nếu là URL đầy đủ
          : ImageBaseUrl + question.image;    // Nếu là đường dẫn relative
      }

      // Gọi AI API với payload
      const res = await askAI(payload);
      
      // Cập nhật state với kết quả AI
      setAiSuggest((prev) => ({ ...prev, [question._id]: res.reply || res }));
      setReplyForm((prev) => ({ ...prev, [question._id]: res.reply || res }));
    } catch (err) {
      message.error(err?.message || "Không thể hỏi AI");
    }
  };

  /**
   * Handler gửi trả lời câu hỏi (Expert và Farmer có thể sử dụng)
   * Tạo reply với title khác nhau tùy theo có phải khuyến nghị toàn vườn hay không
   * @param {string} questionId - ID của câu hỏi cần trả lời
   */
  const handleReply = async (questionId) => {
    const replyContent = replyForm[questionId]?.trim();
    if (!replyContent) return; // Không có nội dung thì không gửi
    
    try {
      // Tạo FormData để gửi reply
      const formData = new FormData();
      
      // Đặt title khác nhau tùy theo checkbox "khuyến nghị toàn vườn"
      formData.append(
        "title",
        checkedMap[questionId] ? "Khuyến nghị" : "Trả lời"
      );
      formData.append("content", replyContent);     // Nội dung trả lời
      formData.append("treeId", treeId);            // ID cây
      formData.append("parentId", questionId);      // ID câu hỏi gốc
      
      // Gọi API tạo reply
      const res = await createQuestion(formData);
      
      // Tạo thông báo với nội dung khác nhau
      await createNotificationQuesApi({
        questionId: res._id,
        title: checkedMap[questionId]
          ? `${user?.fullName} đã trả lời một câu hỏi, nhưng chuyên gia khuyến nghị xử lý toàn vườn`
          : `${user?.fullName} đã trả lời một câu hỏi`,
        content: res?.content || "N/A",
      });
      
      // Reset form cho câu hỏi này
      setReplyForm((prev) => ({ ...prev, [questionId]: "" }));
      setAiSuggest((prev) => ({ ...prev, [questionId]: "" }));
      
      // Refresh danh sách câu hỏi
      fetchQuestionsByTree(treeId, page, keyword);
    } catch (err) {
      message.error(err?.message || "Không thể gửi trả lời");
    }
  };
  
  // State quản lý checkbox "khuyến nghị toàn vườn" cho từng câu hỏi
  const [checkedMap, setCheckedMap] = useState({});

  /**
   * Handler lấy thông tin thời tiết cho một câu hỏi cụ thể
   * Lưu dữ liệu thời tiết vào state để hiển thị cho câu hỏi đó
   * @param {string} questionId - ID của câu hỏi cần lấy thời tiết
   */
  const handleGetWeatherForQuestion = async (questionId) => {
    try {
      // Gọi API lấy thời tiết
      const weatherData = await fetchWeather(questionId);
      
      // Lưu dữ liệu thời tiết vào state theo questionId
      setWeatherForQuestion(prev => ({
        ...prev,
        [questionId]: weatherData
      }));
    } catch (err) {
      message.error("Không thể lấy thông tin thời tiết");
    }
  };

  // ========== JSX RENDER ==========
  
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
      {/* Header với nút quay lại và nút đặt câu hỏi */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {/* Nút quay lại trang trước */}
        <Button
          icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, fontWeight: 500 }}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        
        {/* Tiêu đề trang */}
        <Title level={4} style={{ margin: 0 }}>
          Trao đổi hỏi đáp về cây này
        </Title>
        
        {/* Spacer để đẩy nút đặt câu hỏi sang phải */}
        <div style={{ flex: 1 }} />
        
        {/* Nút đặt câu hỏi (chỉ hiển thị cho Farmer) */}
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
      {/* Phần hiển thị thông tin chi tiết cây */}
      <div style={{}}>
        {loadingTreeDetail ? (
          /* Hiển thị loading spinner khi đang fetch dữ liệu */
          <Spin />
        ) : errorTreeDetail ? (
          /* Hiển thị thông báo lỗi nếu có lỗi */
          <Alert type="error" message={errorTreeDetail} />
        ) : treeDetail ? (
          /* Hiển thị thông tin chi tiết cây nếu có dữ liệu */
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
            {/* Hiển thị ảnh cây nếu có */}
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
            
            {/* Thông tin chi tiết cây */}
            <div>
              {/* Số hiệu cây (dạng A1, B2, C3...) */}
              <div style={{ fontSize: 19, fontWeight: 700, color: "#23643A" }}>
                Cây số:{" "}
                {treeDetail.detail &&
                  `${String.fromCharCode(65 + (treeDetail.detail.row || 0))}${treeDetail.detail.col
                  }`}
              </div>
              
              {/* Tên vườn */}
              <div style={{ color: "#444", margin: "5px 0 0 0", fontSize: 15 }}>
                Vườn: <b>{treeDetail.garden?.name}</b>
              </div>
              
              {/* Vị trí hàng, cột */}
              <div style={{ color: "#777", fontSize: 13 }}>
                (Hàng: {treeDetail.detail?.row}, Cột: {treeDetail.detail?.col})
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      {/* Card chính chứa danh sách câu hỏi và replies */}
      <Card
        bordered={false}
        style={{ borderRadius: 14, minHeight: 300 }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header của card với thông tin tổng số câu hỏi */}
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
            {/* Tiêu đề hiển thị tổng số câu hỏi */}
            <h3 style={{ margin: 0, color: "#23643A", fontWeight: 600 }}>
              Danh sách câu hỏi ({treeQuestionsPagination?.total || 0} câu hỏi)
            </h3>
          </div>
        </div>
        {/* Hiển thị loading, error hoặc danh sách câu hỏi */}
        {loadingTreeQuestions ? (
          /* Hiển thị loading spinner khi đang fetch câu hỏi */
          <div style={{ padding: 40, textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : errorTreeQuestions ? (
          /* Hiển thị thông báo lỗi nếu có lỗi khi fetch câu hỏi */
          <Alert
            type="error"
            message={errorTreeQuestions}
            style={{ margin: 20 }}
          />
        ) : mainQuestions?.length > 0 ? (
          /* Hiển thị danh sách câu hỏi nếu có dữ liệu */
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
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
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
                    {/* Button xem thời tiết */}
                    <Button
                      size="small"
                      icon={<SunOutlined />}
                      onClick={() => handleGetWeatherForQuestion(q._id)}
                      loading={loadingWeather}
                      style={{ marginLeft: 8 }}
                    >
                      Xem thời tiết ngày mai
                    </Button>
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

                  {/* Hiển thị thời tiết cho câu hỏi này */}
                  {weatherForQuestion[q._id] && (
                    <Card
                      size="small"
                      title={`Dự báo thời tiết ngày mai (${weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.date})`}
                      style={{
                        marginTop: 8,
                        background: "#eafbf3",
                        border: "1px solid #d6e4ff"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.condition?.icon}
                          alt="weather"
                          style={{ width: 32, height: 32 }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: "#23643A" }}>
                            {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.condition?.text}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Nhiệt độ TB: {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.avgtemp_c}°C |
                            Cao nhất: {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.maxtemp_c}°C |
                            Thấp nhất: {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.mintemp_c}°C
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Độ ẩm TB: {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.avghumidity}% |
                            Mưa: {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.totalprecip_mm}mm |
                            Khả năng mưa: {weatherForQuestion[q._id]?.forecast?.forecastday?.[1]?.day?.daily_chance_of_rain}%
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
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
                                if (!weatherForQuestion[q._id]) {
                                  message.warning(
                                    "Vui lòng xem thời tiết trước khi hỏi AI về chăm sóc theo thời tiết."
                                  );
                                  return;
                                }
                                const weatherData = weatherForQuestion[q._id];
                                const forecastTomorrow = weatherData?.forecast?.forecastday?.[1];
                                const textPrompt =
                                  `Dự báo thời tiết ngày mai tại ${treeDetail?.farm.address || weatherData?.location?.name}: ` +
                                  `${forecastTomorrow?.day?.condition?.text}, nhiệt độ trung bình ${forecastTomorrow?.day?.avgtemp_c}°C (cao nhất ${forecastTomorrow?.day?.maxtemp_c}°C, thấp nhất ${forecastTomorrow?.day?.mintemp_c}°C), ` +
                                  `độ ẩm trung bình ${forecastTomorrow?.day?.avghumidity}%, lượng mưa dự kiến ${forecastTomorrow?.day?.totalprecip_mm}mm, khả năng mưa ${forecastTomorrow?.day?.daily_chance_of_rain}%. ` +
                                  `Với điều kiện thời tiết này, nên chăm sóc cây như thế nào?`;

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
                              disabled={!weatherForQuestion[q._id]}
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
          /* Hiển thị empty state khi chưa có câu hỏi nào */
          <div style={{ padding: 42, textAlign: "center", color: "#aaa" }}>
            <Text type="secondary">Chưa có câu hỏi nào cho cây này.</Text>
          </div>
        )}

        {/* Phân trang cho danh sách câu hỏi */}
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

      {/* Modal đặt câu hỏi mới (chỉ Farmer) */}
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
        {/* Form đặt câu hỏi với các trường bắt buộc */}
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          {/* Trường tiêu đề câu hỏi */}
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề câu hỏi" }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          
          {/* Trường nội dung câu hỏi */}
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
          >
            <Input.TextArea placeholder="Nhập nội dung" rows={4} />
          </Form.Item>
          
          {/* Trường upload ảnh minh họa (tùy chọn) */}
          <Form.Item name="image" label="Ảnh minh hoạ">
            <Upload
              beforeUpload={() => false}  // Không tự động upload
              maxCount={1}                // Chỉ cho phép 1 ảnh
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"            // Chỉ chấp nhận file ảnh
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Tải ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal gợi ý từ AI (chỉ Expert sử dụng) */}
      <Modal
        title="Gợi ý từ AI"
        open={answerModal.open}
        onCancel={() => {
          setAnswerModal({ open: false, question: null, textPrompt: "" });
          clearAIAnswer();
        }}
        footer={[
          /* Nút gọi AI để lấy gợi ý */
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
              } catch (err) { }
            }}
            loading={loadingAI}
            disabled={!answerModal.textPrompt?.trim()}
          >
            Lấy gợi ý từ AI
          </Button>,
          /* Nút đóng modal */
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
        {/* Phần nhập prompt cho AI */}
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
        
        {/* Phần hiển thị kết quả AI */}
        <div style={{ minHeight: 70 }}>
          {loadingAI ? (
            /* Hiển thị loading khi đang gọi AI */
            <Spin tip="Đang lấy gợi ý AI..." />
          ) : errorAI ? (
            /* Hiển thị lỗi nếu AI trả về lỗi */
            <Alert type="error" message={errorAI} />
          ) : aiSuggest[answerModal.question?._id] ? (
            /* Hiển thị kết quả AI với nút chèn vào ô trả lời */
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
            /* Hiển thị hướng dẫn khi chưa có kết quả AI */
            <Text type="secondary">Nhấn "Lấy gợi ý từ AI" để nhận gợi ý.</Text>
          )}
        </div>
      </Modal>

      {/* CSS responsive cho mobile */}
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
