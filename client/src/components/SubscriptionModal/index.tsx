import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Select,
  Form,
  Table,
  Popconfirm,
  Typography,
} from "antd";
import type { Client } from "../../types/client";
import {
  getSports,
  addSubscription,
  editSubscription,
  deleteSubscription,
} from "../../api/subscriptions";

const { Option } = Select;
const { Text } = Typography;
type Sport = {
  id: number;
  name: string;
  price: number;
};

type Subscription = {
  id: number;
  expires: string;
  type: "Разовый" | "Месячный" | "Годовой";
  sport: Sport;
};

type SubscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  client: Client;
  fetchDataClients: () => Promise<void>;
};

const calculatePrice = (basePrice: number, type: string) => {
  switch (type) {
    case "Разовый":
      return basePrice;
    case "Месячный":
      return basePrice * 30;
    case "Годовой":
      return basePrice * 365;
    default:
      return 0;
  }
};

const calculateExpires = (type: string): string => {
  const date = new Date();
  switch (type) {
    case "Разовый":
      date.setDate(date.getDate() + 1);
      break;
    case "Месячный":
      date.setMonth(date.getMonth() + 1);
      break;
    case "Годовой":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return "";
  }
  return date.toISOString().split("T")[0];
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onClose,
  client,
  fetchDataClients,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    client?.subscriptions || []
  );
  const [sports, setSports] = useState<Sport[]>([]);
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedSportId, setSelectedSportId] = useState<number>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 1178);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  useEffect(() => {
    if (client?.subscriptions) {
      setSubscriptions(client.subscriptions);
    }
  }, [client]);
  useEffect(() => {
    const fetchDataSports = async () => {
      const dataSports = await getSports();
      setSports(dataSports);
    };
    fetchDataSports();
  }, []);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedType(undefined);
      setSelectedSportId(undefined);
    }
  }, [open, form]);

  const updateSubscription = async (id: number, field: string, value: any) => {
    setSubscriptions((subs) =>
      subs.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]:
                field === "sport"
                  ? sports.find((sport) => sport.id === value)!
                  : value,
            }
          : s
      )
    );
    await editSubscription(id, {
      clientId: client.id,
      sportId:
        field === "sport"
          ? value
          : subscriptions.find((s) => s.id === id)?.sport.id!,
      type:
        field === "type" ? value : subscriptions.find((s) => s.id === id)?.type,
    });
    await fetchDataClients();
  };

  const handleDeleteSubscription = async (id: number) => {
    const sub = subscriptions.find((s) => s.id === id);
    console.log(
      `Удалён абонемент ID ${id} (${sub?.type}, спорт: ${sub?.sport.name})`
    );
    await deleteSubscription(id);
    await fetchDataClients();
    setSubscriptions((subs) => subs.filter((s) => s.id !== id));
  };

  const handleAddSubscription = async (values: any) => {
    const newId = Math.max(...subscriptions.map((s) => s.id), 0) + 1;
    const selectedSport = sports.find((s) => s.id === values.sport);
    if (!selectedSport) return;

    const expires = calculateExpires(values.type);

    const newSub: Subscription = {
      id: newId,
      expires,
      type: values.type,
      sport: selectedSport,
    };

    setSubscriptions((subs) => [...subs, newSub]);
    await addSubscription({
      clientId: client.id,
      sportId: newSub.sport.id,
      type: newSub.type,
    });
    await fetchDataClients();

    form.resetFields();
    setSelectedType(undefined);
    setSelectedSportId(undefined);
  };

  const columns = [
    {
      title: "Тип",
      dataIndex: "type",
      render: (_: any, record: Subscription) => (
        <Select
          value={record.type}
          style={{ width: 120 }}
          onChange={(val) => updateSubscription(record.id, "type", val)}
        >
          <Option value="Разовый">Разовый</Option>
          <Option value="Месячный">Месячный</Option>
          <Option value="Годовой">Годовой</Option>
        </Select>
      ),
    },
    {
      title: "Вид спорта",
      dataIndex: ["sport", "name"],
      render: (_: any, record: Subscription) => (
        <Select
          value={record.sport?.id}
          style={{ width: 160 }}
          onChange={(val) => updateSubscription(record.id, "sport", val)}
        >
          {sports.map((sport) => (
            <Option key={sport.id} value={sport.id}>
              {sport.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Срок",
      dataIndex: "expires",
      render: (date: string) => {
        const d = new Date(date);
        return `до ${d.getDate().toString().padStart(2, "0")}.${(
          d.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}.${d.getFullYear()}`;
      },
    },
    {
      title: "Цена",
      dataIndex: "sport",
      render: (_: any, record: Subscription) =>
        calculatePrice(record.sport?.price, record.type) + "₽",
    },
    {
      title: "Действия",
      render: (_: any, record: Subscription) => (
        <Popconfirm
          title="Удалить?"
          okText="Да"
          cancelText="Нет"
          onConfirm={() => handleDeleteSubscription(record.id)}
        >
          <Button danger size="small">
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const currentSport = sports.find((s) => s.id === selectedSportId);
  const previewPrice =
    currentSport && selectedType
      ? calculatePrice(currentSport.price, selectedType)
      : 0;

  return (
    <Modal
      open={open}
      title={`Управление абонементами спортсмена`}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Закрыть</Button>}
      width={isMobile ? "95%" : 800}
      destroyOnHidden={true}
    >
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {subscriptions.length === 0 && (
            <div>У спортсмена отсутствуют абонементы</div>
          )}
          {subscriptions.map((sub) => {
            const date = new Date(sub.expires);
            const expiresFormatted = `до ${date.getDate().toString().padStart(2,"0")}.${(date.getMonth()+1).toString().padStart(2,"0")}.${date.getFullYear()}`;
            const price = calculatePrice(sub.sport.price, sub.type);

            return (
              <div key={sub.id} className="admin-in-modal">
                <div>
                  <strong>Тип:</strong>{" "}
                  <Select
                    value={sub.type}
                    style={{ width: 120 }}
                    onChange={(val) => updateSubscription(sub.id, "type", val)}
                    size="small"
                  >
                    <Option value="Разовый">Разовый</Option>
                    <Option value="Месячный">Месячный</Option>
                    <Option value="Годовой">Годовой</Option>
                  </Select>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Вид спорта:</strong>{" "}
                  <Select
                    value={sub.sport?.id}
                    style={{ width: 150 }}
                    onChange={(val) => updateSubscription(sub.id, "sport", val)}
                    size="small"
                  >
                    {sports.map((sport) => (
                      <Option key={sport.id} value={sport.id}>
                        {sport.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Срок:</strong> {expiresFormatted}
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Цена:</strong> {price}₽
                </div>
                <div style={{ marginTop: 8 }}>
                  <Popconfirm
                    title="Удалить?"
                    okText="Да"
                    cancelText="Нет"
                    onConfirm={() => handleDeleteSubscription(sub.id)}
                  >
                    <Button danger size="small">
                      Удалить
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "У спортсмена отсутствуют абонементы" }}
        />
      )}

      <h3 style={{ marginTop: 24 }}>Добавить абонемент</h3>
      <Form form={form} layout={isMobile ? "vertical" : "inline"} onFinish={handleAddSubscription}>
        <Form.Item
          name="type"
          rules={[{ required: true, message: "Выберите тип" }]}
          style={isMobile ? { width: "100%" } : { width: 150 }}
        >
          <Select
            placeholder="Тип"
            onChange={(val) => setSelectedType(val)}
          >
            <Option value="Разовый">Разовый</Option>
            <Option value="Месячный">Месячный</Option>
            <Option value="Годовой">Годовой</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="sport"
          rules={[{ required: true, message: "Выберите вид спорта" }]}
          style={isMobile ? { width: "100%", marginTop: 16 } : { width: 200 }}
        >
          <Select
            placeholder="Вид спорта"
            onChange={(val) => setSelectedSportId(val)}
          >
            {sports.map((sport) => (
              <Option key={sport.id} value={sport.id}>
                {sport.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={isMobile ? { marginTop: 16 } : {}}>
          <Button type="primary" htmlType="submit">
            Добавить
          </Button>
        </Form.Item>

        {selectedType && selectedSportId && (
          <Form.Item style={isMobile ? { marginTop: 16 } : { marginLeft: 16 }}>
            <Text type="secondary">
              Итоговая цена: <b>{previewPrice}₽</b>
            </Text>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};


export default SubscriptionModal;
