import { Button, Form, Input, Modal, Popconfirm, type TableProps } from "antd";
import type { Client } from "../../types/client";
import { useState } from "react";
import { editClient } from "../../api/client";
import SubscriptionModal from "../SubscriptionModal";
import TrainerModal from "../TrainerModal";
import { INITIAL_CLIENT } from "../../constants/clients";

import TableRaw from "ant-responsive-table";
const Table = TableRaw as React.FC<any>;

const ClientTable: React.FC<{
  clientsData: Client[] | undefined;
  isLoading: boolean;
  handleDeleteClient: (id: number) => Promise<void>;
  fetchDataClients: () => Promise<void>;
}> = ({ clientsData, isLoading, handleDeleteClient, fetchDataClients }) => {
  const [form] = Form.useForm();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingSubscriptionsClient, setEditingSubscriptionsClient] =
    useState<Client>(INITIAL_CLIENT);
  const [editingTrainersClient, setEditingTrainersClient] =
    useState<Client>(INITIAL_CLIENT);

  const [openSubscriptionModal, setOpenSubsriptionModal] = useState(false);
  const [openTrainerModal, setOpenTrainerModal] = useState(false);

  const showModalEditClient = (client: Client) => {
    setEditingClient(client);
    setOpenEditModal(true);
    form.setFieldsValue({
      fullName: client.fullName,
      phoneNumber: client.phoneNumber,
    });
  };

  const handleCancelEditClient = () => {
    form.resetFields();
    setOpenEditModal(false);
    setEditingClient(null);
  };

  const handleEditClient = async (values: any) => {
    if (!editingClient) return;
    await editClient(editingClient.id, values);
    await fetchDataClients();
    handleCancelEditClient();
  };

  const showModalSubscription = (client: Client) => {
    setEditingSubscriptionsClient(client);
    setOpenSubsriptionModal(true);
  };

  const showModalTrainer = (client: Client) => {
    setEditingTrainersClient(client);
    setOpenTrainerModal(true);
  };
  type BaseColumnType<T> = NonNullable<TableProps<T>["columns"]>[number];

  // Расширяем как type, а не interface
  type ResponsiveColumnType<T> = BaseColumnType<T> & {
    showOnResponse?: boolean;
    showOnDesktop?: boolean;
  };

  const columns: ResponsiveColumnType<Client>[] = [
    {
      title: "ФИО",
      dataIndex: "fullName",
      key: "fullName",
      showOnResponse: true,
      showOnDesktop: true,
    },
    {
      title: "Номер телефона",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      showOnResponse: true,
      showOnDesktop: true,
    },
    {
      title: "Тренеры",
      key: "trainers",
      showOnResponse: true,
      showOnDesktop: true,
      render: (_, record) => {
        if (!record || !record.trainers || record.trainers.length === 0) {
          return "—";
        }

        return (
          <ul>
            {record.trainers.map((trainer) => (
              <li key={trainer.id}>
                {trainer.fullName} ({trainer.sport?.title})
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      title: "Абонементы",
      key: "subscriptions",
      showOnResponse: true,
      showOnDesktop: true,
      render: (_, record) => {
        if (
          !record ||
          !record.subscriptions ||
          record.subscriptions.length === 0
        ) {
          return "—";
        }

        return (
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {record.subscriptions.map((sub) => {
              if (!sub || !sub.sport) return null;

              const date = new Date(sub.expires);
              const formattedDate = `до ${date
                .getDate()
                .toString()
                .padStart(2, "0")}.${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}.${date.getFullYear()}`;

              let multiplier = 1;
              if (sub.type === "Месячный") multiplier = 30;
              else if (sub.type === "Годовой") multiplier = 365;

              const totalPrice = sub.sport.price * multiplier;

              return (
                <li key={sub.id}>
                  <div>
                    <strong>{sub.type}</strong> — {sub.sport.name} —{" "}
                    {totalPrice} руб.
                  </div>
                  <div>Срок: {formattedDate}</div>
                </li>
              );
            })}
          </ul>
        );
      },
    },
    {
      title: "Действия",
      key: "action",
      showOnResponse: true,
      showOnDesktop: true,
      render: (_, record) => (
        <div className="admin-actions">
          <Button onClick={() => showModalEditClient(record)}>Изменить</Button>
          <Popconfirm
            title="Удалить спортсмена"
            description="Вы уверены что хотите удалить этого спортсмена из системы?"
            onConfirm={() => handleDeleteClient(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger>Удалить</Button>
          </Popconfirm>
          <Button onClick={() => showModalSubscription(record)}>
            Управление абонементами
          </Button>
          <Button onClick={() => showModalTrainer(record)}>
            Управление тренерами
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* <Table<Client>
        columns={columns}
        dataSource={clientsData}
        rowKey="id"
        loading={isLoading}
        locale={{ emptyText: "Спортсмены отстутсвуют" }}
      /> */}

      <Table
        antTableProps={{
          showHeader: true,
          columns,
          dataSource: clientsData,
          rowkey: "id",
          isLoading,
          locale: { emptyText: "Спортсмены отстутсвуют" },
        }}
        mobileBreakPoint={1178}
      />
      <Modal
        open={openEditModal}
        title="Изменить данные спортсмена"
        onCancel={handleCancelEditClient}
        footer={[
          <Button key="back" onClick={handleCancelEditClient}>
            Назад
          </Button>,
          <Button key="submit" htmlType="submit" form="form-edit-sportsmen">
            Подтвердить
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={handleEditClient}
          layout="vertical"
          id="form-edit-sportsmen"
        >
          <Form.Item
            label="Полное имя тренирующегося"
            name="fullName"
            rules={[{ required: true, message: "Пожалуйста введите имя!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Номер телефона тренирующегося"
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
        </Form>
      </Modal>

      <SubscriptionModal
        open={openSubscriptionModal}
        onClose={() => setOpenSubsriptionModal(false)}
        client={editingSubscriptionsClient}
        fetchDataClients={fetchDataClients}
      />
      <TrainerModal
        open={openTrainerModal}
        onClose={() => setOpenTrainerModal(false)}
        client={editingTrainersClient}
        fetchDataClients={fetchDataClients}
      />
    </>
  );
};

export default ClientTable;
