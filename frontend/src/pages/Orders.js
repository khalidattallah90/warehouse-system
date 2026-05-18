import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const statusConfig = {
  pending: { label: "معلّق", color: "#f59e0b", bg: "#fffbeb" },
  processing: { label: "قيد التجهيز", color: "#3b82f6", bg: "#eff6ff" },
  shipped: { label: "تم الشحن", color: "#8b5cf6", bg: "#f5f3ff" },
  delivered: { label: "تم التسليم", color: "#1D9E75", bg: "#e8f5f0" },
  cancelled: { label: "ملغي", color: "#ef4444", bg: "#fef2f2" },
};

const statusSteps = ["pending", "processing", "shipped", "delivered"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openDetails = async (order) => {
    setSelected(order);
    setShowDetails(true);
    try {
      const res = await api.get(`/orders/${order.id}`);
      setOrderItems(res.data.data.items || []);
    } catch (err) {
      setOrderItems([]);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
      if (selected?.id === id) {
        setSelected((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      alert("خطأ في تحديث الحالة");
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "الكل" || o.status === filterStatus;
    const matchSearch =
      !search ||
      o.order_number.includes(search) ||
      o.customer_name?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <Layout title="إدارة الطلبات">
      {/* أدوات الفلترة */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 ابحث برقم الطلب أو اسم العميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filters}>
          {["الكل", ...Object.keys(statusConfig)].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                ...styles.filterBtn,
                background:
                  filterStatus === s
                    ? statusConfig[s]?.bg || "#1D9E75"
                    : "#fff",
                color:
                  filterStatus === s
                    ? statusConfig[s]?.color || "#fff"
                    : "#555",
                border:
                  filterStatus === s
                    ? `1.5px solid ${statusConfig[s]?.color || "#1D9E75"}`
                    : "1.5px solid #e0e0e0",
              }}
            >
              {s === "الكل" ? "الكل" : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={styles.quickStats}>
        {Object.entries(statusConfig).map(([key, val]) => (
          <div
            key={key}
            style={{ ...styles.quickCard, borderTop: `3px solid ${val.color}` }}
          >
            <div
              style={{ fontSize: "22px", fontWeight: 700, color: val.color }}
            >
              {orders.filter((o) => o.status === key).length}
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
              {val.label}
            </div>
          </div>
        ))}
      </div>

      {/* الجدول */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.center}>جاري التحميل...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>رقم الطلب</th>
                <th style={styles.th}>العميل</th>
                <th style={styles.th}>الهاتف</th>
                <th style={styles.th}>المبلغ</th>
                <th style={styles.th}>الدفع</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>التاريخ</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const s = statusConfig[order.status];
                return (
                  <tr key={order.id} style={styles.tr}>
                    <td
                      style={{
                        ...styles.td,
                        color: "#1D9E75",
                        fontWeight: 600,
                      }}
                    >
                      {order.order_number}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      {order.customer_name}
                    </td>
                    <td style={{ ...styles.td, color: "#888" }}>
                      {order.customer_phone}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {Number(order.final_amount).toLocaleString()} ج.س
                    </td>
                    <td style={styles.td}>{order.payment_method}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          background: s?.bg,
                          color: s?.color,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {s?.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: "#888" }}>
                      {new Date(order.created_at).toLocaleDateString("ar-SA")}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => openDetails(order)}
                        style={styles.detailBtn}
                      >
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={styles.center}>لا توجد طلبات</div>
        )}
      </div>

      {/* نافذة التفاصيل */}
      {showDetails && selected && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* رأس النافذة */}
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  تفاصيل الطلب — {selected.order_number}
                </h2>
                <p
                  style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}
                >
                  {new Date(selected.created_at).toLocaleDateString("ar-SA")}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                maxHeight: "70vh",
              }}
            >
              {/* تتبع الحالة */}
              <div style={styles.tracker}>
                {statusSteps.map((step, i) => {
                  const stepIndex = statusSteps.indexOf(selected.status);
                  const isDone = i <= stepIndex;
                  const isCurrent = i === stepIndex;
                  const s = statusConfig[step];
                  return (
                    <div key={step} style={styles.trackerStep}>
                      <div
                        style={{
                          ...styles.trackerDot,
                          background: isDone ? s.color : "#e5e7eb",
                          boxShadow: isCurrent
                            ? `0 0 0 4px ${s.color}30`
                            : "none",
                          transform: isCurrent ? "scale(1.2)" : "scale(1)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: isDone ? s.color : "#aaa",
                          fontWeight: isCurrent ? 700 : 400,
                          marginTop: "6px",
                          textAlign: "center",
                        }}
                      >
                        {s.label}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div
                          style={{
                            ...styles.trackerLine,
                            background: i < stepIndex ? "#1D9E75" : "#e5e7eb",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* بيانات العميل */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>بيانات العميل</h3>
                <div style={styles.infoGrid}>
                  <InfoRow label="الاسم" value={selected.customer_name} />
                  <InfoRow label="الهاتف" value={selected.customer_phone} />
                  <InfoRow label="العنوان" value={selected.customer_address} />
                  <InfoRow label="الدفع" value={selected.payment_method} />
                </div>
              </div>

              {/* الأصناف */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>الأصناف المطلوبة</h3>
                {orderItems.length > 0 ? (
                  <table style={{ ...styles.table, marginTop: "8px" }}>
                    <thead>
                      <tr style={styles.thead}>
                        <th style={styles.th}>الصنف</th>
                        <th style={styles.th}>الكمية</th>
                        <th style={styles.th}>سعر الوحدة</th>
                        <th style={styles.th}>الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id} style={styles.tr}>
                          <td style={styles.td}>{item.item_name}</td>
                          <td style={styles.td}>{item.quantity}</td>
                          <td style={styles.td}>
                            {Number(item.unit_price).toLocaleString()} ج.س
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 600,
                              color: "#1D9E75",
                            }}
                          >
                            {Number(item.total_price).toLocaleString()} ج.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "#aaa", fontSize: "13px" }}>
                    لا توجد تفاصيل
                  </p>
                )}
              </div>

              {/* ملخص المبالغ */}
              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={{ color: "#888" }}>المجموع</span>
                  <span>
                    {Number(selected.total_amount).toLocaleString()} ج.س
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={{ color: "#888" }}>
                    ضريبة القيمة المضافة (10%)
                  </span>
                  <span>
                    {Number(selected.tax_amount).toLocaleString()} ج.س
                  </span>
                </div>
                <div
                  style={{
                    ...styles.summaryRow,
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "#1D9E75",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "8px",
                  }}
                >
                  <span>الإجمالي النهائي</span>
                  <span>
                    {Number(selected.final_amount).toLocaleString()} ج.س
                  </span>
                </div>
              </div>

              {/* تحديث الحالة */}
              {selected.status !== "delivered" &&
                selected.status !== "cancelled" && (
                  <div style={styles.statusActions}>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        marginBottom: "10px",
                        fontWeight: 500,
                      }}
                    >
                      تحديث حالة الطلب:
                    </p>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(selected.id, key)}
                          disabled={selected.status === key}
                          style={{
                            padding: "7px 14px",
                            background:
                              selected.status === key ? val.bg : "#fff",
                            color: val.color,
                            border: `1.5px solid ${val.color}`,
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor:
                              selected.status === key ? "default" : "pointer",
                            opacity: selected.status === key ? 1 : 0.8,
                          }}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        fontSize: "13px",
        marginBottom: "6px",
      }}
    >
      <span style={{ color: "#888", minWidth: "70px" }}>{label}:</span>
      <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

const styles = {
  toolbar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
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
  filters: { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterBtn: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all .15s",
  },
  quickStats: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: "12px",
    marginBottom: "1rem",
  },
  quickCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "12px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
  detailBtn: {
    padding: "5px 12px",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
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
    maxWidth: "620px",
    direction: "rtl",
    overflow: "hidden",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
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
  tracker: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: "1.5rem",
    position: "relative",
  },
  trackerStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  trackerDot: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    transition: "all .3s",
    zIndex: 1,
  },
  trackerLine: {
    position: "absolute",
    top: "10px",
    right: "60%",
    width: "80%",
    height: "2px",
    zIndex: 0,
  },
  section: { marginBottom: "1.25rem" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "10px",
    paddingBottom: "6px",
    borderBottom: "1px solid #f3f4f6",
  },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" },
  summary: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "1rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "6px",
  },
  statusActions: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "12px 16px",
  },
};
