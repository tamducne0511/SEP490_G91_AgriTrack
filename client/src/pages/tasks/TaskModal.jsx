import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, message, Typography, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";
import { useGardenStore } from "@/stores";

const { Title, Text } = Typography;

const TaskModal = ({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
  gardens = [],
  zones = [],
  onGardenChange,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { fetchZonesByGardenId } = useGardenStore();
  const [selectedGardenId, setSelectedGardenId] = useState(
    initialValues?.zoneId
      ? gardens.find((g) =>
          g.zones?.some((z) => z._id === initialValues.zoneId)
        )?._id
      : undefined
  );
  const [selectedZoneId, setSelectedZoneId] = useState(
    initialValues?.zoneId || undefined
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "task.jpg",
            url: initialValues.image.startsWith("http")
              ? initialValues.image
              : ImageBaseUrl + initialValues.image,
            status: "done",
          },
        ]);
      } else {
        setFileList([]);
      }
      setSelectedGardenId(
        initialValues?.zoneId
          ? gardens.find((g) =>
              g.zones?.some((z) => z._id === initialValues.zoneId)
            )?._id
          : undefined
      );
      setSelectedZoneId(initialValues?.zoneId || undefined);
    }
    if (!open) form.resetFields();
  }, [open, initialValues, form, isEdit, gardens]);

  useEffect(() => {
    if (selectedGardenId && open) {
      fetchZonesByGardenId(selectedGardenId);
    }
  }, [selectedGardenId, open, fetchZonesByGardenId]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleOkInternal = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedZoneId) {
        message.error("Vui lòng chọn một zone!");
        return;
      }
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("zoneId", selectedZoneId);
      formData.append("type", values.type);
      formData.append("priority", values.priority);
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      await onOk(formData);
    } catch (err) {
      console.error("Validation or submission error:", err);
    }
  };

  // Tạo grid cho zones
  const getRowLabel = (index) => String.fromCharCode(65 + index); // A, B, C, ...
  const maxRows = Math.max(...zones.map((z) => z.row), 0);
  const maxCols = Math.max(...zones.map((z) => z.col), 0);

  return (
    <Modal
      title={isEdit ? "Sửa công việc" : "Thêm công việc"}
      open={open}
      onOk={handleOkInternal}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={800} // Tăng width để hiển thị grid
      okText="Xác nhận"
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên công việc"
          rules={[{ required: true, message: "Nhập tên công việc" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="gardenId"
          label="Vườn"
          rules={[{ required: true, message: "Chọn vườn" }]}
        >
          <Select
            showSearch
            placeholder="Chọn vườn"
            value={selectedGardenId}
            options={gardens.map((g) => ({
              value: g._id,
              label: g.name,
            }))}
            onChange={(value) => {
              setSelectedGardenId(value);
              setSelectedZoneId(undefined); // Reset zone khi đổi garden
              if (onGardenChange) onGardenChange(value);
            }}
          />
        </Form.Item>
        <Form.Item label="Chọn Zone (Như rạp chiếu phim)">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${maxCols}, 60px)`,
              gap: 8,
              marginBottom: 16,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {Array.from({ length: maxRows }, (_, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {Array.from({ length: maxCols }, (_, colIndex) => {
                  const zone = zones.find(
                    (z) => z.row === rowIndex && z.col === colIndex
                  );
                  const zoneLabel = zone
                    ? zone.name || `${getRowLabel(rowIndex)}${colIndex + 1}`
                    : null;
                  const isSelected = zone && zone._id === selectedZoneId;
                  return zone ? (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => setSelectedZoneId(zone._id)}
                      style={{
                        width: 50,
                        height: 50,
                        border: isSelected
                          ? "2px solid #23643A"
                          : "1px solid #d9d9d9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isSelected ? "#e6f4ea" : "#fff",
                        cursor: "pointer",
                        borderRadius: 4,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {zoneLabel}
                    </div>
                  ) : (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      style={{
                        width: 50,
                        height: 50,
                        border: "1px dashed #d9d9d9",
                        background: "#f0f0f0",
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          {selectedZoneId && (
            <Text type="success">
              Zone được chọn:{" "}
              {zones.find((z) => z._id === selectedZoneId)?.name ||
                `Zone ${getRowLabel(
                  zones.find((z) => z._id === selectedZoneId)?.row
                )}${zones.find((z) => z._id === selectedZoneId)?.col + 1}`}
            </Text>
          )}
        </Form.Item>
        <Form.Item
          name="type"
          label="Loại công việc"
          rules={[
            { required: true, message: "Chọn loại công việc" },
            {
              validator: (_, value) =>
                value === "collect" || value === "task-care"
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Type must be collect or task-care")
                    ),
            },
          ]}
        >
          <Select
            placeholder="Chọn loại công việc"
            options={[
              { value: "collect", label: "Thu hoạch (collect)" },
              { value: "task-care", label: "Chăm sóc (task-care)" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="priority"
          label="Độ ưu tiên"
          rules={[{ required: true, message: "Nhập độ ưu tiên" }]}
        >
          <Select
            options={[
              { value: "low", label: "Thấp" },
              { value: "medium", label: "Trung bình" },
              { value: "high", label: "Cao" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Ảnh minh hoạ">
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
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
