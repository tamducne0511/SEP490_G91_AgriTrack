import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Descriptions,
  Spin,
  Card,
  message,
  Modal,
  Input,
  InputNumber,
} from "antd";
import { useEquipmentCategoryStore, useEquipmentStore } from "@/stores"; // Import the category store
import { RoutePaths } from "@/routes";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    equipmentDetail,
    fetchEquipmentDetail,
    loading,
    error,
    importEquipments,
    exportEquipments,
    updateEquipment,
  } = useEquipmentStore(); // Access equipment store
  const { categories, fetchCategories } = useEquipmentCategoryStore(); // Access category store
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedQuantity, setEditedQuantity] = useState(0);
  const [editedPrice, setEditedPrice] = useState(0);
  const [importQuantity, setImportQuantity] = useState(0);
  const [exportQuantity, setExportQuantity] = useState(0);
  const [price, setPrice] = useState(0); // Store price for import/export modal
  const [isModalVisible, setIsModalVisible] = useState(false); // Show modal state
  const [modalType, setModalType] = useState(""); // To differentiate import/export

  useEffect(() => {
    fetchEquipmentDetail(id); // Fetch equipment details using the store
    fetchCategories(); // Fetch categories to display category info
  }, [id, fetchEquipmentDetail, fetchCategories]);
  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  // Find the category
  const category = categories.find(
    (cat) => cat._id === equipmentDetail?.categoryId
  );

  // Edit Equipment Handler
  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(equipmentDetail.name);
    setEditedDescription(equipmentDetail.description);
    setEditedQuantity(equipmentDetail.quantity);
    setEditedPrice(equipmentDetail.price);
  };

  const handleSave = async () => {
    try {
      await updateEquipment(id, {
        name: editedName,
        description: editedDescription,
        quantity: editedQuantity,
        price: editedPrice,
      });
      setIsEditing(false);
      message.success("Cập nhật thiết bị thành công!");
    } catch (err) {
      message.error(
        "Lỗi cập nhật thiết bị: " + (err?.message || "Vui lòng thử lại")
      );
    }
  };

  // Import Equipment Handler (show modal)
  const handleImportClick = () => {
    setModalType("import");
    setPrice(equipmentDetail.price); // Set price to the equipment price
    setIsModalVisible(true);
  };

  // Export Equipment Handler (show modal)
  const handleExportClick = () => {
    setModalType("export");
    setPrice(equipmentDetail.price); // Set price to the equipment price
    setIsModalVisible(true);
  };

  // Handle Submit for Import/Export
  const handleSubmit = async () => {
    if (modalType === "import" && importQuantity <= 0) {
      message.error("Số lượng nhập phải lớn hơn 0.");
      return;
    }
    if (modalType === "export" && exportQuantity <= 0) {
      message.error("Số lượng xuất phải lớn hơn 0.");
      return;
    }
    const payload = {
      equipmentId: id,
      quantity: modalType === "import" ? importQuantity : exportQuantity,
      price: price,
    };

    try {
      if (modalType === "import") {
        await importEquipments(payload);
      } else {
        await exportEquipments(payload);
      }
      setIsModalVisible(false); // Close modal after submission
    } catch (err) {
      message.error(
        "Lỗi nhập/xuất thiết bị: " + (err?.message || "Vui lòng thử lại")
      );
    }
  };

  if (loading) return <Spin style={{ margin: 80 }} />; // Loading state
  if (!equipmentDetail) return <div>Không tìm thấy thiết bị.</div>; // If no equipment found
  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        alignItems: "flex-start",
        padding: 24,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 4px 24px #0001",
      }}
    >
      {/* Equipment Info */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          Quay lại
        </Button>
        <Card>
          <Descriptions bordered column={1} title="Thông tin thiết bị">
            <Descriptions.Item label="Tên thiết bị">
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              ) : (
                equipmentDetail.name
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Loại thiết bị">
              {category ? category.name : "Chưa có danh mục"}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {isEditing ? (
                <InputNumber
                  value={editedQuantity}
                  onChange={(value) => setEditedQuantity(value)}
                  min={0}
                />
              ) : (
                equipmentDetail.quantity
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {new Date(equipmentDetail.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>

          {/* Edit Button */}
          {!isEditing ? (
            <Button
              type="primary"
              onClick={handleEdit}
              style={{ marginTop: 16 }}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSave}
              style={{ marginTop: 16 }}
            >
              Lưu thay đổi
            </Button>
          )}

          {/* Import / Export Section */}
          <div style={{ marginTop: 16 }}>
            <Button
              onClick={handleImportClick}
              type="default"
              style={{ marginRight: 16 }}
            >
              Nhập thiết bị
            </Button>
            <Button onClick={handleExportClick} type="default">
              Xuất thiết bị
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal for Import/Export */}
      <Modal
        title={modalType === "import" ? "Nhập thiết bị" : "Xuất thiết bị"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={modalType === "import" ? "Nhập" : "Xuất"}
      >
        <div>
          <InputNumber
            value={modalType === "import" ? importQuantity : exportQuantity}
            onChange={(value) =>
              modalType === "import"
                ? setImportQuantity(value)
                : setExportQuantity(value)
            }
            min={0}
            placeholder="Số lượng"
            style={{ width: "100%", marginBottom: 16 }}
          />
          <InputNumber
            value={price}
            onChange={setPrice}
            min={0}
            placeholder="Giá tiền"
            style={{ width: "100%" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentDetail;
