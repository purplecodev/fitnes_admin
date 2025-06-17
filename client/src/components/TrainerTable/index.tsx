import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  type TableProps,
} from "antd";
import { useEffect, useState } from "react";
import type { Trainer } from "../../types/trainers";
import type { Sport } from "../../types/sports";
import { editTrainer, deleteTrainer } from "../../api/trainer";

const TrainerTable: React.FC<{
  trainersData: Trainer[];
  fetchDataTrainers: () => Promise<void>;
  sports: Sport[];
}> = ({ trainersData, fetchDataTrainers, sports }) => {
  const [form] = Form.useForm();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showModalEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setOpenEditModal(true);
    form.setFieldsValue({
      fullName: trainer.fullName,
      phoneNumber: trainer.phoneNumber,
      sportId: trainer.sport?.id,
    });
  };

  const handleCancelEditTrainer = () => {
    form.resetFields();
    setOpenEditModal(false);
    setEditingTrainer(null);
  };

  const handleEditTrainer = async (values: any) => {
    if (!editingTrainer) return;
    await editTrainer(editingTrainer.id, values);
    await fetchDataTrainers();
    handleCancelEditTrainer();
  };

  const handleDeleteTrainer = async (id: number) => {
    await deleteTrainer(id);
    await fetchDataTrainers();
  };

  const trainerColumns: TableProps<Trainer>["columns"] = [
    {
      title: "ФИО",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Номер телефона",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Вид спорта",
      key: "sportType",
      render: (_, record) => record.sport?.title ?? "—",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <div className="admin-actions">
          <Button onClick={() => showModalEditTrainer(record)}>Изменить</Button>
          <Popconfirm
            title="Удалить тренера"
            description="Вы уверены, что хотите удалить этого тренера?"
            onConfirm={() => handleDeleteTrainer(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger>Удалить</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      {isMobile ? (
        <div>
          {trainersData.map((trainer) => (
            <div key={trainer.id} className="mobile-item" >
              <div><strong>ФИО:</strong> {trainer.fullName}</div>
              <div><strong>Номер телефона:</strong> {trainer.phoneNumber}</div>
              <div><strong>Вид спорта:</strong> {trainer.sport?.title ?? "—"}</div>

              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Button size="small" onClick={() => showModalEditTrainer(trainer)}>Изменить</Button>
                <Popconfirm
                  title="Удалить тренера"
                  description="Вы уверены, что хотите удалить этого тренера?"
                  onConfirm={() => handleDeleteTrainer(trainer.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table<Trainer>
          columns={trainerColumns}
          dataSource={trainersData}
          rowKey="id"
          locale={{ emptyText: "Тренеры отсутствуют" }}
        />
      )}

      <Modal
        open={openEditModal}
        title="Изменить данные тренера"
        onCancel={handleCancelEditTrainer}
        footer={[
          <Button key="back" onClick={handleCancelEditTrainer}>
            Назад
          </Button>,
          <Button key="submit" htmlType="submit" form="form-edit-trainer">
            Подтвердить
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={handleEditTrainer}
          layout="vertical"
          id="form-edit-trainer"
        >
          <Form.Item
            label="Полное имя тренера"
            name="fullName"
            rules={[{ required: true, message: "Пожалуйста введите имя!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Номер телефона"
            name="phoneNumber"
            rules={[
              { required: true, message: "Введите номер телефона!" },
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();
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
            label="Вид спорта"
            name="sportId"
            rules={[{ required: true, message: "Выберите вид спорта!" }]}
          >
            <Select placeholder="Выберите вид спорта">
              {sports.map((sport) => (
                <Select.Option key={sport.id} value={sport.id}>
                  {sport.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TrainerTable;
