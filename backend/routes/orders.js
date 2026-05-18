const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/orders
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = "SELECT * FROM orders WHERE 1=1";
    const params = [];
    if (req.user.role === "customer") {
      query += " AND customer_name = ?";
      params.push(req.user.full_name);
    }
    query += " ORDER BY created_at DESC";
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في جلب الطلبات" });
  }
});

// GET /api/orders/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [order] = await db.query("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);
    if (order.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }
    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [req.params.id],
    );
    res.json({ success: true, data: { ...order[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// POST /api/orders
router.post("/", verifyToken, async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_address,
    payment_method,
    items,
  } = req.body;

  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "أضف صنفاً واحداً على الأقل" });
  }
  if (!customer_name || !customer_phone) {
    return res
      .status(400)
      .json({ success: false, message: "الاسم والهاتف مطلوبان" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;

    for (const item of items) {
      const [rows] = await conn.query(
        "SELECT quantity, price FROM items WHERE id = ?",
        [item.item_id],
      );
      if (rows.length === 0) {
        await conn.rollback();
        return res
          .status(400)
          .json({
            success: false,
            message: `الصنف غير موجود: ${item.item_name}`,
          });
      }
      if (rows[0].quantity < item.quantity) {
        await conn.rollback();
        return res
          .status(400)
          .json({
            success: false,
            message: `الكمية غير متوفرة للصنف: ${item.item_name}`,
          });
      }
      item.unit_price = Number(rows[0].price);
      total += item.unit_price * item.quantity;
    }

    const tax = total * 0.1;
    const final = total + tax;
    const orderNum = "ORD-" + Date.now();

    const [result] = await conn.query(
      `INSERT INTO orders
        (order_number, customer_name, customer_phone,
         customer_address, total_amount, tax_amount,
         final_amount, payment_method)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        orderNum,
        customer_name,
        customer_phone,
        customer_address,
        total,
        tax,
        final,
        payment_method || "نقدي",
      ],
    );

    const orderId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items
          (order_id, item_id, item_name, quantity, unit_price, total_price)
         VALUES (?,?,?,?,?,?)`,
        [
          orderId,
          item.item_id,
          item.item_name,
          item.quantity,
          item.unit_price,
          item.unit_price * item.quantity,
        ],
      );
      await conn.query(
        "UPDATE items SET quantity = quantity - ? WHERE id = ?",
        [item.quantity, item.item_id],
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      order_number: orderNum,
    });
  } catch (err) {
    await conn.rollback();
    res
      .status(500)
      .json({
        success: false,
        message: "خطأ في إنشاء الطلب",
        error: err.message,
      });
  } finally {
    conn.release();
  }
});

// PUT /api/orders/:id/status
router.put(
  "/:id/status",
  verifyToken,
  requireRole("admin", "warehouse_keeper"),
  async (req, res) => {
    const { status } = req.body;
    const valid = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!valid.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "حالة غير صحيحة" });
    }
    try {
      await db.query("UPDATE orders SET status = ? WHERE id = ?", [
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
