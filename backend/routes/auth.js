const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const { verifyToken } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "الرجاء إدخال اسم المستخدم وكلمة المرور",
      });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND status = "active"',
      [username],
    );
    if (rows.length === 0) {
      return res
        .status(401)
        .json({
          success: false,
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          success: false,
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        });
    }
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { full_name, username, phone, email, password } = req.body;

  if (!full_name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "الاسم واسم المستخدم وكلمة المرور مطلوبة",
    });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "اسم المستخدم موجود مسبقاً",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (full_name, username, phone, email, password, role) VALUES (?,?,?,?,?,?)",
      [full_name, username, phone, email, hashed, "customer"],
    );

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// POST /api/auth/register (تسجيل عميل جديد)
router.post("/register", async (req, res) => {
  const { full_name, phone, email, password } = req.body;
  if (!full_name || !password) {
    return res
      .status(400)
      .json({ success: false, message: "الاسم وكلمة المرور مطلوبان" });
  }
  try {
    const username = email || phone;
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "المستخدم موجود مسبقاً" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, full_name, email, phone, role) VALUES (?,?,?,?,?,?)",
      [username, hashedPassword, full_name, email, phone, "customer"],
    );
    res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "خطأ في الخادم", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, full_name, email, phone, role, status, created_at FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

module.exports = router;
