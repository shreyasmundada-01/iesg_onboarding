/**
 * pages/Employees.jsx
 * ----------------------
 * Full Employee module: searchable/sortable/paginated table, create
 * and edit modals with form validation, and delete confirmation.
 */

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  DatePicker,
  Space,
  Typography,
  Popconfirm,
  message,
  Tooltip,
  Avatar,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const { Title, Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const AVATAR_PALETTE = ["#5b5fef", "#17a06b", "#d98a1e", "#e5484d", "#7c3aed", "#0891b2"];
function avatarColor(seed = "") {
  const code = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

export default function Employees() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("eid");
  const [sortOrder, setSortOrder] = useState("asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/employee", {
        params: {
          page,
          page_size: pageSize,
          search: search || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });
      setData(res.items);
      setTotal(res.total);
    } catch (err) {
      message.error(err.response?.data?.detail || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingEmployee(record);
    form.setFieldsValue({
      name: record.name,
      dob: dayjs(record.dob),
    });
    setModalOpen(true);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        dob: values.dob.format(DATE_FORMAT),
      };

      setSaving(true);
      if (editingEmployee) {
        await api.put(`/employee/${editingEmployee.eid}`, payload);
        message.success("Employee updated successfully");
      } else {
        await api.post("/employee", payload);
        message.success("Employee created successfully");
      }
      setModalOpen(false);
      form.resetFields();
      fetchEmployees();
    } catch (err) {
      if (err?.errorFields) return; // form validation error, already shown inline
      message.error(err.response?.data?.detail || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eid) => {
    try {
      await api.delete(`/employee/${eid}`);
      message.success("Employee deleted successfully");
      fetchEmployees();
    } catch (err) {
      message.error(err.response?.data?.detail || "Failed to delete employee");
    }
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    if (sorter?.field) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === "descend" ? "desc" : "asc");
    }
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (name, record) => (
        <Space size={10}>
          <Avatar style={{ background: avatarColor(name), flexShrink: 0 }} size={32}>
            {initials(name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--eport-text-tertiary)" }}>ID #{record.eid}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      key: "dob",
      sorter: true,
      render: (dob) => dayjs(dob).format(DATE_FORMAT),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive) => <StatusBadge active={isActive} />,
    },
    ...(isAdmin
      ? [
          {
            title: "",
            key: "actions",
            width: 110,
            render: (_, record) => (
              <Space size={4}>
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(record)}
                    style={{ color: "var(--eport-text-secondary)" }}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Delete employee"
                    description={`Are you sure you want to delete "${record.name}"?`}
                    onConfirm={() => handleDelete(record.eid)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                  >
                    <Button type="text" icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </Tooltip>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        icon={<TeamOutlined />}
        title="Employees"
        subtitle="Manage your organization's employee records."
        action={
          isAdmin ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Add Employee
            </Button>
          ) : null
        }
      />

      <div className="eport-card" style={{ padding: 18 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by name"
            prefix={<SearchOutlined style={{ color: "var(--eport-text-tertiary)" }} />}
            allowClear
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 260 }}
          />
        </div>

        <Table
          className="eport-table"
          rowKey="eid"
          columns={columns}
          dataSource={data}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `${t} employee${t !== 1 ? "s" : ""}`,
          }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>No employees yet</div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {isAdmin
                        ? "Add your first employee to get started."
                        : "No employee records have been added yet."}
                    </Text>
                  </>
                }
              >
                {isAdmin && (
                  <Button icon={<UserAddOutlined />} onClick={openCreateModal}>
                    Add Employee
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </div>

      <Modal
        title={
          <Space>
            {editingEmployee ? <EditOutlined /> : <UserAddOutlined />}
            {editingEmployee ? "Edit Employee" : "Add Employee"}
          </Space>
        }
        open={modalOpen}
        onCancel={handleModalCancel}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editingEmployee ? "Update" : "Create"}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter the employee's name" },
              { max: 150, message: "Name must be under 150 characters" },
            ]}
          >
            <Input placeholder="e.g. Jane Doe" />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Date of Birth"
            rules={[{ required: true, message: "Please select a date of birth" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={DATE_FORMAT}
              disabledDate={(current) => current && current > dayjs().endOf("day")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function StatusBadge({ active }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px 3px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: active ? "var(--eport-success-soft)" : "var(--eport-danger-soft)",
        color: active ? "var(--eport-success)" : "var(--eport-danger)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: active ? "var(--eport-success)" : "var(--eport-danger)",
        }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          className="eport-icon-tile"
          style={{ background: "var(--eport-primary-soft)", color: "var(--eport-primary)" }}
        >
          {icon}
        </div>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {subtitle}
          </Text>
        </div>
      </div>
      {action}
    </div>
  );
}
