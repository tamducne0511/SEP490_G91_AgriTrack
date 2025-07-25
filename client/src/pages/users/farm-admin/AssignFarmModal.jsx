import React, { useEffect, useState } from "react";
import { Modal, Select, Form, Spin, Empty } from "antd";
import { useFarmStore } from "@/stores";

const AssignFarmModal = ({ open, onOk, onCancel, userId }) => {
  const { farms, fetchFarms, loading } = useFarmStore();
  const [search, setSearch] = useState("");
  const [farmId, setFarmId] = useState();

  useEffect(() => {
    if (open) fetchFarms({ page: 1, name: search, pageSize: 100 });
    if (!open) {
      setFarmId(undefined);
      setSearch("");
    }
  }, [open, search, fetchFarms]);

  const handleOk = () => {
    if (!farmId) return;
    onOk(farmId);
  };

  return (
    <Modal
      open={open}
      title="Chọn vườn để gán"
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label="Vườn" required>
          <Select
            showSearch
            allowClear
            placeholder="Tìm và chọn vườn"
            notFoundContent={
              loading ? (
                <Spin size="small" />
              ) : (
                <Empty description="Không có vườn" />
              )
            }
            value={farmId}
            onChange={setFarmId}
            onSearch={(val) => setSearch(val)}
            filterOption={false}
            options={farms.map((f) => ({
              label: f.name,
              value: f._id,
            }))}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignFarmModal;