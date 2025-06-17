import { useEffect, useState } from "react";
import { Button, Modal, Form, Input } from "antd";
import type { FormProps } from "antd";
import { addClient, deleteClient, getClients } from "../../api/client";
import type { Client } from "../../types/client";
import ClientTable from "../../components/ClientTable";
function ClientsPage() {
  const [clientsData, setClientsData] = useState<Client[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openAddClientModal, setOpenAddClientModal] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 1178) {
      setIsMobile(true);
    }
  });
  const showModalAddClient = () => {
    setOpenAddClientModal(true);
  };
  const handleCancelAddClient = () => {
    form.resetFields();
    setOpenAddClientModal(false);
  };
  const handleAddClient: FormProps["onFinish"] = async (values) => {
    await addClient(values);
    await fetchDataClients();
    form.resetFields();
    setOpenAddClientModal(false);
  };
  const handleDeleteClient = async (id: number) => {
    try {
      await deleteClient(id);
      await fetchDataClients();
    } catch (error) {
      alert("Ошибка при удалении клиента");
    }
  };

  const fetchDataClients = async () => {
    try {
      setIsLoading(true);
      const clients = await getClients();
      setClientsData(clients);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataClients();
  }, []);

  return (
    <>
      <div className="actions-for-table">
        <Button
          size={!isMobile ? "large" : "small"}
          onClick={showModalAddClient}
        >
          Добавить спортсмена
        </Button>
        <Modal
          open={openAddClientModal}
          title="Добавить спортсмена"
          onCancel={handleCancelAddClient}
          footer={[
            <Button key="back" onClick={handleCancelAddClient} >
              Назад
            </Button>,
            <Button key="submit" htmlType="submit" form="form-add-sportsmen">
              Подтвердить
            </Button>,
          ]}
        >
          <Form
            name="basic"
            form={form}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={handleAddClient}
            autoComplete="off"
            layout="vertical"
            id="form-add-sportsmen"
          >
            <Form.Item
              label="Полное имя тренирующегося"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста введите имя тренирующегося!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Номер телефона тренирующегося"
              name="phoneNumber"
              rules={[
                { required: true, message: "Номер телефона тренирующегося!" },
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
          </Form>
        </Modal>
      </div>
      <div className="admin-table">
        <ClientTable
          clientsData={clientsData}
          isLoading={isLoading}
          fetchDataClients={fetchDataClients}
          handleDeleteClient={handleDeleteClient}
        />
      </div>
    </>
  );
}

export default ClientsPage;
