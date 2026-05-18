import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

// ألوان الرسوم البيانية
const COLORS = [
  "#1D9E75",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
];

const statusConfig = {
  pending: { label: "معلّق", color: "#f59e0b" },
  processing: { label: "قيد التجهيز", color: "#3b82f6" },
  shipped: { label: "تم الشحن", color: "#8b5cf6" },
  delivered: { label: "تم التسليم", color: "#1D9E75" },
  cancelled: { label: "ملغي", color: "#ef4444" },
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [itemsRes, ordersRes, suppliersRes, customersRes] =
          await Promise.all([
            api.get("/items"),
            api.get("/orders"),
            api.get("/suppliers"),
            api.get("/customers"),
          ]);

        const allItems = itemsRes.data.data;
        const allOrders = ordersRes.data.data;
        const allSuppliers = suppliersRes.data.data;
        const allCustomers = customersRes.data.data;

        // إجمالي المبيعات
        const totalSales = allOrders
          .filter((o) => o.status !== "cancelled")
          .reduce((s, o) => s + Number(o.final_amount), 0);

        // أصناف ناقصة
        const lowStock = allItems.filter((i) => i.quantity <= i.min_quantity);

        // بيانات الطلبات حسب الحالة للـ Pie Chart
        const statusData = Object.entries(statusConfig)
          .map(([key, val]) => ({
            name: val.label,
            value: allOrders.filter((o) => o.status === key).length,
            color: val.color,
          }))
          .filter((d) => d.value > 0);

        // بيانات الأصناف حسب الفئة للـ Bar Chart
        const categories = ["بورسلين", "رخام", "حوائط", "أرضيات", "أخرى"];
        const categoryData = categories.map((cat) => ({
          name: cat,
          عدد: allItems.filter((i) => i.category === cat).length,
          كمية: allItems
            .filter((i) => i.category === cat)
            .reduce((s, i) => s + i.quantity, 0),
        }));

        // بيانات المبيعات الشهرية للـ Line Chart
        const monthlyData = getLast6Months(allOrders);

        // أعلى 5 أصناف بالكمية
        const topItems = [...allItems]
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
          .map((i) => ({ name: i.item_name.slice(0, 15), كمية: i.quantity }));

        setData({
          totalItems: allItems.length,
          totalOrders: allOrders.length,
          totalSales,
          totalSuppliers: allSuppliers.length,
          totalCustomers: allCustomers.length,
          delivered: allOrders.filter((o) => o.status === "delivered").length,
          lowStock,
          statusData,
          categoryData,
          monthlyData,
          topItems,
        });

        setOrders(allOrders);
        setItems(allItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading)
    return (
      <Layout title="التقارير">
        <div style={styles.center}>جاري تحميل البيانات...</div>
      </Layout>
    );

  return (
    <Layout title="التقارير">
      {/* بطاقات الإحصائيات */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="💰"
          label="إجمالي المبيعات"
          value={`${Number(data.totalSales).toLocaleString()} ج.س`}
          color="#1D9E75"
          bg="#e8f5f0"
        />
        <StatCard
          icon="📋"
          label="إجمالي الطلبات"
          value={data.totalOrders}
          color="#3b82f6"
          bg="#eff6ff"
        />
        <StatCard
          icon="✅"
          label="طلبات مكتملة"
          value={data.delivered}
          color="#8b5cf6"
          bg="#f5f3ff"
        />
        <StatCard
          icon="📦"
          label="إجمالي الأصناف"
          value={data.totalItems}
          color="#f59e0b"
          bg="#fffbeb"
        />
        <StatCard
          icon="🏢"
          label="الموردون"
          value={data.totalSuppliers}
          color="#ec4899"
          bg="#fdf2f8"
        />
        <StatCard
          icon="👥"
          label="العملاء"
          value={data.totalCustomers}
          color="#06b6d4"
          bg="#ecfeff"
        />
      </div>

      {/* تبويبات */}
      <div style={styles.tabs}>
        {[
          { key: "overview", label: "📊 نظرة عامة" },
          { key: "orders", label: "📋 الطلبات" },
          { key: "items", label: "📦 الأصناف" },
          { key: "table", label: "📄 سجل الطلبات" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              background: activeTab === tab.key ? "#1D9E75" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#555",
              border:
                activeTab === tab.key
                  ? "1.5px solid #1D9E75"
                  : "1.5px solid #e0e0e0",
            }}
          >
            {tab.label}
          </button>
        ))}
        <button onClick={() => window.print()} style={styles.printBtn}>
          🖨️ طباعة
        </button>
      </div>

      {/* نظرة عامة */}
      {activeTab === "overview" && (
        <div style={styles.chartsGrid}>
          {/* مبيعات آخر 6 أشهر */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📈 المبيعات — آخر 6 أشهر</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [
                    `${Number(val).toLocaleString()} ج.س`,
                    "المبيعات",
                  ]}
                  contentStyle={{ direction: "rtl", borderRadius: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="مبيعات"
                  stroke="#1D9E75"
                  strokeWidth={2.5}
                  dot={{ fill: "#1D9E75", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* حالة الطلبات Pie */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🥧 حالة الطلبات</h3>
            {data.statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [val, name]}
                      contentStyle={{ direction: "rtl", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* مفتاح الألوان */}
                <div style={styles.legend}>
                  {data.statusData.map((d, i) => (
                    <div key={i} style={styles.legendItem}>
                      <div
                        style={{ ...styles.legendDot, background: d.color }}
                      />
                      <span style={styles.legendLabel}>{d.name}</span>
                      <span style={{ fontWeight: 600, color: d.color }}>
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.center}>لا توجد طلبات بعد</div>
            )}
          </div>
        </div>
      )}

      {/* رسوم الطلبات */}
      {activeTab === "orders" && (
        <div style={styles.chartsGrid}>
          {/* عدد الطلبات شهرياً */}
          <div style={{ ...styles.chartCard, gridColumn: "1 / -1" }}>
            <h3 style={styles.chartTitle}>📊 عدد الطلبات — آخر 6 أشهر</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [val, "عدد الطلبات"]}
                  contentStyle={{ direction: "rtl", borderRadius: "8px" }}
                />
                <Bar dataKey="طلبات" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* إحصائيات الطلبات */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📋 ملخص الطلبات</h3>
            {Object.entries(statusConfig).map(([key, val]) => {
              const count = orders.filter((o) => o.status === key).length;
              const pct = orders.length
                ? Math.round((count / orders.length) * 100)
                : 0;
              return (
                <div key={key} style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: val.color, fontWeight: 500 }}>
                      {val.label}
                    </span>
                    <span style={{ color: "#888" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#f3f4f6",
                      borderRadius: "20px",
                      height: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: val.color,
                        borderRadius: "20px",
                        transition: "width .5s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* أعلى العملاء */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>👥 أعلى العملاء مشترياً</h3>
            {getTopCustomers(orders).map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f3f4f6",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: COLORS[i % COLORS.length],
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: "#1D9E75" }}>
                  {Number(c.total).toLocaleString()} ج.س
                </span>
              </div>
            ))}
            {getTopCustomers(orders).length === 0 && (
              <div style={styles.center}>لا توجد بيانات</div>
            )}
          </div>
        </div>
      )}

      {/* رسوم الأصناف */}
      {activeTab === "items" && (
        <div style={styles.chartsGrid}>
          {/* الأصناف حسب الفئة */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📦 الأصناف حسب الفئة</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={data.categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ direction: "rtl", borderRadius: "8px" }}
                />
                <Legend />
                <Bar dataKey="عدد" fill="#1D9E75" radius={[6, 6, 0, 0]} />
                <Bar dataKey="كمية" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* أعلى 5 أصناف */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🏆 أعلى الأصناف كمية</h3>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={data.topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{ direction: "rtl", borderRadius: "8px" }}
                />
                <Bar dataKey="كمية" radius={[0, 6, 6, 0]}>
                  {data.topItems.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* تنبيهات النقص */}
          {data.lowStock.length > 0 && (
            <div style={{ ...styles.chartCard, gridColumn: "1 / -1" }}>
              <h3 style={{ ...styles.chartTitle, color: "#92400e" }}>
                ⚠️ أصناف تحتاج تجديد ({data.lowStock.length})
              </h3>
              <div style={styles.lowGrid}>
                {data.lowStock.map((item) => (
                  <div key={item.id} style={styles.lowCard}>
                    <div style={styles.lowName}>{item.item_name}</div>
                    <div style={styles.lowInfo}>
                      <span style={{ color: "#888", fontSize: "11px" }}>
                        متبقي
                      </span>
                      <span
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: "18px",
                        }}
                      >
                        {item.quantity}
                      </span>
                    </div>
                    <div style={{ ...styles.lowInfo, marginTop: "4px" }}>
                      <span style={{ color: "#888", fontSize: "11px" }}>
                        الحد الأدنى
                      </span>
                      <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                        {item.min_quantity}
                      </span>
                    </div>
                    {/* شريط تقدم */}
                    <div
                      style={{
                        background: "#f3f4f6",
                        borderRadius: "20px",
                        height: "6px",
                        marginTop: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (item.quantity / item.min_quantity) * 100)}%`,
                          height: "100%",
                          background:
                            item.quantity === 0 ? "#ef4444" : "#f59e0b",
                          borderRadius: "20px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* سجل الطلبات */}
      {activeTab === "table" && (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>📄 سجل الطلبات الكامل</h2>
            <div style={{ fontSize: "13px", color: "#888" }}>
              إجمالي: {orders.filter((o) => o.status !== "cancelled").length}{" "}
              طلب
            </div>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>رقم الطلب</th>
                <th style={styles.th}>العميل</th>
                <th style={styles.th}>التاريخ</th>
                <th style={styles.th}>طريقة الدفع</th>
                <th style={styles.th}>المبلغ</th>
                <th style={styles.th}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = statusConfig[o.status];
                return (
                  <tr key={o.id} style={styles.tr}>
                    <td
                      style={{
                        ...styles.td,
                        color: "#1D9E75",
                        fontWeight: 600,
                      }}
                    >
                      {o.order_number}
                    </td>
                    <td style={styles.td}>{o.customer_name}</td>
                    <td style={{ ...styles.td, color: "#888" }}>
                      {new Date(o.created_at).toLocaleDateString("ar-SA")}
                    </td>
                    <td style={styles.td}>{o.payment_method}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {Number(o.final_amount).toLocaleString()} ج.س
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          background: `${s?.color}20`,
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div style={styles.center}>لا توجد طلبات</div>
          )}
        </div>
      )}
    </Layout>
  );
}

// ===== دوال مساعدة =====

function getLast6Months(orders) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("ar-SA", {
      month: "short",
      year: "2-digit",
    });

    const monthOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return (
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear() &&
        o.status !== "cancelled"
      );
    });

    months.push({
      month: label,
      مبيعات: monthOrders.reduce((s, o) => s + Number(o.final_amount), 0),
      طلبات: monthOrders.length,
    });
  }
  return months;
}

function getTopCustomers(orders) {
  const map = {};
  orders
    .filter((o) => o.status !== "cancelled")
    .forEach((o) => {
      const name = o.customer_name || "غير محدد";
      map[name] = (map[name] || 0) + Number(o.final_amount);
    });

  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

// ===== مكونات مساعدة =====

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ ...styles.statIcon, background: bg }}>{icon}</div>
      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  center: { textAlign: "center", padding: "3rem", color: "#888" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
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
  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  statLabel: { fontSize: "11px", color: "#888", marginBottom: "2px" },
  statValue: { fontSize: "20px", fontWeight: 700 },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tab: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all .15s",
  },
  printBtn: {
    padding: "8px 16px",
    background: "#f3f4f6",
    color: "#555",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "auto",
  },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  chartCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  chartTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "1rem",
    margin: "0 0 1rem",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
    justifyContent: "center",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
  },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: { color: "#555", marginLeft: "4px" },
  lowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
    gap: "10px",
    marginTop: "8px",
  },
  lowCard: {
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    borderRadius: "10px",
    padding: "12px",
  },
  lowName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#92400e",
    marginBottom: "6px",
  },
  lowInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
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
};
