const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/suppliers
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM suppliers ORDER BY created_at DESC",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في جلب الموردين" });
  }
});

// POST /api/suppliers
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { company_name, supply_type, contact_person, phone } = req.body;

  if (!company_name) {
    return res.status(400).json({
      success: false,
      message: "اسم الشركة مطلوب",
    });
  }

  try {
    const code = "S" + Date.now().toString().slice(-6);
    await db.query(
      "INSERT INTO suppliers (supplier_code, company_name, supply_type, contact_person, phone) VALUES (?,?,?,?,?)",
      [code, company_name, supply_type, contact_person, phone],
    );
    res.status(201).json({ success: true, message: "تم إضافة المورد بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// PUT /api/suppliers/:id
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { company_name, supply_type, contact_person, phone, status } = req.body;
  try {
    await db.query(
      "UPDATE suppliers SET company_name=?, supply_type=?, contact_person=?, phone=?, status=? WHERE id=?",
      [company_name, supply_type, contact_person, phone, status, req.params.id],
    );
    res.json({ success: true, message: "تم تحديث المورد" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// DELETE /api/suppliers/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.query("DELETE FROM suppliers WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "تم حذف المورد" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

module.exports = router;
