import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  type TableProps,
} from "antd";
import type { Sport } from "../../types/sports";
import { useEffect, useState } from "react";
import { editSport, deleteSport } from "../../api/subscriptions";

interface Props {
  sports: Sport[];
  isLoading: boolean;
  fetchSports: () => Promise<void>;
}

const SportsTable: React.FC<Props> = ({ sports, isLoading, fetchSports }) => {
  const [form] = Form.useForm();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showEditModal = (sport: Sport) => {
    setEditingSport(sport);
    form.setFieldsValue({
      name: sport.name,
      price: sport.price,
    });
    setOpenEditModal(true);
  };

  const closeEditModal = () => {
    form.resetFields();
    setEditingSport(null);
    setOpenEditModal(false);
  };

  const handleEditSport = async (values: { name: string; price: number }) => {
    if (!editingSport) return;
    try {
      await editSport(editingSport.id, values);
      await fetchSports();
      closeEditModal();
    } catch {
      alert("Ошибка при изменении вида спорта");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSport(id);
      await fetchSports();
    } catch {
      alert("Ошибка при удалении вида спорта");
    }
  };

  const columns: TableProps<Sport>["columns"] = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Цена за день (₽)",
      dataIndex: "price",
      key: "price",
      render: (price) => price + " ₽",
    },
    {
      title: "Цена за месяц (₽)",
      key: "monthly",
      render: (_, record) => record.price * 30 + " ₽",
    },
    {
      title: "Цена за год (₽)",
      key: "yearly",
      render: (_, record) => record.price * 365 + " ₽",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <div className="admin-actions">
          <Button onClick={() => showEditModal(record)}>Изменить</Button>
          <Popconfirm
            title="Удалить вид спорта"
            description="Вы уверены?"
            onConfirm={() => handleDelete(record.id)}
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
          {sports.map((sport) => (
            <div key={sport.id} className="mobile-item">
              <div>
                <strong>Название:</strong> {sport.name}
              </div>
              <div>
                <strong>Цена за день:</strong> {sport.price} ₽
              </div>
              <div>
                <strong>Цена за месяц:</strong> {sport.price * 30} ₽
              </div>
              <div>
                <strong>Цена за год:</strong> {sport.price * 365} ₽
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Button size="small" onClick={() => showEditModal(sport)}>
                  Изменить
                </Button>
                <Popconfirm
                  title="Удалить вид спорта"
                  description="Вы уверены?"
                  onConfirm={() => handleDelete(sport.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button danger size="small">
                    Удалить
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table<Sport>
          columns={columns}
          dataSource={sports}
          rowKey="id"
          loading={isLoading}
          locale={{ emptyText: "Виды спорта отсутствуют" }}
        />
      )}

      <Modal
        open={openEditModal}
        title="Изменить вид спорта"
        onCancel={closeEditModal}
        footer={[
          <Button key="cancel" onClick={closeEditModal}>
            Назад
          </Button>,
          <Button key="submit" htmlType="submit" form="form-edit-sport">
            Подтвердить
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={handleEditSport}
          id="form-edit-sport"
          layout="vertical"
        >
          <Form.Item
            label="Название"
            name="name"
            rules={[
              { required: true, message: "Введите название вида спорта" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Цена за день"
            name="price"
            rules={[
              { required: true, message: "Введите цену" },
              {
                type: "number",
                min: 0,
                message: "Цена не может быть отрицательной",
                transform: (value) => Number(value),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SportsTable;
