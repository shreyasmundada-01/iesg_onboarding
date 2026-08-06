/**
 * pages/Login.jsx
 * -----------------
 * Login page. On success, redirects to the originally requested route
 * (preserved by ProtectedRoute) or /dashboard by default.
 */

import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, ArrowRightOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const { Title, Text } = Typography;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      message.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail || "Invalid username or password";
      message.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Brand panel */}
      <div
        className="eport-auth-bg eport-auth-branding"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #8083f7, #5b5fef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 800,
            }}
          >
            E
          </div>
          <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: 17 }}>
            Employee Portal
          </span>
        </div>

        <div style={{ maxWidth: 420 }}>
          <SafetyCertificateOutlined style={{ fontSize: 28, marginBottom: 20, opacity: 0.85 }} />
          <Title level={2} style={{ color: "#fff", marginBottom: 12, fontSize: 32 }}>
            Manage your workforce, all in one place.
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
            Track employees and addresses with a secure, role-aware dashboard built for
            fast day-to-day HR operations.
          </Text>
        </div>

        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>
          © {new Date().getFullYear()} Employee Portal. All rights reserved.
        </Text>
      </div>

      {/* Form panel */}
      <div
        style={{
          flex: "0 0 460px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: 24,
        }}
        className="eport-auth-form-panel"
      >
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Sign in
          </Title>
          <Text type="secondary">Welcome back — enter your details below.</Text>

          <Form layout="vertical" onFinish={onFinish} autoComplete="off" style={{ marginTop: 28 }}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Please enter your username" }]}
            >
              <Input prefix={<UserOutlined style={{ color: "var(--eport-text-tertiary)" }} />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--eport-text-tertiary)" }} />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={submitting}
                icon={!submitting && <ArrowRightOutlined />}
                iconPosition="end"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 4 }}>
            <Text type="secondary">Don't have an account? </Text>
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
