import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  Select,
  message,
  Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ImageBaseUrl } from "@/variables/common";
import { useUserStore, useNotificationStore, useAuthStore } from "@/stores";

const NotificationModal = ({
  open,
  onOk,
  onCancel,
  isEdit,
  initialValues = {},
  farmId: selectedFarmIdProp, // chỉ truyền khi tạo mới
  confirmLoading,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [farmId, setFarmId] = useState(selectedFarmIdProp || "");
  const { getListFarmAssignedExpert, listFarmAssignedExpert } = useUserStore();
  const { fetchNotificationDetail, notificationDetail } =
    useNotificationStore();
  const { user } = useAuthStore();

  // Khi mở modal: nếu edit thì lấy chi tiết noti (bao gồm farmId)
  useEffect(() => {
    if (open && isEdit && initialValues._id) {
      fetchNotificationDetail(initialValues._id);
    }
    // Khi tạo, lấy farmId prop (nếu có)
    if (open && !isEdit && selectedFarmIdProp) {
      setFarmId(selectedFarmIdProp);
    }
    if (!open) {
      form.resetFields();
      setFileList([]);
      setFarmId("");
    }
  }, [open, isEdit, initialValues, selectedFarmIdProp]);

  // Set lại form + file khi có data detail
  useEffect(() => {
    if (isEdit && notificationDetail) {
      form.setFieldsValue(notificationDetail);
      setFarmId(notificationDetail.farmId);
      if (notificationDetail.image) {
        setFileList([
          {
            uid: "-1",
            name: "notification.jpg",
            status: "done",
            url: notificationDetail.image.startsWith("http")
              ? notificationDetail.image
              : ImageBaseUrl + notificationDetail.image,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
    if (!isEdit && open && selectedFarmIdProp) {
      setFarmId(selectedFarmIdProp);
    }
  }, [notificationDetail, isEdit, open, selectedFarmIdProp]);

  // Lấy list farm (expert được gán)
  useEffect(() => {
    getListFarmAssignedExpert();
  }, []);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!farmId) {
        message.warning("Vui lòng chọn trang trại!");
        return;
      }
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("farmId", farmId);

      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }
      // Call API
      if (isEdit) {
        await useNotificationStore
          .getState()
          .updateNotification(initialValues._id, user.role, farmId, formData);
        message.success("Cập nhật thông báo thành công!");
      } else {
        await useNotificationStore
          .getState()
          .createNotification(user.role, farmId, formData);
        message.success("Tạo thông báo thành công!");
      }
      onOk();
    } catch (err) {}
  };

  const farmOptions = (listFarmAssignedExpert || []).map(({ farm }) => ({
    label: farm?.name,
    value: farm?._id,
  }));

  return (
    <Modal
      title={isEdit ? "Sửa thông báo" : "Thêm thông báo"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Quay lại"
      confirmLoading={confirmLoading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={notificationDetail}>
        {user?.role === "expert" && (
          <Form.Item
            label="Thuộc trang trại"
            required
            rules={[{ required: true, message: "Chọn trang trại" }]}
          >
            <Select
              value={farmId}
              disabled={true}
              onChange={setFarmId}
              options={farmOptions}
              placeholder="Chọn trang trại"
              allowClear={!isEdit}
            />
          </Form.Item>
        )}
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Nhập tiêu đề thông báo" }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: "Nhập nội dung thông báo" }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập nội dung" />
        </Form.Item>
        <Form.Item label="Ảnh minh hoạ">
          <Upload
            accept="image/*"
            listType="picture-card"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            maxCount={1}
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

export default NotificationModal;
