import { useTaskStore } from "@/stores/taskStore";
import { ImageBaseUrl } from "@/variables/common";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  message,
  Radio,
  Spin,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import TabPane from "antd/es/tabs/TabPane";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EquipmentList from "./EquipmentList"; // Import the new EquipmentList component

const { Title, Text } = Typography;

const typeLabel = { collect: "Thu hoạch", "task-care": "Chăm sóc" };
const typeColor = { collect: "geekblue", "task-care": "green" };

// MAP PRIORITY
const priorityLabel = { low: "Thấp", medium: "Trung bình", high: "Cao" };
const priorityColor = { high: "red", medium: "gold", low: "green" };

// MAP STATUS
const statusLabel = {
  "un-assign": "Chưa giao",
  assigned: "Đã giao",
  "in-progress": "Đang thực hiện",
  canceled: "Đã huỷ",
  completed: "Hoàn thành",
  false: "Đã bị xoá",
};
const statusColor = {
  "un-assign": "default",
  assigned: "blue",
  "in-progress": "orange",
  canceled: "red",
  completed: "green",
  false: "grey",
};

export default function FarmerTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchAssignedTaskDetail,
    myTask,
    loading,
    createDailyNote,
    createQuestion,
    equipmentList,
    fetchFarmEquipment,
    changeTaskStatus,
    fetchDailyNoteDetail,
  } = useTaskStore();

  const [form] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [harvestYield, setHarvestYield] = useState(undefined);
  const [noteType, setNoteType] = useState("harvest");

  const [notesDetail, setNotesDetail] = useState([]);

  useEffect(() => {
    const fetchAllNotes = async () => {
      if (!myTask?.notes) return;
      try {
        const arr = await Promise.all(
          myTask?.notes.map(async (note) => {
            try {
              const detail = await fetchDailyNoteDetail(note._id);
              return detail; // hoặc detail.data tùy API trả về
            } catch {
              return null;
            }
          })
        );
        setNotesDetail(arr.filter(Boolean));
      } catch {}
    };
    fetchAllNotes();
  }, [myTask?.notes]);

  useEffect(() => {
    fetchAssignedTaskDetail(id);
    // eslint-disable-next-line
  }, [id]);

  // Hàm đổi trạng thái
  const handleChangeStatus = async (status) => {
    try {
      await changeTaskStatus(task._id, status);
      message.success("Đổi trạng thái thành công!");
    } catch (err) {
      message.error(err?.message || "Không đổi được trạng thái");
    }
  };

  const fetchEquipment = async () => {
    try {
      await fetchFarmEquipment({
        farmId: myTask?.task?.farmId,
      });
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line
  }, []);

  const handleSubmitNote = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("comment", values.comment);

      if (noteType === "harvest") {
        if (harvestYield === undefined || harvestYield < 0) {
          message.error("Vui lòng nhập sản lượng thu hoạch hợp lệ");
          return;
        }
        formData.append("quantity", harvestYield);
        formData.append("type", "harvest");
      } else if (noteType === "equipment") {
        const equipmentData = selectedEquipment.map((equipment) => ({
          id: equipment._id,
          quantity: equipment.quantity || 0,
        }));
        if (equipmentData.length === 0) {
          message.error("Vui lòng chọn ít nhất một thiết bị và nhập số lượng");
          return;
        }
        if (values.image?.file) formData.append("image", values.image.file);
        formData.append("equipments", JSON.stringify(equipmentData));
        formData.append("type", "consumption");
      }

      setSubmitting(true);
      await createDailyNote(id, formData);
      message.success("Ghi chú đã được gửi");
      form.resetFields();
      setSelectedEquipment([]);
      setHarvestYield(undefined);
      fetchAssignedTaskDetail(id);
    } catch (err) {
      message.error(err?.message || "Không thể gửi ghi chú");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectEquipment = (equipment) => {
    if (!selectedEquipment.some((eq) => eq._id === equipment._id)) {
      setSelectedEquipment((prev) => [...prev, equipment]);
    }
  };

  if (loading || !myTask?.task) return <Spin style={{ margin: 80 }} />;

  const task = myTask.task;
  const histories = myTask.histories || [];

  return (
    <div className="farmer-task-detail-root">
      <div className="farmer-task-detail-main">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            Quay lại
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết công việc
          </Title>
        </div>

        <Card bordered={false} style={{ marginBottom: 20 }}>
          <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Tên công việc">
              {task.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {task.description}
            </Descriptions.Item>
            <Descriptions.Item label="Vườn">
              {myTask.garden.name}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={typeColor[task.type]}>{typeLabel[task.type]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ưu tiên">
              <Tag color={priorityColor[task.priority]}>
                {priorityLabel[task.priority]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColor[task.status]}>
                {statusLabel[task.status] || task.status}
              </Tag>
              {/* Button đổi trạng thái, có thể chỉnh logic hiển thị tùy status */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {task.status === "assigned" && (
                  <Button
                    type="primary"
                    onClick={() => handleChangeStatus("in-progress")}
                    style={{ marginRight: 10 }}
                  >
                    Bắt đầu thực hiện
                  </Button>
                )}
                {task.status === "in-progress" && (
                  <Button
                    type="primary"
                    onClick={() => handleChangeStatus("completed")}
                    style={{
                      marginRight: 10,
                      background: "#16a34a",
                      borderColor: "#16a34a",
                    }}
                  >
                    Đánh dấu hoàn thành
                  </Button>
                )}
                {/* {(task.status === "assigned" ||
                  task.status === "in-progress") && (
                  <Button danger onClick={() => handleChangeStatus("canceled")}>
                    Huỷ công việc
                  </Button>
                )} */}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(task.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
               {new Date(task.startDate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {new Date(task.endDate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            {/* Hiển thị thông tin xóa nếu task có trạng thái false */}
            {task.status === "false" && (
              <>
                {task.deleteReason && (
                  <Descriptions.Item label="Lý do bị xóa">
                    <div style={{ 
                      padding: "8px 12px", 
                      background: "#fff2f0", 
                      border: "1px solid #ffccc7", 
                      borderRadius: "6px",
                      color: "#cf1322"
                    }}>
                      {task.deleteReason}
                    </div>
                  </Descriptions.Item>
                )}
                
                {task.deletedAt && (
                  <Descriptions.Item label="Thời gian xóa">
                    {new Date(task.deletedAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                )}
              </>
            )}
            {task.image && (
              <Descriptions.Item label="Ảnh minh hoạ">
                <Image
                  src={
                    task.image.startsWith("http")
                      ? task.image
                      : ImageBaseUrl + task.image
                  }
                  alt="Ảnh task"
                  width={200}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Ghi chú" key="1">
            <Card
              title="Thêm ghi chú"
              bordered={false}
              style={{ borderRadius: 12, marginBottom: 20 }}
            >
              <Form layout="vertical" form={form}>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[{ required: true, message: "Nhập tiêu đề ghi chú" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="Nội dung"
                  rules={[{ required: true, message: "Nhập nội dung ghi chú" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item label="Loại ghi chú">
                  <Radio.Group
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                  >
                    <Radio value="harvest">Thu hoạch</Radio>
                    <Radio value="equipment">Thiết bị</Radio>
                  </Radio.Group>
                </Form.Item>
                {noteType === "harvest" && (
                  <Form.Item label="Sản lượng thu hoạch (kg)">
                    <InputNumber
                      min={0}
                      style={{ width: 180 }}
                      value={harvestYield}
                      onChange={setHarvestYield}
                      placeholder="Nhập sản lượng"
                    />
                  </Form.Item>
                )}
                {noteType === "equipment" && (
                  <>
                    <EquipmentList
                      equipmentList={equipmentList.filter(
                        (equipment) =>
                          !selectedEquipment.some(
                            (selected) => selected._id === equipment._id
                          )
                      )}
                      handleSelectEquipment={handleSelectEquipment}
                    />
                    <Form.Item label="Thiết bị đã chọn">
                      {selectedEquipment.map((equipment) => {
                        return (
                          <div key={equipment._id} style={{ marginBottom: 8 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                justifyContent: "space-between",
                                height: 60,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <Image
                                  src={
                                    equipment.image.startsWith("http")
                                      ? equipment.image
                                      : ImageBaseUrl + equipment.image
                                  }
                                  alt={equipment.name}
                                  height={60}
                                  width={60}
                                  style={{ objectFit: "contain" }}
                                />
                                <Text strong>{equipment.name}</Text>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <InputNumber
                                  min={0}
                                  value={equipment.quantity || 0}
                                  onChange={(value) => {
                                    setSelectedEquipment((prev) =>
                                      prev.map((eq) =>
                                        eq._id === equipment._id
                                          ? { ...eq, quantity: value }
                                          : eq
                                      )
                                    );
                                  }}
                                  style={{ marginLeft: 12 }}
                                  placeholder="Số lượng"
                                />
                                <Button
                                  type="link"
                                  onClick={() => {
                                    setSelectedEquipment((prev) =>
                                      prev.filter(
                                        (eq) => eq._id !== equipment._id
                                      )
                                    );
                                  }}
                                  style={{ marginLeft: 12 }}
                                >
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </Form.Item>
                  </>
                )}
                <Form.Item name="image" label="Hình ảnh (nếu có)">
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>Tải ảnh</Button>
                  </Upload>
                </Form.Item>
                <Button
                  type="primary"
                  onClick={handleSubmitNote}
                  loading={submitting}
                  disabled={task?.status === "false"}
                  style={{
                    backgroundColor: "#23643A",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontWeight: "600",
                    borderColor: "#23643A",
                    width: "100%",
                  }}
                >
                  Gửi ghi chú
                </Button>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* Right: Histories + Notes */}
      <div className="farmer-task-detail-side">
        <Card
          title="Lịch sử gán công việc"
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 20 }}
        >
          {histories.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={histories}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ background: "#a6d6b9" }}
                      />
                    }
                    title={
                      <Text strong>
                        {item.farmer?.fullName || "Không rõ"} (
                        {item.farmer?.email})
                      </Text>
                    }
                    description={
                      <>
                        <div>{item.comment}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">Chưa có lịch sử gán công việc</Text>
          )}
        </Card>

        <Card
          title="Ghi chú hàng ngày"
          bordered={false}
          style={{ borderRadius: 12 }}
        >
          {notesDetail.length > 0 ? (
            notesDetail.map((noteDetail) => {
              const note = noteDetail.taskDailyNote;
              const equipments = noteDetail.equipments || [];
              return (
                <List.Item
                  style={{
                    border: "1px solid grey",
                    marginBottom: 12,
                    padding: 8,
                    borderRadius: 8,
                  }}
                  key={note._id}
                >
                  <List.Item.Meta
                    title={<Text strong>{note.title}</Text>}
                    description={
                      <>
                        <span style={{ fontSize: 13, color: "#888" }}>
                          {new Date(note.createdAt).toLocaleString("vi-VN")}
                        </span>
                        {/* Nếu type consumption thì show thiết bị */}
                        {note.type === "consumption" &&
                          equipments.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>Thiết bị sử dụng:</Text>
                              <List
                                size="small"
                                dataSource={equipments}
                                renderItem={(eq) => (
                                  <List.Item
                                    style={{
                                      padding: "4px 0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "start",
                                      gap: 8,
                                    }}
                                  >
                                    <Image
                                      width={40}
                                      src={
                                        eq.equipment.image.startsWith("http")
                                          ? eq.equipment.image
                                          : ImageBaseUrl + eq.equipment.image
                                      }
                                      alt={eq.equipment.name}
                                      style={{
                                        borderRadius: 6,
                                      }}
                                    />
                                    <Text>
                                      {eq.equipment.name} — <b>{eq.quantity}</b>
                                    </Text>
                                  </List.Item>
                                )}
                              />
                            </div>
                          )}
                        {/* Nếu type harvest thì show sản lượng */}
                        {note.type === "harvest" && (
                          <div style={{ marginTop: 8 }}>
                            <Text strong>Sản lượng thu hoạch:</Text>{" "}
                            <Tag color="green">{note.quantity} kg</Tag>
                          </div>
                        )}
                      </>
                    }
                  />
                  <div style={{ marginBottom: 8 }}>{note.comment}</div>
                  {note.image && (
                    <Image
                      width={160}
                      src={
                        note.image.startsWith("http")
                          ? note.image
                          : ImageBaseUrl + note.image
                      }
                      alt="Ảnh ghi chú"
                    />
                  )}
                </List.Item>
              );
            })
          ) : (
            <Text type="secondary">Chưa có ghi chú nào</Text>
          )}
        </Card>
      </div>
      <style>
        {`
        .farmer-task-detail-root {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px #1b7a4022;
          padding: 32px;
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        .farmer-task-detail-main {
          flex: 1;
          min-width: 340px;
        }
        .farmer-task-detail-side {
          flex: 1;
          min-width: 360px;
        }
        @media (max-width: 900px) {
          .farmer-task-detail-root {
            flex-direction: column;
            gap: 18px;
            padding: 18px;
          }
          .farmer-task-detail-main, .farmer-task-detail-side {
            min-width: unset;
          }
        }
        @media (max-width: 600px) {
          .farmer-task-detail-root {
            padding: 7px;
          }
          .farmer-task-detail-main, .farmer-task-detail-side {
            padding: 0 !important;
            font-size: 15px !important;
          }
        }
        `}
      </style>
    </div>
  );
}
