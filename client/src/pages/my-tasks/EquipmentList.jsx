import { ImageBaseUrl } from "@/variables/common";
import { Card, Collapse, Image, List, Typography } from "antd";

const { Panel } = Collapse;

const EquipmentList = ({ equipmentList, handleSelectEquipment }) => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Chọn thiết bị" key="1">
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={equipmentList}
          renderItem={(equipment) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <Image
                    src={
                      equipment.image.startsWith("http")
                        ? equipment.image
                        : ImageBaseUrl + equipment.image
                    }
                    alt={equipment.name}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                }
                onClick={() => handleSelectEquipment(equipment)} // Select equipment
                style={{ cursor: "pointer", padding: 0 }}
              >
                <Typography>
                  {equipment.name} {`(${equipment.quantity})`}
                </Typography>
              </Card>
            </List.Item>
          )}
        />
      </Panel>
    </Collapse>
  );
};

export default EquipmentList;
