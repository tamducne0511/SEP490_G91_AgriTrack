import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";

/**
 * Component modal để thêm hoặc chỉnh sửa danh mục thiết bị
 * @param {boolean} open - Trạng thái hiển thị modal
 * @param {function} onOk - Callback khi người dùng xác nhận
 * @param {function} onCancel - Callback khi người dùng hủy
 * @param {object} initialValues - Giá trị khởi tạo cho form (dùng cho chế độ chỉnh sửa)
 * @param {boolean} confirmLoading - Trạng thái loading khi đang xử lý
 * @param {boolean} isEdit - Cờ xác định đang ở chế độ chỉnh sửa hay thêm mới
 */
export default function EquipmentCategoryModal({
  open,
  onOk,
  onCancel,
  initialValues = {},
  confirmLoading,
  isEdit,
}) {
  // Form instance để quản lý dữ liệu form
  const [form] = Form.useForm();
  // State quản lý danh sách file ảnh đã upload
  const [fileList, setFileList] = useState([]);
  
  // Effect để xử lý khi modal mở/đóng và thiết lập dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      // Thiết lập giá trị ban đầu cho form
      form.setFieldsValue(initialValues);
      
      // Nếu đang ở chế độ chỉnh sửa và có ảnh, thiết lập fileList
      if (isEdit && initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "category.jpg",
            // Xử lý URL ảnh: nếu là URL đầy đủ thì dùng trực tiếp, ngược lại thêm base URL
            url: initialValues.image.startsWith("http")
              ? initialValues.image
              : ImageBaseUrl + initialValues.image,
            status: "done",
          },
        ]);
      } else {
        // Nếu không phải chế độ chỉnh sửa hoặc không có ảnh, reset fileList
        setFileList([]);
      }
    }
    
    // Reset form khi modal đóng
    if (!open) form.resetFields();
  }, [open, initialValues, form, isEdit]);

  return (
    <Modal
      title={isEdit ? "Sửa danh mục thiết bị" : "Thêm danh mục thiết bị"}
      open={open}
      onOk={() =>
        form
          .validateFields()
          .then((values) => {
            // Gọi callback onOk với dữ liệu form và file ảnh (nếu có)
            return onOk({
              ...values,
              // Lấy file ảnh gốc từ fileList (chỉ lấy file đầu tiên)
              image: fileList[0]?.originFileObj || null,
            });
          })
          .catch((err) => {
            // Log lỗi validation hoặc submit
            console.error("Validation or submission error:", err);
          })
      }
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width={600}
      destroyOnClose // Tự động destroy component khi đóng modal
      okText="Xác nhận"
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        {/* Trường nhập tên danh mục thiết bị */}
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input />
        </Form.Item>
        
        {/* Trường nhập mô tả danh mục thiết bị */}
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input />
        </Form.Item>
        
        {/* Trường upload ảnh minh họa cho danh mục */}
        <Form.Item label="Ảnh minh hoạ">
          <Upload
            listType="picture-card" // Hiển thị dạng card cho ảnh
            beforeUpload={() => false} // Không tự động upload, chỉ lưu vào state
            maxCount={1} // Chỉ cho phép upload 1 ảnh
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept="image/*" // Chỉ chấp nhận file ảnh
          >
            {/* Hiển thị nút upload khi chưa có ảnh nào */}
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
