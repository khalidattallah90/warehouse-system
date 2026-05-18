import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      login(res.data.user, res.data.token);

      // وجّه المستخدم حسب دوره
      if (res.data.user.role === "customer") {
        navigate("/store");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "خطأ في تسجيل الدخول");
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

        <h2 style={styles.title}>مرحباً بك</h2>
        <p style={styles.sub}>سجّل دخولك للمتابعة</p>

        {/* رسالة الخطأ */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          {/* اسم المستخدم */}
          <div style={styles.field}>
            <label style={styles.label}>اسم المستخدم</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* كلمة المرور */}
          <div style={styles.field}>
            <label style={styles.label}>كلمة المرور</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <span
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeIcon}
              >
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* زر الدخول */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        {/* رابط إنشاء حساب */}
        <div style={styles.divider}>
          <hr style={styles.hr} />
          <span style={styles.orText}>أو</span>
          <hr style={styles.hr} />
        </div>
        <p style={styles.registerText}>
          ليس لديك حساب؟{" "}
          <span onClick={() => navigate("/register")} style={styles.link}>
            إنشاء حساب جديد
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1D9E75 0%, #0d6e50 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    direction: "rtl",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.5rem",
    justifyContent: "center",
  },
  logoIcon: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #1D9E75, #0d6e50)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },
  logoTitle: {
    fontWeight: "700",
    fontSize: "15px",
    color: "#1D9E75",
  },
  logoSub: {
    fontSize: "11px",
    color: "#888",
    marginTop: "2px",
  },
  title: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  sub: {
    textAlign: "center",
    color: "#888",
    fontSize: "13px",
    marginBottom: "1.5rem",
  },
  error: {
    background: "#fdecea",
    color: "#c62828",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "1rem",
    textAlign: "center",
  },
  field: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#555",
    marginBottom: "5px",
    fontWeight: "500",
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "11px 42px 11px 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "right",
    outline: "none",
    transition: "border .2s",
    boxSizing: "border-box",
    background: "#fafafa",
  },
  inputIcon: {
    position: "absolute",
    right: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    pointerEvents: "none",
  },
  eyeIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "16px",
  },
  btn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #1D9E75, #0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    transition: "opacity .2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },
  hr: {
    flex: 1,
    border: "none",
    borderTop: "1px solid #eee",
  },
  orText: {
    fontSize: "12px",
    color: "#bbb",
  },
  registerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#555",
  },
  link: {
    color: "#1D9E75",
    cursor: "pointer",
    fontWeight: "600",
  },
};
