/**
 * layouts/DashboardLayout.jsx
 * ------------------------------
 * Main authenticated app shell: collapsible Sidebar + top Navbar +
 * content area rendered via React Router's <Outlet />. Responsive:
 * the Sider auto-collapses below the "lg" breakpoint (handled by antd),
 * and we also collapse it on mount for narrow viewports so mobile
 * users land on an uncluttered screen.
 */

import { useEffect, useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const { Content } = Layout;

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  // Start collapsed on small screens (tablet/mobile) for a cleaner first view.
  useEffect(() => {
    if (window.innerWidth < 992) {
      setCollapsed(true);
    }
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--eport-bg)" }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout style={{ background: "var(--eport-bg)" }}>
        <Navbar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <Content
          className="eport-content eport-page"
          style={{
            margin: "20px",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
