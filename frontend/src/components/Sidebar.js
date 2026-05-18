import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    path: "/dashboard",
    label: "لوحة التحكم",
    icon: "📊",
    roles: ["admin", "warehouse_keeper", "accountant"],
  },
  {
    path: "/items",
    label: "إدارة الأصناف",
    icon: "📦",
    roles: ["admin", "warehouse_keeper"],
  },
  { path: "/suppliers", label: "الموردون", icon: "🏢", roles: ["admin"] },
  {
    path: "/orders",
    label: "الطلبات",
    icon: "📋",
    roles: ["admin", "warehouse_keeper", "accountant"],
  },
  {
    path: "/customers",
    label: "العملاء",
    icon: "👥",
    roles: ["admin", "accountant"],
  },
  {
    path: "/reports",
    label: "التقارير",
    icon: "📈",
    roles: ["admin", "accountant"],
  },
  { path: "/store", label: "المتجر", icon: "🛒", roles: ["admin", "customer"] },
  { path: "/users", label: "المستخدمون", icon: "⚙️", roles: ["admin"] },
];

const roleNames = {
  admin: "مدير النظام",
  warehouse_keeper: "أمين المخزن",
  accountant: "محاسب",
  customer: "عميل",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <div style={styles.sidebar}>
      {/* الشعار */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏭</div>
        <div>
          <div style={styles.logoTitle}>نظام المخازن</div>
          <div style={styles.logoSub}>إدارة إلكترونية</div>
        </div>
      </div>

      {/* بيانات المستخدم */}
      <div style={styles.userBox}>
        <div style={styles.avatar}>{user?.full_name?.charAt(0)}</div>
        <div>
          <div style={styles.userName}>{user?.full_name}</div>
          <div style={styles.userRole}>{roleNames[user?.role]}</div>
        </div>
      </div>

      {/* القائمة */}
      <nav style={styles.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              background: isActive ? "#e8f5f0" : "transparent",
              color: isActive ? "#1D9E75" : "#6b7280",
              borderRight: isActive
                ? "3px solid #1D9E75"
                : "3px solid transparent",
              fontWeight: isActive ? "600" : "400",
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* تسجيل الخروج */}
      <div style={styles.logoutBox}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "230px",
    minHeight: "100vh",
    background: "#fff",
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logo: {
    padding: "1.25rem 1rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  logoTitle: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#1a1a1a",
  },
  logoSub: {
    fontSize: "11px",
    color: "#888",
    marginTop: "1px",
  },
  userBox: {
    padding: "1rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f9fafb",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "700",
    flexShrink: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  userRole: {
    fontSize: "11px",
    color: "#1D9E75",
    marginTop: "1px",
  },
  nav: {
    flex: 1,
    padding: "8px 0",
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 16px",
    fontSize: "13px",
    textDecoration: "none",
    transition: "all .15s",
  },
  navIcon: {
    fontSize: "17px",
    flexShrink: 0,
  },
  logoutBox: {
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  logoutBtn: {
    width: "100%",
    padding: "9px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
