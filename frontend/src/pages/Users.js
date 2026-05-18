import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const roleConfig = {
  admin: { label: "مدير النظام", color: "#8b5cf6", bg: "#f5f3ff" },
  warehouse_keeper: { label: "أمين المخزن", color: "#3b82f6", bg: "#eff6ff" },
  accountant: { label: "محاسب", color: "#f59e0b", bg: "#fffbeb" },
  customer: { label: "عميل", color: "#1D9E75", bg: "#e8f5f0" },
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function emptyForm() {
    return {
      full_name: "",
      username: "",
      password: "",
      phone: "",
      email: "",
      role: "warehouse_keeper",
    };
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (!form.full_name || !form.username || !form.password) {
      setError("الاسم واسم المستخدم وكلمة المرور مطلوبة");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setSaving(true);
    try {
      await api.post("/users", form);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const msg =
      newStatus === "inactive"
        ? `هل تريد تعطيل حساب ${user.full_name}؟`
        : `هل تريد تفعيل حساب ${user.full_name}؟`;
    if (!window.confirm(msg)) return;
    try {
      await api.put(`/users/${user.id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert("خطأ في تحديث الحالة");
    }
  };

  const filtered = users.filter(
    (u) =>
      !search || u.full_name.includes(search) || u.username.includes(search),
  );

  // إحصائيات
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    admins: users.filter((u) => u.role === "admin").length,
    customers: users.filter((u) => u.role === "customer").length,
  };

  return (
    <Layout title="إدارة المستخدمين">
      {/* الإحصائيات */}
      <div style={styles.statsGrid}>
        <StatCard
          label="إجمالي المستخدمين"
          value={stats.total}
          color="#1D9E75"
          icon="👥"
        />
        <StatCard
          label="نشطون"
          value={stats.active}
          color="#3b82f6"
          icon="✅"
        />
        <StatCard
          label="المديرون"
          value={stats.admins}
          color="#8b5cf6"
          icon="👑"
        />
        <StatCard
          label="العملاء"
          value={stats.customers}
          color="#f59e0b"
          icon="🛒"
        />
      </div>

      {/* أدوات */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 ابحث بالاسم أو اسم المستخدم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button
          onClick={() => {
            setForm(emptyForm());
            setError("");
            setShowModal(true);
          }}
          style={styles.addBtn}
        >
          + إضافة مستخدم
        </button>
      </div>

      {/* الجدول */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.center}>جاري التحميل...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>الاسم الكامل</th>
                <th style={styles.th}>اسم المستخدم</th>
                <th style={styles.th}>الدور</th>
                <th style={styles.th}>الهاتف</th>
                <th style={styles.th}>البريد</th>
                <th style={styles.th}>تاريخ الإنشاء</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const role = roleConfig[user.role];
                const active = user.status === "active";
                return (
                  <tr key={user.id} style={styles.tr}>
                    {/* الاسم مع أيقونة */}
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div
                          style={{
                            ...styles.avatar,
                            background: role?.bg,
                            color: role?.color,
                          }}
                        >
                          {user.full_name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>
                          {user.full_name}
                        </span>
                      </div>
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        fontFamily: "monospace",
                        color: "#555",
                      }}
                    >
                      {user.username}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          background: role?.bg,
                          color: role?.color,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {role?.label}
                      </span>
                    </td>

                    <td style={{ ...styles.td, color: "#888" }}>
                      {user.phone || "—"}
                    </td>

                    <td
                      style={{ ...styles.td, color: "#888", fontSize: "12px" }}
                    >
                      {user.email || "—"}
                    </td>

                    <td style={{ ...styles.td, color: "#888" }}>
                      {new Date(user.created_at).toLocaleDateString("ar-SA")}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          background: active ? "#e8f5f0" : "#f3f4f6",
                          color: active ? "#1D9E75" : "#888",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {active ? "✅ نشط" : "⏸️ معطّل"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => toggleStatus(user)}
                        style={{
                          padding: "5px 12px",
                          background: active ? "#fef2f2" : "#e8f5f0",
                          color: active ? "#ef4444" : "#1D9E75",
                          border: `1px solid ${active ? "#fecaca" : "#a7f3d0"}`,
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        {active ? "🔒 تعطيل" : "✅ تفعيل"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={styles.center}>لا يوجد مستخدمون</div>
        )}
      </div>

      {/* نافذة إضافة مستخدم */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>إضافة مستخدم جديد</h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid}>
              <Field label="الاسم الكامل *">
                <input
                  style={styles.input}
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  placeholder="الاسم الكامل"
                />
              </Field>

              <Field label="اسم المستخدم *">
                <input
                  style={styles.input}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="للدخول للنظام"
                />
              </Field>

              <Field label="كلمة المرور *">
                <input
                  style={styles.input}
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="6 أحرف على الأقل"
                />
              </Field>

              <Field label="الدور">
                <select
                  style={styles.input}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="warehouse_keeper">أمين المخزن</option>
                  <option value="accountant">محاسب</option>
                  <option value="admin">مدير</option>
                  <option value="customer">عميل</option>
                </select>
              </Field>

              <Field label="رقم الهاتف">
                <input
                  style={styles.input}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="اختياري"
                />
              </Field>

              <Field label="البريد الإلكتروني">
                <input
                  style={styles.input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="اختياري"
                />
              </Field>
            </div>

            {/* معلومة الدور */}
            <div style={styles.roleInfo}>
              <div style={styles.roleInfoTitle}>صلاحيات الدور المختار:</div>
              <div style={styles.roleInfoText}>
                {form.role === "admin" && "👑 وصول كامل لكل صفحات النظام"}
                {form.role === "warehouse_keeper" &&
                  "📦 يرى: لوحة التحكم، الأصناف، الطلبات"}
                {form.role === "accountant" &&
                  "💰 يرى: الطلبات، العملاء، التقارير"}
                {form.role === "customer" && "🛒 يرى: المتجر فقط"}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "جاري الحفظ..." : "إضافة المستخدم"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "24px" }}>{icon}</div>
      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          color: "#555",
          marginBottom: "5px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  statLabel: { fontSize: "12px", color: "#888", marginBottom: "2px" },
  statValue: { fontSize: "22px", fontWeight: 700 },
  toolbar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "1rem",
  },
  searchInput: {
    padding: "9px 14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    width: "260px",
    outline: "none",
    direction: "rtl",
  },
  addBtn: {
    padding: "9px 18px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" },
  th: {
    padding: "12px",
    textAlign: "right",
    fontSize: "12px",
    color: "#888",
    fontWeight: 600,
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: {
    padding: "12px",
    textAlign: "right",
    fontSize: "13px",
    color: "#1a1a1a",
  },
  userCell: { display: "flex", alignItems: "center", gap: "8px" },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
  },
  center: { textAlign: "center", padding: "3rem", color: "#888" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "520px",
    direction: "rtl",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
  },
  error: {
    margin: "1rem 1.5rem 0",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    padding: "1.5rem 1.5rem 1rem",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    direction: "rtl",
    background: "#fafafa",
  },
  roleInfo: {
    margin: "0 1.5rem 1rem",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  roleInfoTitle: {
    fontSize: "12px",
    color: "#166534",
    fontWeight: 600,
    marginBottom: "3px",
  },
  roleInfoText: { fontSize: "13px", color: "#15803d" },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "9px 20px",
    background: "#f3f4f6",
    color: "#555",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "9px 24px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
