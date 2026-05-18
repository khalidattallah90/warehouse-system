import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [itemsRes, ordersRes] = await Promise.all([
        api.get("/items"),
        api.get("/orders"),
      ]);

      const items = itemsRes.data.data;
      const orders = ordersRes.data.data;
      const list = [];

      // تنبيهات نقص المخزون
      items
        .filter((i) => i.quantity <= i.min_quantity)
        .forEach((i) => {
          list.push({
            id: `low-${i.id}`,
            type: "warning",
            icon: "⚠️",
            title: "نقص في المخزون",
            message: `${i.item_name} — متبقي ${i.quantity} فقط`,
            time: "الآن",
            read: false,
          });
        });

      // طلبات معلّقة
      orders
        .filter((o) => o.status === "pending")
        .slice(0, 5)
        .forEach((o) => {
          list.push({
            id: `order-${o.id}`,
            type: "info",
            icon: "📋",
            title: "طلب جديد بانتظار المعالجة",
            message: `${o.order_number} — ${o.customer_name}`,
            time: new Date(o.created_at).toLocaleDateString("ar-SA"),
            read: false,
          });
        });

      // طلبات تم تسليمها اليوم
      const today = new Date().toDateString();
      orders
        .filter((o) => {
          return (
            o.status === "delivered" &&
            new Date(o.created_at).toDateString() === today
          );
        })
        .slice(0, 3)
        .forEach((o) => {
          list.push({
            id: `done-${o.id}`,
            type: "success",
            icon: "✅",
            title: "تم تسليم طلب",
            message: `${o.order_number} — ${o.customer_name}`,
            time: "اليوم",
            read: false,
          });
        });

      setNotifications(list);
      setUnread(list.length);
    } catch (err) {
      console.error(err);
    }
  };

  // جلب الإشعارات كل دقيقة
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // إغلاق عند الضغط خارج النافذة
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const typeColors = {
    warning: { bg: "#fffbeb", border: "#fcd34d", color: "#92400e" },
    info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
    success: { bg: "#e8f5f0", border: "#a7f3d0", color: "#065f46" },
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* زر الجرس */}
      <button onClick={() => setOpen(!open)} style={styles.bellBtn}>
        🔔
        {unread > 0 && (
          <span style={styles.badge}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {open && (
        <div style={styles.dropdown}>
          {/* الرأس */}
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitle}>الإشعارات</div>
              {unread > 0 && (
                <div style={styles.headerSub}>{unread} إشعار غير مقروء</div>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={styles.markAllBtn}>
                قراءة الكل
              </button>
            )}
          </div>

          {/* قائمة الإشعارات */}
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔔</div>
                <div style={{ color: "#888", fontSize: "13px" }}>
                  لا توجد إشعارات
                </div>
              </div>
            ) : (
              notifications.map((n) => {
                const colors = typeColors[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      ...styles.item,
                      background: n.read ? "transparent" : colors.bg,
                      borderRight: `3px solid ${n.read ? "#e5e7eb" : colors.border}`,
                      opacity: n.read ? 0.7 : 1,
                    }}
                  >
                    <div style={styles.itemIcon}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          ...styles.itemTitle,
                          color: n.read ? "#888" : colors.color,
                        }}
                      >
                        {n.title}
                      </div>
                      <div style={styles.itemMsg}>{n.message}</div>
                      <div style={styles.itemTime}>{n.time}</div>
                    </div>
                    {!n.read && (
                      <div
                        style={{ ...styles.dot, background: colors.border }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* الذيل */}
          <div style={styles.footer}>
            <button onClick={fetchNotifications} style={styles.refreshBtn}>
              🔄 تحديث
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  bellBtn: {
    position: "relative",
    width: "38px",
    height: "38px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .2s",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    left: "-6px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: "20px",
    minWidth: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 700,
    padding: "0 4px",
    border: "2px solid #fff",
  },
  dropdown: {
    position: "absolute",
    top: "46px",
    left: "-280px",
    width: "340px",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e5e7eb",
    zIndex: 999,
    overflow: "hidden",
    direction: "rtl",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f9fafb",
  },
  headerTitle: { fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  headerSub: { fontSize: "11px", color: "#888", marginTop: "1px" },
  markAllBtn: {
    fontSize: "12px",
    color: "#1D9E75",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  list: { maxHeight: "340px", overflowY: "auto" },
  empty: { padding: "2.5rem", textAlign: "center" },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background .15s",
  },
  itemIcon: { fontSize: "20px", flexShrink: 0, marginTop: "1px" },
  itemTitle: { fontSize: "12px", fontWeight: 600, marginBottom: "2px" },
  itemMsg: {
    fontSize: "12px",
    color: "#555",
    marginBottom: "3px",
    lineHeight: 1.4,
  },
  itemTime: { fontSize: "11px", color: "#aaa" },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "6px",
  },
  footer: {
    padding: "10px 16px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "center",
  },
  refreshBtn: {
    fontSize: "12px",
    color: "#888",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: "6px",
  },
};
