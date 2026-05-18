import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // حقول مستقلة
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAdd = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("الاسم الكامل مطلوب");
      return;
    }

    const body = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    console.log("بيانات العميل:", body);

    setSaving(true);
    setError("");
    try {
      await api.post("/customers", body);
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(
    (c) => !search || c.full_name.includes(search) || c.phone?.includes(search),
  );

  return (
    <Layout title="إدارة العملاء">
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 ابحث بالاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={openAdd} style={styles.addBtn}>
          + إضافة عميل
        </button>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.center}>جاري التحميل...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>اسم العميل</th>
                <th style={styles.th}>الهاتف</th>
                <th style={styles.th}>البريد</th>
                <th style={styles.th}>العنوان</th>
                <th style={styles.th}>إجمالي المشتريات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>
                    {c.full_name}
                  </td>
                  <td style={styles.td}>{c.phone || "—"}</td>
                  <td style={styles.td}>{c.email || "—"}</td>
                  <td style={styles.td}>{c.address || "—"}</td>
                  <td
                    style={{ ...styles.td, fontWeight: 600, color: "#1D9E75" }}
                  >
                    {Number(c.total_purchases).toLocaleString()} ج.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={styles.center}>لا يوجد عملاء</div>
        )}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>إضافة عميل جديد</h2>
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
                <label style={styles.label}>الاسم الكامل *</label>
                <input
                  style={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="اسم العميل كاملاً"
                />
              </div>

              <div>
                <label style={styles.label}>رقم الهاتف</label>
                <input
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                />
              </div>

              <div>
                <label style={styles.label}>البريد الإلكتروني</label>
                <input
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>العنوان</label>
                <input
                  style={styles.input}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="عنوان العميل"
                />
              </div>
            </div>

            {/* معاينة */}
            <div style={styles.preview}>
              <div style={styles.previewTitle}>📋 البيانات التي ستُرسل:</div>
              <div
                style={{ fontSize: "12px", color: "#15803d", lineHeight: 1.8 }}
              >
                الاسم: <strong>{fullName || "—"}</strong> | الهاتف:{" "}
                <strong>{phone || "—"}</strong> | البريد:{" "}
                <strong>{email || "—"}</strong>
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
                {saving ? "جاري الحفظ..." : "إضافة العميل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
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
