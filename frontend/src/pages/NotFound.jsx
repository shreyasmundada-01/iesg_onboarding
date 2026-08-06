/**
 * pages/NotFound.jsx
 * ---------------------
 * Catch-all 404 page for unmatched routes.
 */

import { Button, Typography } from "antd";
import { ArrowLeftOutlined, CompassOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const { Title, Text } = Typography;

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--eport-bg)",
        padding: 16,
      }}
    >
      <div className="eport-card" style={{ padding: "48px 40px", textAlign: "center", maxWidth: 380 }}>
        <div
          className="eport-icon-tile"
          style={{
            width: 56,
            height: 56,
            fontSize: 24,
            margin: "0 auto 20px",
            background: "var(--eport-primary-soft)",
            color: "var(--eport-primary)",
          }}
        >
          <CompassOutlined />
        </div>
        <Title level={2} style={{ marginBottom: 4 }}>
          404
        </Title>
        <Title level={5} style={{ marginTop: 0, fontWeight: 500 }}>
          Page not found
        </Title>
        <Text type="secondary">
          The page you're looking for doesn't exist or may have been moved.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          >
            Back to {isAuthenticated ? "Dashboard" : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
