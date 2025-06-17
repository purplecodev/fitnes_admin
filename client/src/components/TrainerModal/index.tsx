import { useEffect, useState } from "react";
import { Modal, Table, Select, Form, Button, Popconfirm } from "antd";
import type { Client } from "../../types/client";
import type { Trainer } from "../../types/trainers";
import { addTrainerToClient, removeTrainerFromClient } from "../../api/client";
import { getTrainers } from "../../api/trainer";

const { Option } = Select;

type TrainerModalProps = {
  open: boolean;
  onClose: () => void;
  client: Client;
  fetchDataClients: () => Promise<void>;
};

const TrainerModal: React.FC<TrainerModalProps> = ({
  open,
  onClose,
  client,
  fetchDataClients,
}) => {
  const [allTrainers, setAllTrainers] = useState<Trainer[]>([]);
  const [clientTrainers, setClientTrainers] = useState<Trainer[]>(client.trainers || []);
  const [form] = Form.useForm();

  // Простая проверка ширины окна для адаптива
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // Загрузка всех тренеров
    const fetchAllTrainers = async () => {
      try {
        const data = await getTrainers();
        setAllTrainers(data);
      } catch (error) {
        console.error("Ошибка загрузки тренеров:", error);
      }
    };
    fetchAllTrainers();
  }, []);

  useEffect(() => {
    setClientTrainers(client.trainers || []);
  }, [client]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  const handleAddTrainer = async (values: any) => {
    const trainerToAdd = allTrainers.find((t) => t.id === values.trainer);
    if (!trainerToAdd) return;

    if (clientTrainers.some((t) => t.id === trainerToAdd.id)) {
      console.warn("Тренер уже добавлен");
      return;
    }

    setClientTrainers([...clientTrainers, trainerToAdd]);
    await addTrainerToClient(client.id, trainerToAdd.id);
    await fetchDataClients();
    form.resetFields();
  };

  const handleDeleteTrainer = async (trainerId: number) => {
    await removeTrainerFromClient(client.id, trainerId);
    setClientTrainers((prev) => prev.filter((t) => t.id !== trainerId));
    await fetchDataClients();
  };

  const columns = [
    {
      title: "ФИО",
      dataIndex: "fullName",
    },
    {
      title: "Телефон",
      dataIndex: "phoneNumber",
    },
    {
      title: "Спорт",
      dataIndex: "sport",
      render: (sport: Trainer["sport"]) => sport?.title || "Не указан",
    },
    {
      title: "Действия",
      render: (_: any, record: Trainer) => (
        <Popconfirm
          title="Удалить тренера?"
          onConfirm={() => handleDeleteTrainer(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button danger size="small">
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title="Управление тренерами клиента"
      onCancel={onClose}
      footer={<Button onClick={onClose}>Закрыть</Button>}
      width={isMobile ? "95%" : 700}
      destroyOnClose
    >
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {clientTrainers.length === 0 && <div>У клиента нет тренеров</div>}
          {clientTrainers.map((trainer) => (
            <div
              key={trainer.id}
              style={{
                border: "1px solid #f0f0f0",
                padding: 12,
                borderRadius: 4,
              }}
            >
              <div>
                <b>ФИО:</b> {trainer.fullName}
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Телефон:</b> {trainer.phoneNumber || "Не указан"}
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Спорт:</b> {trainer.sport?.title || "Не указан"}
              </div>
              <div style={{ marginTop: 8 }}>
                <Popconfirm
                  title="Удалить тренера?"
                  onConfirm={() => handleDeleteTrainer(trainer.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button danger size="small" block>
                    Удалить
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={clientTrainers}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "У клиента нет тренеров" }}
        />
      )}

      <h3 style={{ marginTop: 24 }}>Добавить тренера</h3>
      <Form
        form={form}
        layout={isMobile ? "vertical" : "inline"}
        onFinish={handleAddTrainer}
      >
        <Form.Item
          name="trainer"
          rules={[{ required: true, message: "Выберите тренера" }]}
          style={isMobile ? { width: "100%" } : { width: 250 }}
        >
          <Select placeholder="Тренер" size="middle">
            {allTrainers.map((trainer) => (
              <Option key={trainer.id} value={trainer.id}>
                {trainer.fullName} ({trainer.sport?.title || "Без спорта"})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={isMobile ? { marginTop: 16 } : {}}>
          <Button type="primary" htmlType="submit" block={isMobile}>
            Добавить
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TrainerModal;
