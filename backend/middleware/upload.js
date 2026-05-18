const multer = require("multer");
const path = require("path");

// إعداد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // احفظ في مجلد uploads
  },

  filename: (req, file, cb) => {
    // اسم الملف = وقت الآن + الاسم الأصلي
    // مثال: 1714500000000-ceramic.jpg
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    cb(null, uniqueName);
  },
});

// فلتر — اقبل الصور فقط
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true); // اقبل الملف
  } else {
    cb(new Error("يُسمح فقط بصور JPG و PNG و WebP"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميغابايت كحد أقصى
});

module.exports = upload;
