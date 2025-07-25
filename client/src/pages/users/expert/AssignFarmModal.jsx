import { Modal, Select, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useFarmStore } from "@/stores";

const AssignFarmModal = ({ open, onOk, onCancel, userId }) => {
  const { farms, fetchFarms } = useFarmStore();
  const [farmId, setFarmId] = useState();

  useEffect(() => {
    if (open) fetchFarms({ page: 1, pageSize: 100 }); // lấy nhiều farm
    if (!open) setFarmId(undefined);
  }, [open, fetchFarms]);

  return (
    <Modal
      open={open}
      title="Chọn vườn để gán chuyên gia"
      onOk={() => onOk(farmId)}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item
          label="Vườn"
          required
          rules={[{ required: true, message: "Chọn vườn!" }]}
        >
          <Select
            placeholder="Chọn vườn"
            value={farmId}
            onChange={setFarmId}
            options={farms.map((f) => ({
              label: f.name,
              value: f._id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignFarmModal;