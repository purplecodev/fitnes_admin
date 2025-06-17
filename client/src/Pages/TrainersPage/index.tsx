import { useEffect, useState } from "react";
import { addTrainer, getTrainers } from "../../api/trainer";
import { getSports } from "../../api/subscriptions";
import TrainerTable from "../../components/TrainerTable";
import type { Trainer } from "../../types/trainers";
import type { Sport } from "../../types/sports";
import { Button, Form, Input, Modal, Select } from "antd";

const { Option } = Select;

function TrainersPage() {
  const [trainersData, setTrainersData] = useState<Trainer[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 1178) {
      setIsMobile(true);
    }
  });
  const fetchDataTrainers = async () => {
    const data = await getTrainers();
    setTrainersData(data);
  };

  const fetchSports = async () => {
    const data = await getSports();
    setSports(data);
  };

  useEffect(() => {
    fetchDataTrainers();
    fetchSports();
  }, []);

  const handleAddTrainer = async (values: any) => {
    console.log("Добавляем тренера:", values);
    await addTrainer(values);
    await fetchDataTrainers();
    setModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 16 }}
        size={!isMobile ? "large" : "small"}
      >
        Добавить тренера
      </Button>

      <TrainerTable
        trainersData={trainersData}
        fetchDataTrainers={fetchDataTrainers}
        sports={sports}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Добавить тренера"
        onOk={() => form.submit()}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleAddTrainer}>
          <Form.Item
            name="fullName"
            label="ФИО"
            rules={[{ required: true, message: "Введите ФИО" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Телефон"
            rules={[
              { required: true, message: "Введите номер телефона" },
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
                    value
                  )
                    ? Promise.resolve()
                    : Promise.reject(new Error("Неверный формат телефона!"));
                },
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sportId"
            label="Вид спорта"
            rules={[{ required: true, message: "Выберите вид спорта" }]}
          >
            <Select placeholder="Выберите вид спорта">
              {sports.map((sport) => {
                return (
                  <Option key={sport.id} value={sport.id}>
                    {sport.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default TrainersPage;
