import { Link, Outlet } from "react-router-dom";

import React, { useEffect, useState } from "react";
import {
  BarsOutlined,
  ContactsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { useLocation } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(
    <Link to="/clients">Тренирующиеся</Link>,
    "clients",
    <UserOutlined />
  ),
  getItem(
    <Link to="/trainers">Тренеры</Link>,
    "trainers",
    <ContactsOutlined />
  ),
  getItem(<Link to="/workout">Виды спорта</Link>, "workout", <BarsOutlined />),
];

const RootPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const selectedKey = location.pathname.split("/")[1] || "clients";
  useEffect(() => {
    if (window.innerWidth < 1178) {
      setCollapsed(true);
    }
  });
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            defaultSelectedKeys={[selectedKey]}
            mode="inline"
            items={items}
          />
        </Sider>
        <Layout>
          <Header
            style={{ padding: 0, background: colorBgContainer, color: "" }}
          >
            <h1>ФитнесАдмин</h1>
          </Header>
          <Content style={{ margin: "0 16px", borderRadius: borderRadiusLG }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Создано студентами КМК
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default RootPage;
