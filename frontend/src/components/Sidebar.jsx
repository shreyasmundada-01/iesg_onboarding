/**
 * components/Sidebar.jsx
 * ------------------------
 * Collapsible navigation sidebar for the dashboard layout.
 * Highlights the active menu item based on the current route.
 *
 * Visual design only — navigation keys, routes and the collapse
 * contract with DashboardLayout are unchanged.
 */

import { Layout, Menu, Avatar, Tooltip } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const { Sider } = Layout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/employees", icon: <TeamOutlined />, label: "Employees" },
  { key: "/addresses", icon: <EnvironmentOutlined />, label: "Addresses" },
];

export default function Sidebar({ collapsed, onCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Match the deepest menu key that prefixes the current path so nested
  // routes (e.g. /employees/1) still highlight the right parent item.
  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={80}
      width={240}
      trigger={null}
      style={{
        background: "var(--eport-sidebar-bg)",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid var(--eport-sidebar-border)",
        transition: "width 200ms var(--eport-ease)",
      }}
    >
      <div>
        {/* Brand mark */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "0 20px" : "0 20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: 9,
              background: "linear-gradient(135deg, #6d70f4 0%, #5b5fef 55%, #4448cc 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 15,
              boxShadow: "0 4px 10px rgba(91,95,239,0.45)",
            }}
          >
            E
          </div>
          {!collapsed && (
            <span
              style={{
                color: "#fff",
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: 15.5,
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              }}
            >
              Employee Portal
            </span>
          )}
        </div>

        <div style={{ padding: "8px 12px" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: "transparent",
              border: "none",
            }}
            className="eport-sidebar-menu"
          />
        </div>
      </div>

      {/* Profile + logout footer */}
      <div
        style={{
          borderTop: "1px solid var(--eport-sidebar-border)",
          padding: collapsed ? "14px 0" : "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <Avatar
            size={34}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #6d70f4, #4448cc)",
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 120,
                }}
              >
                {user?.username || "Account"}
              </div>
              <div style={{ color: "var(--eport-sidebar-text)", fontSize: 11.5 }}>
                {user?.role || "User"}
              </div>
            </div>
          )}
        </div>

        {!collapsed ? (
          <Tooltip title="Log out">
            <button
              onClick={handleLogout}
              aria-label="Log out"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: 8,
                color: "var(--eport-sidebar-text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 160ms, color 160ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(229,72,77,0.16)";
                e.currentTarget.style.color = "#ff8b8e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "var(--eport-sidebar-text)";
              }}
            >
              <LogoutOutlined />
            </button>
          </Tooltip>
        ) : (
          <Tooltip title="Log out" placement="right">
            <button
              onClick={handleLogout}
              aria-label="Log out"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--eport-sidebar-text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              <LogoutOutlined />
            </button>
          </Tooltip>
        )}
      </div>
    </Sider>
  );
}
