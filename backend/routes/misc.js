const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db/db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/users
router.get("/users", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, full_name, username, email, phone, role, status, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// POST /api/users
router.post("/users", verifyToken, requireRole("admin"), async (req, res) => {
  const { full_name, username, password, phone, email, role } = req.body;
  if (!full_name || !username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "البيانات الأساسية مطلوبة" });
  }
  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "اسم المستخدم موجود مسبقاً" });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (full_name, username, password, phone, email, role) VALUES (?,?,?,?,?,?)",
      [full_name, username, hashed, phone, email, role || "customer"],
    );
    res.status(201).json({ success: true, message: "تم إضافة المستخدم" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// PUT /api/users/:id/status
router.put(
  "/users/:id/status",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    const { status } = req.body;
    try {
      await db.query("UPDATE users SET status = ? WHERE id = ?", [
        status,
        req.params.id,
      ]);
      res.json({ success: true, message: "تم تحديث الحالة" });
    } catch (err) {
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  },
);

module.exports = router;
