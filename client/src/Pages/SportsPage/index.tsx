import { useEffect, useState } from "react";
import { Button, Modal, Form, Input } from "antd";
import type { FormProps } from "antd";
import { getSports, addSport } from "../../api/subscriptions";
import type { Sport } from "../../types/sports";
import SportsTable from "../../components/SportsTable";
// import SportsTable from "../../components/SportsTable";

function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 1178) {
      setIsMobile(true);
    }
  });
  const fetchSports = async () => {
    try {
      setIsLoading(true);
      const data = await getSports();
      setSports(data);
    } catch (e) {
      alert("Ошибка при загрузке видов спорта");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const showAddModal = () => setOpenAddModal(true);
  const closeAddModal = () => {
    form.resetFields();
    setOpenAddModal(false);
  };

  const handleAddSport: FormProps["onFinish"] = async (values) => {
    try {
      await addSport(values);
      console.log(values);
      await fetchSports();
      closeAddModal();
    } catch {
      alert("Ошибка при добавлении вида спорта");
    }
  };

  return (
    <>
      <div className="actions-for-table" style={{ marginBottom: 16 }}>
        <Button size={!isMobile ? "large" : "small"} onClick={showAddModal}>
          Добавить вид спорта
        </Button>
      </div>

      <SportsTable
        sports={sports}
        isLoading={isLoading}
        fetchSports={fetchSports}
      />

      <Modal
        title="Добавить вид спорта"
        open={openAddModal}
        onCancel={closeAddModal}
        footer={[
          <Button key="back" onClick={closeAddModal}>
            Отмена
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="form-add-sport"
          >
            Добавить
          </Button>,
        ]}
      >
        <Form
          id="form-add-sport"
          form={form}
          layout="vertical"
          onFinish={handleAddSport}
          autoComplete="off"
        >
          <Form.Item
            label="Название вида спорта"
            name="name"
            rules={[
              { required: true, message: "Введите название вида спорта" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Цена за день (₽)"
            name="price"
            rules={[
              { required: true, message: "Введите цену за день" },
              {
                pattern: /^\d+$/,
                message: "Цена должна быть числом",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default SportsPage;
