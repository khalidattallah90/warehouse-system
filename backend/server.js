require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./db/db");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://warehouse-system.vercel.app", // ← رابط Vercel الخاص بك
    ],
    credentials: true,
  }),
);
app.use(express.json());

// كل الـ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api", require("./routes/misc"));
// اجعل مجلد uploads متاحاً كملفات ثابتة
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
  res.json({ message: "الخادم يعمل ✅" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "المسار غير موجود" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});
