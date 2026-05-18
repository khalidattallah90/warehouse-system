const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/customers
router.get(
  "/",
  verifyToken,
  requireRole("admin", "accountant"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM customers ORDER BY total_purchases DESC",
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "خطأ في جلب العملاء" });
    }
  },
);

// POST /api/customers
router.post(
  "/",
  verifyToken,
  requireRole("admin", "accountant"),
  async (req, res) => {
    const { full_name, phone, email, address } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: "الاسم مطلوب" });
    }

    try {
      await db.query(
        "INSERT INTO customers (full_name, phone, email, address) VALUES (?,?,?,?)",
        [full_name, phone, email, address],
      );
      res.status(201).json({ success: true, message: "تم إضافة العميل" });
    } catch (err) {
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  },
);

// DELETE /api/customers/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "تم حذف العميل" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

module.exports = router;
