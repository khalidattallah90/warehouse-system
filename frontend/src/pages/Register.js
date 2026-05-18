import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.full_name || !form.username || !form.password) {
      setError("الاسم واسم المستخدم وكلمة المرور مطلوبة");
      return;
    }
    if (form.password !== form.confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name,
        username: form.username,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "خطأ في إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* الشعار */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏭</div>
          <div>
            <div style={styles.logoTitle}>نظام إدارة المخازن</div>
            <div style={styles.logoSub}>مخزن + متجر في نظام واحد</div>
          </div>
        </div>

        <h2 style={styles.title}>إنشاء حساب جديد</h2>
        <p style={styles.sub}>أنشئ حسابك للتسوق من متجرنا</p>

        {success ? (
          <div style={styles.successBox}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#065f46",
                marginBottom: "6px",
              }}
            >
              تم إنشاء الحساب بنجاح!
            </div>
            <div style={{ fontSize: "13px", color: "#047857" }}>
              سيتم توجيهك لتسجيل الدخول...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid}>
              <Field label="الاسم الكامل *">
                <input
                  style={styles.input}
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  placeholder="اسمك الكامل"
                />
              </Field>
              <Field label="اسم المستخدم *">
                <input
                  style={styles.input}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="اسم المستخدم للدخول"
                />
              </Field>
              <Field label="رقم الهاتف">
                <input
                  style={styles.input}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="رقم هاتفك"
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  style={styles.input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="بريدك الإلكتروني"
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
              <Field label="تأكيد كلمة المرور *">
                <input
                  style={styles.input}
                  type="password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  placeholder="أعد كتابة كلمة المرور"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>

            <p style={styles.loginText}>
              لديك حساب بالفعل؟{" "}
              <span onClick={() => navigate("/login")} style={styles.link}>
                تسجيل الدخول
              </span>
            </p>
          </form>
        )}
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
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1D9E75 0%,#0d6e50 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    direction: "rtl",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.25rem",
    justifyContent: "center",
  },
  logoIcon: {
    width: "46px",
    height: "46px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  logoTitle: { fontWeight: 700, fontSize: "14px", color: "#1D9E75" },
  logoSub: { fontSize: "11px", color: "#888" },
  title: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  sub: {
    textAlign: "center",
    color: "#888",
    fontSize: "13px",
    marginBottom: "1.25rem",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "1rem",
    textAlign: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.25rem",
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
  btn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "1rem",
  },
  loginText: { textAlign: "center", fontSize: "13px", color: "#555" },
  link: { color: "#1D9E75", cursor: "pointer", fontWeight: 600 },
  successBox: {
    background: "#e8f5f0",
    borderRadius: "12px",
    padding: "2rem",
    textAlign: "center",
  },
};
