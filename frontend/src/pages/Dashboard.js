import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const statusLabels = {
  pending: { label: "معلّق", color: "#f59e0b", bg: "#fffbeb" },
  processing: { label: "قيد التجهيز", color: "#3b82f6", bg: "#eff6ff" },
  shipped: { label: "تم الشحن", color: "#8b5cf6", bg: "#f5f3ff" },
  delivered: { label: "تم التسليم", color: "#1D9E75", bg: "#e8f5f0" },
  cancelled: { label: "ملغي", color: "#ef4444", bg: "#fef2f2" },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, ordersRes, suppliersRes] = await Promise.all([
          api.get("/items"),
          api.get("/orders"),
          api.get("/suppliers"),
        ]);

        const items = itemsRes.data.data;
        const allOrders = ordersRes.data.data;
        const suppliers = suppliersRes.data.data;

        const lowStock = items.filter(
          (i) => i.quantity <= i.min_quantity,
        ).length;

        const activeOrders = allOrders.filter(
          (o) => o.status !== "delivered" && o.status !== "cancelled",
        ).length;

        setStats({
          totalItems: items.length,
          totalOrders: allOrders.length,
          activeOrders,
          lowStock,
          totalSuppliers: suppliers.length,
        });

        setOrders(allOrders.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <Layout title="لوحة التحكم">
        <div style={styles.loading}>جاري تحميل البيانات...</div>
      </Layout>
    );

  return (
    <Layout title="لوحة التحكم">
      {/* البطاقات الإحصائية */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="📦"
          label="إجمالي الأصناف"
          value={stats?.totalItems}
          color="#1D9E75"
          bg="#e8f5f0"
        />
        <StatCard
          icon="📋"
          label="إجمالي الطلبات"
          value={stats?.totalOrders}
          color="#3b82f6"
          bg="#eff6ff"
        />
        <StatCard
          icon="🔄"
          label="الطلبات النشطة"
          value={stats?.activeOrders}
          color="#8b5cf6"
          bg="#f5f3ff"
        />
        <StatCard
          icon="⚠️"
          label="تنبيهات النقص"
          value={stats?.lowStock}
          color="#f59e0b"
          bg="#fffbeb"
        />
        <StatCard
          icon="🏢"
          label="الموردون"
          value={stats?.totalSuppliers}
          color="#ec4899"
          bg="#fdf2f8"
        />
      </div>

      {/* آخر الطلبات */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>آخر الطلبات</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>رقم الطلب</th>
              <th style={styles.th}>العميل</th>
              <th style={styles.th}>المبلغ</th>
              <th style={styles.th}>الدفع</th>
              <th style={styles.th}>الحالة</th>
              <th style={styles.th}>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const s = statusLabels[order.status];
              return (
                <tr key={order.id} style={styles.tr}>
                  <td
                    style={{ ...styles.td, color: "#1D9E75", fontWeight: 600 }}
                  >
                    {order.order_number}
                  </td>
                  <td style={styles.td}>{order.customer_name}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p style={styles.empty}>لا توجد طلبات حتى الآن</p>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>
      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={{ ...styles.statValue, color }}>{value ?? "..."}</div>
      </div>
    </div>
  );
}

const styles = {
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#888",
    fontSize: "15px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "3px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    borderBottom: "2px solid #e5e7eb",
  },
  th: {
    padding: "10px 12px",
    textAlign: "right",
    fontSize: "12px",
    color: "#888",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "12px",
    textAlign: "right",
    fontSize: "13px",
    color: "#1a1a1a",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    padding: "2rem",
    fontSize: "14px",
  },
};
