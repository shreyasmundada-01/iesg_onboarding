/**
 * pages/Register.jsx
 * ---------------------
 * Registration page. On success, redirects to /login so the user can
 * sign in with their new credentials.
 */

import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const { Title, Text } = Typography;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await register(values);
      message.success("Account created successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail || "Registration failed. Please try again.";
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
          <RocketOutlined style={{ fontSize: 28, marginBottom: 20, opacity: 0.85 }} />
          <Title level={2} style={{ color: "#fff", marginBottom: 12, fontSize: 32 }}>
            Set up your account in seconds.
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
            Get access to employee records, address management, and a dashboard
            built to keep HR data organized.
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
        <div style={{ width: "100%", maxWidth: 360 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Create your account
          </Title>
          <Text type="secondary">Register to access the Employee Portal.</Text>

          <Form layout="vertical" onFinish={onFinish} autoComplete="off" style={{ marginTop: 28 }}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please enter a username" },
                { min: 3, message: "Username must be at least 3 characters" },
                { pattern: /^\S+$/, message: "Username must not contain spaces" },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: "var(--eport-text-tertiary)" }} />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: "var(--eport-text-tertiary)" }} />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--eport-text-tertiary)" }} />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--eport-text-tertiary)" }} />}
                placeholder="Confirm password"
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
                Create account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 4 }}>
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
