/**
 * pages/UserManagement.jsx
 * ---------------------------
 * Admin-only page: lists every registered user account (Name, Email,
 * Current Role, Status) and lets an admin promote a user to admin or
 * demote an admin to user. The backend (`/users` router, gated by
 * `require_admin`) is the real authorization boundary - this page is
 * only reachable in the UI via <AdminRoute />, and every action here
 * still round-trips through the protected API, which independently
 * re-checks the caller's role from the database on every call.
 */

import { useEffect, useState, useCallback } from "react";
import { Table, Tag, Button, Typography, Popconfirm, message, Space, Empty } from "antd";
import { IdcardOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { PageHeader, StatusBadge } from "./Employees";

const { Text } = Typography;

export default function UserManagement() {
  const { user: currentUser, refreshCurrentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningUid, setActioningUid] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/users");
      setData(res.items);
    } catch (err) {
      message.error(err.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const adminCount = data.filter((u) => u.role === "admin").length;

  const handleRoleChange = async (targetUser, newRole) => {
    setActioningUid(targetUser.uid);
    try {
      await api.patch(`/users/${targetUser.uid}/role`, { role: newRole });
      message.success(
        newRole === "admin"
          ? `${targetUser.username} promoted to Admin`
          : `${targetUser.username} demoted to User`
      );
      await fetchUsers();
      // If the admin changed their own role, refresh the auth context so
      // the sidebar/UI immediately reflects the new permissions.
      if (targetUser.uid === currentUser?.uid) {
        await refreshCurrentUser();
      }
    } catch (err) {
      message.error(err.response?.data?.detail || "Failed to update role");
    } finally {
      setActioningUid(null);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      render: (username, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{username}</div>
          <div style={{ fontSize: 12, color: "var(--eport-text-tertiary)" }}>ID #{record.uid}</div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <Text style={{ fontSize: 13.5 }}>{email}</Text>,
    },
    {
      title: "Current Role",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role) => (
        <Tag color={role === "admin" ? "purple" : "default"} style={{ textTransform: "capitalize" }}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive) => <StatusBadge active={isActive} />,
    },
    {
      title: "",
      key: "actions",
      width: 180,
      render: (_, record) => {
        const isSelf = record.uid === currentUser?.uid;
        const isLastAdmin = record.role === "admin" && adminCount <= 1;

        if (record.role === "user") {
          return (
            <Popconfirm
              title="Promote to Admin"
              description={`Give ${record.username} full admin access?`}
              onConfirm={() => handleRoleChange(record, "admin")}
              okText="Promote"
              cancelText="Cancel"
            >
              <Button
                size="small"
                icon={<UpOutlined />}
                loading={actioningUid === record.uid}
              >
                Promote to Admin
              </Button>
            </Popconfirm>
          );
        }

        return (
          <Space direction="vertical" size={2}>
            <Popconfirm
              title="Demote to User"
              description={
                isSelf
                  ? "You are about to remove your own admin access."
                  : `Remove admin access from ${record.username}?`
              }
              onConfirm={() => handleRoleChange(record, "user")}
              okText="Demote"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              disabled={isLastAdmin}
            >
              <Button
                size="small"
                danger
                icon={<DownOutlined />}
                loading={actioningUid === record.uid}
                disabled={isLastAdmin}
              >
                Demote to User
              </Button>
            </Popconfirm>
            {isLastAdmin && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Last remaining admin
              </Text>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<IdcardOutlined />}
        title="User Management"
        subtitle="Promote users to Admin or demote Admins to User. Admin-only."
      />

      <div className="eport-card" style={{ padding: 18 }}>
        <Table
          className="eport-table"
          rowKey="uid"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} user${t !== 1 ? "s" : ""}` }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No users found"
              />
            ),
          }}
        />
      </div>
    </div>
  );
}
