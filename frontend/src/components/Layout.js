import Sidebar from "./Sidebar";
import Notifications from "./Notifications";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, title }) {
  const { user } = useAuth();

  // العميل لا يرى الإشعارات
  const showNotifications = user?.role !== "customer";

  return (
    <div style={styles.wrap}>
      <Sidebar />
      <div style={styles.main}>
        {/* شريط العنوان */}
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>{title}</h1>
            <p style={styles.pageDate}>
              {new Date().toLocaleDateString("ar-SA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* الإشعارات */}
          {showNotifications && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Notifications />
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    minHeight: "100vh",
    direction: "rtl",
    background: "#f5f7fa",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    padding: "1rem 1.5rem",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
  },
  pageDate: {
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  },
  content: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto",
  },
};
