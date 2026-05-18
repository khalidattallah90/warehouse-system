const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/items
router.get("/", verifyToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = "SELECT * FROM items WHERE 1=1";
    const params = [];
    if (category && category !== "الكل") {
      query += " AND category = ?";
      params.push(category);
    }
    if (search) {
      query += " AND (item_name LIKE ? OR item_code LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    query += " ORDER BY created_at DESC";
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الأصناف",
      error: err.message,
    });
  }
});

// POST /api/items
// POST /api/items
router.post(
  "/",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  async (req, res) => {
    const {
      item_code,
      item_name,
      category,
      quantity,
      price,
      min_quantity,
      image_url,
    } = req.body;
    if (!item_code || !item_name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "الكود والاسم والسعر مطلوبة" });
    }
    try {
      const [result] = await db.query(
        "INSERT INTO items (item_code, item_name, category, quantity, price, min_quantity, image_url) VALUES (?,?,?,?,?,?,?)",
        [
          item_code,
          item_name,
          category || "أخرى",
          quantity || 0,
          price,
          min_quantity || 5,
          image_url || null,
        ],
      );
      res
        .status(201)
        .json({
          success: true,
          message: "تم إضافة الصنف بنجاح",
          id: result.insertId,
        });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "كود الصنف موجود مسبقاً" });
      }
      res
        .status(500)
        .json({ success: false, message: "خطأ في الخادم", error: err.message });
    }
  },
);
// PUT /api/items/:id
// PUT /api/items/:id
router.put(
  "/:id",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  async (req, res) => {
    const { item_name, category, quantity, price, min_quantity, image_url } =
      req.body;
    if (!item_name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "الاسم والسعر مطلوبان" });
    }
    try {
      await db.query(
        "UPDATE items SET item_name=?, category=?, quantity=?, price=?, min_quantity=?, image_url=? WHERE id=?",
        [
          item_name,
          category,
          quantity,
          price,
          min_quantity,
          image_url || null,
          req.params.id,
        ],
      );
      res.json({ success: true, message: "تم تحديث الصنف بنجاح" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "خطأ في الخادم", error: err.message });
    }
  },
);

// DELETE /api/items/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "تم حذف الصنف" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "لا يمكن حذف الصنف، قد يكون مرتبطاً بطلبات",
    });
  }
});
// POST /api/items/upload — رفع صورة
router.post(
  "/upload",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "لم يتم رفع أي صورة" });
    }

    // رابط الصورة الكامل
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      image_url: imageUrl,
      filename: req.file.filename,
    });
  },
);

module.exports = router;
