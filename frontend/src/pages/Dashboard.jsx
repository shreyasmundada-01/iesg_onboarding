/**
 * pages/Dashboard.jsx
 * ----------------------
 * Landing page after login. Shows a welcome header, summary stat
 * cards (active employees / addresses), quick actions to the two
 * modules, and an activity panel with a proper empty state.
 *
 * Note: the API has no activity-log endpoint, so "recent activity"
 * is rendered as an honest empty state rather than fabricated data.
 */

import { useEffect, useState } from "react";
import { Row, Col, Typography, Alert, Empty } from "antd";
import {
  TeamOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Loader from "../components/Loader";

const { Title, Text } = Typography;

const STAT_CARDS = [
  {
    key: "employees",
    label: "Active Employees",
    icon: <TeamOutlined />,
    color: "#5b5fef",
    bg: "var(--eport-primary-soft)",
  },
  {
    key: "addresses",
    label: "Active Addresses",
    icon: <EnvironmentOutlined />,
    color: "#17a06b",
    bg: "var(--eport-success-soft)",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ employees: 0, addresses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [employeesRes, addressesRes] = await Promise.all([
          api.get("/employee", { params: { page: 1, page_size: 1 } }),
          api.get("/addresses", { params: { page: 1, page_size: 1 } }),
        ]);
        if (mounted) {
          setStats({
            employees: employeesRes.data.total,
            addresses: addressesRes.data.total,
          });
        }
      } catch (err) {
        if (mounted) {
          setError("Unable to load dashboard statistics.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const statValues = { employees: stats.employees, addresses: stats.addresses };

  return (
    <div>
      {/* Welcome header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Welcome back, {user?.username || "there"} 👋
          </Title>
          <Text type="secondary">Here's a quick overview of your organization.</Text>
        </div>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 20 }} />}

      {/* Stat cards */}
      <Row gutter={[16, 16]}>
        {loading
          ? [1, 2].map((k) => (
              <Col xs={24} sm={12} lg={8} key={k}>
                <Loader variant="skeleton" rows={1} />
              </Col>
            ))
          : STAT_CARDS.map((card) => (
              <Col xs={24} sm={12} lg={8} key={card.key}>
                <div
                  className="eport-card eport-hoverable"
                  style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}
                >
                  <div className="eport-icon-tile" style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {card.label}
                    </Text>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                      {statValues[card.key]}
                    </div>
                  </div>
                </div>
              </Col>
            ))}

        <Col xs={24} sm={12} lg={8}>
          <div
            className="eport-card eport-hoverable"
            style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}
          >
            <div
              className="eport-icon-tile"
              style={{ background: "#f1eaff", color: "#7c3aed" }}
            >
              <UserOutlined />
            </div>
            <div style={{ minWidth: 0 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Signed In As
              </Text>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.username || "-"}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick actions + activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <div className="eport-card" style={{ padding: 22, height: "100%" }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
              Quick Actions
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Jump straight into common tasks.
            </Text>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
              <QuickAction
                icon={<PlusOutlined />}
                title="Add a new employee"
                subtitle="Create an employee record"
                onClick={() => navigate("/employees")}
              />
              <QuickAction
                icon={<EnvironmentOutlined />}
                title="Add a new address"
                subtitle="Link an address to an employee"
                onClick={() => navigate("/addresses")}
              />
              <QuickAction
                icon={<TeamOutlined />}
                title="View all employees"
                subtitle="Browse, search and manage records"
                onClick={() => navigate("/employees")}
              />
            </div>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <div className="eport-card" style={{ padding: 22, height: "100%" }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
              Recent Activity
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Actions taken across the portal will show up here.
            </Text>

            <div style={{ padding: "36px 0" }}>
              <Empty
                image={<HistoryOutlined style={{ fontSize: 40, color: "var(--eport-text-tertiary)" }} />}
                description={
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    No recent activity yet
                  </Text>
                }
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid var(--eport-border)",
        background: "#fff",
        cursor: "pointer",
        transition: "border-color 160ms, background 160ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--eport-primary)";
        e.currentTarget.style.background = "var(--eport-primary-soft)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--eport-border)";
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: "var(--eport-primary-soft)",
          color: "var(--eport-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--eport-text-tertiary)" }}>{subtitle}</div>
      </div>
      <ArrowRightOutlined style={{ color: "var(--eport-text-tertiary)", fontSize: 12 }} />
    </button>
  );
}
