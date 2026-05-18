import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // حقول الفورم مستقلة
  const [companyName, setCompanyName] = useState("");
  const [supplyType, setSupplyType] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setCompanyName("");
    setSupplyType("");
    setContactPerson("");
    setPhone("");
    setStatus("active");
    setError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditItem(s);
    setCompanyName(s.company_name || "");
    setSupplyType(s.supply_type || "");
    setContactPerson(s.contact_person || "");
    setPhone(s.phone || "");
    setStatus(s.status || "active");
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      setError("اسم الشركة مطلوب");
      return;
    }

    const body = {
      company_name: companyName.trim(),
      supply_type: supplyType.trim(),
      contact_person: contactPerson.trim(),
      phone: phone.trim(),
      status,
    };

    console.log("بيانات المورد:", body);

    setSaving(true);
    setError("");
    try {
      if (editItem) {
        await api.put(`/suppliers/${editItem.id}`, body);
      } else {
        await api.post("/suppliers", body);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert("خطأ في الحذف");
    }
  };

  return (
    <Layout title="إدارة الموردين">
      <div style={styles.toolbar}>
        <button onClick={openAdd} style={styles.addBtn}>
          + إضافة مورد
        </button>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.center}>جاري التحميل...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>الكود</th>
                <th style={styles.th}>اسم الشركة</th>
                <th style={styles.th}>نوع التوريد</th>
                <th style={styles.th}>المسؤول</th>
                <th style={styles.th}>الهاتف</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td
                    style={{
                      ...styles.td,
                      fontFamily: "monospace",
                      color: "#1D9E75",
                    }}
                  >
                    {s.supplier_code}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>
                    {s.company_name}
                  </td>
                  <td style={styles.td}>{s.supply_type || "—"}</td>
                  <td style={styles.td}>{s.contact_person || "—"}</td>
                  <td style={styles.td}>{s.phone || "—"}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        background:
                          s.status === "active" ? "#e8f5f0" : "#f3f4f6",
                        color: s.status === "active" ? "#1D9E75" : "#888",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {s.status === "active" ? "✅ نشط" : "⏸️ متوقف"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => openEdit(s)}
                        style={styles.editBtn}
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && suppliers.length === 0 && (
          <div style={styles.center}>لا يوجد موردون</div>
        )}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editItem ? "تعديل مورد" : "إضافة مورد جديد"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>اسم الشركة *</label>
                <input
                  style={styles.input}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: رأس الخيمة للسيراميك"
                />
              </div>

              <div>
                <label style={styles.label}>نوع التوريد</label>
                <input
                  style={styles.input}
                  value={supplyType}
                  onChange={(e) => setSupplyType(e.target.value)}
                  placeholder="مثال: سيراميك، رخام..."
                />
              </div>

              <div>
                <label style={styles.label}>المسؤول</label>
                <input
                  style={styles.input}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="اسم المسؤول"
                />
              </div>

              <div>
                <label style={styles.label}>الهاتف</label>
                <input
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                />
              </div>

              {editItem && (
                <div>
                  <label style={styles.label}>الحالة</label>
                  <select
                    style={styles.input}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">متوقف</option>
                  </select>
                </div>
              )}
            </div>

            {/* معاينة */}
            <div style={styles.preview}>
              <div style={styles.previewTitle}>📋 البيانات التي ستُرسل:</div>
              <div
                style={{ fontSize: "12px", color: "#15803d", lineHeight: 1.8 }}
              >
                اسم الشركة: <strong>{companyName || "—"}</strong> | النوع:{" "}
                <strong>{supplyType || "—"}</strong> | المسؤول:{" "}
                <strong>{contactPerson || "—"}</strong> | الهاتف:{" "}
                <strong>{phone || "—"}</strong>
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
                {saving
                  ? "جاري الحفظ..."
                  : editItem
                    ? "حفظ التعديلات"
                    : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  toolbar: { marginBottom: "1rem" },
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
  actions: { display: "flex", gap: "6px" },
  editBtn: {
    padding: "5px 10px",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 10px",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
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
    maxWidth: "500px",
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
    padding: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#555",
    marginBottom: "5px",
    fontWeight: 500,
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
  preview: {
    margin: "0 1.5rem 1rem",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  previewTitle: {
    fontSize: "12px",
    color: "#166534",
    fontWeight: 600,
    marginBottom: "4px",
  },
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
