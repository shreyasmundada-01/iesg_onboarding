/**
 * components/Navbar.jsx
 * ------------------------
 * Top header bar: sidebar collapse toggle, page title + breadcrumb,
 * a search box (UI only — no backend search endpoint exists), a
 * notifications bell, and a user avatar dropdown with logout.
 */

import { Layout, Avatar, Dropdown, Typography, Breadcrumb, Space, Input, Badge, Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  SearchOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const { Header } = Layout;
const { Text, Title } = Typography;

const pageMeta = {
  dashboard: { title: "Dashboard", label: "Dashboard" },
  employees: { title: "Employees", label: "Employees" },
  addresses: { title: "Addresses", label: "Addresses" },
};

export default function Navbar({ collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentKey = pathSegments[0] || "dashboard";
  const currentMeta = pageMeta[currentKey] || { title: "Employee Portal", label: currentKey };

  const breadcrumbItems = [
    { title: "Home" },
    ...pathSegments.map((segment) => ({
      title: pageMeta[segment]?.label || segment,
    })),
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
      navigate("/login");
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: user?.username || "Account",
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        padding: "0 20px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--eport-border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        gap: 16,
        height: 64,
      }}
    >
      <Space size={16} align="center" style={{ minWidth: 0 }}>
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              border: "1px solid var(--eport-border)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 15,
              color: "var(--eport-text-secondary)",
              flexShrink: 0,
              transition: "background 160ms, color 160ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--eport-primary-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Tooltip>

        <div style={{ minWidth: 0, display: window.innerWidth < 480 ? "none" : "block" }}>
          <Title level={5} style={{ margin: 0, lineHeight: 1.2 }}>
            {currentMeta.title}
          </Title>
          <Breadcrumb
            items={breadcrumbItems}
            style={{ fontSize: 12, color: "var(--eport-text-tertiary)" }}
          />
        </div>
      </Space>

      <Space size={14} align="center">
        <Input
          placeholder="Search…"
          prefix={<SearchOutlined style={{ color: "var(--eport-text-tertiary)" }} />}
          style={{
            width: 220,
            background: "var(--eport-bg)",
            borderColor: "var(--eport-border)",
          }}
          className="eport-navbar-search"
        />

        <Tooltip title="Notifications">
          <Badge dot offset={[-2, 2]} color="#5b5fef">
            <button
              aria-label="Notifications"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: "1px solid var(--eport-border)",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 15,
                color: "var(--eport-text-secondary)",
              }}
            >
              <BellOutlined />
            </button>
          </Badge>
        </Tooltip>

        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]}>
          <Space
            style={{
              cursor: "pointer",
              padding: "4px 10px 4px 4px",
              borderRadius: 10,
              border: "1px solid var(--eport-border)",
              background: "#fff",
            }}
          >
            <Avatar
              size={28}
              icon={<UserOutlined />}
              style={{ background: "linear-gradient(135deg, #6d70f4, #4448cc)" }}
            />
            <Text strong style={{ fontSize: 13.5 }}>
              {user?.username}
            </Text>
            <DownOutlined style={{ fontSize: 9, color: "var(--eport-text-tertiary)" }} />
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
