import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

/**
 * EquipmentModal
 * Modal dùng để tạo mới / chỉnh sửa thiết bị nông nghiệp.
 *
 * Props:
 * - open: boolean điều khiển mở/đóng modal
 * - onOk: hàm callback khi bấm xác nhận, nhận dữ liệu form + ảnh
 * - onCancel: hàm đóng modal khi hủy
 * - initialValues: giá trị khởi tạo khi sửa (name, description, categoryId, image)
 * - confirmLoading: trạng thái loading nút xác nhận
 * - isEdit: true nếu là chế độ chỉnh sửa
 * - categories: danh sách danh mục để chọn
 */
export default function EquipmentModal({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
  categories = [],
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  // Lọc chỉ lấy các danh mục đang hoạt động (status === true)
  const availableCategories = categories.filter(c => c.status === true);

  // Khi modal mở: set giá trị form từ initialValues.
  // Nếu đang sửa và có ảnh: hiển thị trước ảnh hiện tại (preview) trong Upload.
  // Khi modal đóng: reset form để tránh lưu state cũ.
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "equipment.jpg",
            url: initialValues.image.startsWith("http")
              ? initialValues.image
              : ImageBaseUrl + initialValues.image,
            status: "done",
          },
        ]);
      } else setFileList([]);
    }
    if (!open) form.resetFields();
  }, [open, initialValues, form, isEdit]);

  return (
    <Modal
      // Tiêu đề thay đổi theo chế độ: thêm mới hoặc chỉnh sửa
      title={isEdit ? "Sửa thiết bị" : "Thêm thiết bị"}
      open={open}
      // onOk: validate form -> trả dữ liệu cho onOk(parent)
      onOk={() =>
        form
          .validateFields()
          .then((values) => {
            return onOk({
              ...values,
              // Nếu người dùng chọn ảnh mới, lấy file gốc; nếu không, để null (back-end tự xử lý giữ ảnh cũ khi edit)
              image: fileList[0]?.originFileObj || null,
            });
          })
          .catch((err) => {
            console.error("Validation or submission error:", err);
          })
      }
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width={600}
      destroyOnClose
      okText="Xác nhận"
      cancelText="Huỷ"
    >
      {/* Form vertical cho các trường thông tin thiết bị */}
      <Form form={form} layout="vertical">
        {/* Tên thiết bị */}
        <Form.Item
          name="name"
          label="Tên thiết bị"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input />
        </Form.Item>
        {/* Mô tả thiết bị */}
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input />
        </Form.Item>
        {/* Danh mục thuộc về thiết bị */}
        <Form.Item
          name="categoryId"
          label="Danh mục"
          rules={[{ required: true, message: "Chọn danh mục" }]}
        >
          <Select
            showSearch
            placeholder="Chọn danh mục"
            options={availableCategories.map((c) => ({
              value: c._id,
              label: c.name,
            }))}
          />
        </Form.Item>
        {/* Ảnh minh hoạ: dùng Upload kiểu picture-card, không upload tự động (beforeUpload=false) */}
        <Form.Item label="Ảnh minh hoạ">
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
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
}