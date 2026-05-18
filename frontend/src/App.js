import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// الصفحات
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Orders from "./pages/Orders";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Store from "./pages/Store";
import Users from "./pages/Users";

// حماية الصفحات
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  // مش مسجل دخول
  if (!user) return <Navigate to="/login" replace />;

  // مسجل لكن ما عنده صلاحية
  if (roles && !roles.includes(user.role)) {
    if (user.role === "customer") return <Navigate to="/store" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* صفحات عامة */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login />
            ) : (
              <Navigate
                to={user.role === "customer" ? "/store" : "/dashboard"}
                replace
              />
            )
          }
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/store" replace />}
        />

        {/* لوحة التحكم */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["admin", "warehouse_keeper", "accountant"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* إدارة الأصناف */}
        <Route
          path="/items"
          element={
            <ProtectedRoute roles={["admin", "warehouse_keeper"]}>
              <Items />
            </ProtectedRoute>
          }
        />

        {/* الطلبات */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["admin", "warehouse_keeper", "accountant"]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* الموردون */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Suppliers />
            </ProtectedRoute>
          }
        />

        {/* العملاء */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute roles={["admin", "accountant"]}>
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* التقارير */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["admin", "accountant"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* المتجر */}
        <Route
          path="/store"
          element={
            <ProtectedRoute roles={["admin", "customer"]}>
              <Store />
            </ProtectedRoute>
          }
        />

        {/* المستخدمون */}
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={user.role === "customer" ? "/store" : "/dashboard"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* أي رابط غير موجود */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={user.role === "customer" ? "/store" : "/dashboard"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
