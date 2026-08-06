/**
 * pages/Addresses.jsx
 * ----------------------
 * Full Address module: searchable/paginated table, create and edit
 * modals (with an employee picker), and delete confirmation.
 */

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Space,
  Typography,
  Popconfirm,
  message,
  Tooltip,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import api from "../api/axios";
import { PageHeader, StatusBadge } from "./Employees";

const { Text } = Typography;
const { TextArea } = Input;

export default function Addresses() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/addresses", {
        params: {
          page,
          page_size: pageSize,
          search: search || undefined,
        },
      });
      setData(res.items);
      setTotal(res.total);
    } catch (err) {
      message.error(err.response?.data?.detail || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  // Loads employees for the "Employee" select field in the modal.
  // Pulls a generously-sized page since this is a picker, not a full table.
  const fetchEmployeesForPicker = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const { data: res } = await api.get("/employee", {
        params: { page: 1, page_size: 100 },
      });
      setEmployees(res.items);
    } catch (err) {
      message.error("Failed to load employees for selection");
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    fetchEmployeesForPicker();
  }, [fetchEmployeesForPicker]);

  const employeeNameById = (eid) => {
    const emp = employees.find((e) => e.eid === eid);
    return emp ? emp.name : `#${eid}`;
  };

  const openCreateModal = () => {
    setEditingAddress(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingAddress(record);
    form.setFieldsValue({
      eid: record.eid,
      addres: record.addres,
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

      setSaving(true);
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.aid}`, values);
        message.success("Address updated successfully");
      } else {
        await api.post("/addresses", values);
        message.success("Address created successfully");
      }
      setModalOpen(false);
      form.resetFields();
      fetchAddresses();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.response?.data?.detail || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (aid) => {
    try {
      await api.delete(`/addresses/${aid}`);
      message.success("Address deleted successfully");
      fetchAddresses();
    } catch (err) {
      message.error(err.response?.data?.detail || "Failed to delete address");
    }
  };

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "eid",
      key: "eid",
      width: 200,
      render: (eid) => <Text strong style={{ fontSize: 13.5 }}>{employeeNameById(eid)}</Text>,
    },
    {
      title: "Address",
      dataIndex: "addres",
      key: "addres",
      ellipsis: true,
      render: (addr) => <Text style={{ fontSize: 13.5 }}>{addr}</Text>,
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
              title="Delete address"
              description="Are you sure you want to delete this address?"
              onConfirm={() => handleDelete(record.aid)}
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
  ];

  return (
    <div>
      <PageHeader
        icon={<EnvironmentOutlined />}
        title="Addresses"
        subtitle="Manage employee addresses across your organization."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Address
          </Button>
        }
      />

      <div className="eport-card" style={{ padding: 18 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search address"
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
          rowKey="aid"
          columns={columns}
          dataSource={data}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `${t} address${t !== 1 ? "es" : ""}`,
          }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>No addresses yet</div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Add an address to link it to an employee.
                    </Text>
                  </>
                }
              >
                <Button icon={<PlusOutlined />} onClick={openCreateModal}>
                  Add Address
                </Button>
              </Empty>
            ),
          }}
        />
      </div>

      <Modal
        title={
          <Space>
            <EnvironmentOutlined />
            {editingAddress ? "Edit Address" : "Add Address"}
          </Space>
        }
        open={modalOpen}
        onCancel={handleModalCancel}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editingAddress ? "Update" : "Create"}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="eid"
            label="Employee"
            rules={[{ required: true, message: "Please select an employee" }]}
          >
            <Select
              placeholder="Select an employee"
              loading={employeesLoading}
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({ value: e.eid, label: e.name }))}
            />
          </Form.Item>

          <Form.Item
            name="addres"
            label="Address"
            rules={[
              { required: true, message: "Please enter the address" },
              { max: 500, message: "Address must be under 500 characters" },
            ]}
          >
            <TextArea rows={3} placeholder="Street, City, State, ZIP" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
