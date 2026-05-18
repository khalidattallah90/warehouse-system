import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const categories = ["الكل", "بورسلين", "رخام", "حوائط", "أرضيات", "أخرى"];

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // الفورم — كل حقل مستقل

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [itemCode, setItemCode] = useState("");

  const [itemName, setItemName] = useState("");
  const [itemCat, setItemCat] = useState("بورسلين");
  const [itemQty, setItemQty] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemMinQty, setItemMinQty] = useState("5");

  const handleImageUpload = async (file) => {
    if (!file) return;

    // معاينة محلية فورية
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // رفع للخادم
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/items/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageUrl(res.data.image_url);
      console.log("تم رفع الصورة:", res.data.image_url);
    } catch (err) {
      alert("خطأ في رفع الصورة");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "الكل") params.category = category;
      if (search) params.search = search;
      const res = await api.get("/items", { params });
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, search]);
  const openAdd = () => {
    setEditItem(null);
    setItemCode("");
    setItemName("");
    setItemCat("بورسلين");
    setItemQty("");
    setItemPrice("");
    setItemMinQty("5");
    setImageUrl("");
    setImagePreview("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setItemCode(item.item_code);
    setItemName(item.item_name);
    setItemCat(item.category);
    setItemQty(String(item.quantity));
    setItemPrice(String(item.price));
    setItemMinQty(String(item.min_quantity));
    setImageUrl(item.image_url || "");
    setImagePreview(item.image_url || "");
    setError("");
    setShowModal(true);
  };
  const handleSave = async () => {
    if (!itemCode.trim()) {
      setError("كود الصنف مطلوب");
      return;
    }
    if (!itemName.trim()) {
      setError("اسم الصنف مطلوب");
      return;
    }
    if (!itemPrice) {
      setError("السعر مطلوب");
      return;
    }

    const body = {
      item_code: itemCode.trim(),
      item_name: itemName.trim(),
      category: itemCat,
      quantity: Number(itemQty) || 0,
      price: Number(itemPrice),
      min_quantity: Number(itemMinQty) || 5,
      image_url: imageUrl || null,
    };

    setSaving(true);
    setError("");
    try {
      if (editItem) {
        await api.put(`/items/${editItem.id}`, body);
      } else {
        await api.post("/items", body);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await api.delete(`/items/${id}`);
      fetchItems();
    } catch (err) {
      alert("لا يمكن حذف هذا الصنف");
    }
  };

  return (
    <Layout title="إدارة الأصناف">
      {/* أدوات البحث والفلترة */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 ابحث باسم الصنف أو الكود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.cats}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                ...styles.catBtn,
                background: category === cat ? "#1D9E75" : "#fff",
                color: category === cat ? "#fff" : "#555",
                border:
                  category === cat
                    ? "1.5px solid #1D9E75"
                    : "1.5px solid #e0e0e0",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button onClick={openAdd} style={styles.addBtn}>
          + إضافة صنف
        </button>
      </div>

      {/* الجدول */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.center}>جاري التحميل...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>الكود</th>
                <th style={styles.th}>اسم الصنف</th>
                <th style={styles.th}>الفئة</th>
                <th style={styles.th}>الكمية</th>
                <th style={styles.th}>الحد الأدنى</th>
                <th style={styles.th}>السعر</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.quantity <= item.min_quantity;
                return (
                  <tr key={item.id} style={styles.tr}>
                    <td
                      style={{
                        ...styles.td,
                        fontFamily: "monospace",
                        color: "#1D9E75",
                      }}
                    >
                      {item.item_code}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              background: "#f5f7fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                            }}
                          >
                            🪨
                          </div>
                        )}
                        {item.item_name}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.catBadge}>{item.category}</span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 600,
                        color: isLow ? "#ef4444" : "#1a1a1a",
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td style={{ ...styles.td, color: "#888" }}>
                      {item.min_quantity}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {Number(item.price).toLocaleString()} ج.س
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          background: isLow ? "#fef2f2" : "#e8f5f0",
                          color: isLow ? "#ef4444" : "#1D9E75",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {isLow ? "⚠️ نقص" : "✅ متوفر"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => openEdit(item)}
                          style={styles.editBtn}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={styles.deleteBtn}
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && items.length === 0 && (
          <div style={styles.center}>لا توجد أصناف</div>
        )}
      </div>

      {/* نافذة الإضافة/التعديل */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editItem ? "تعديل الصنف" : "إضافة صنف جديد"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>كود الصنف *</label>
                <input
                  style={styles.input}
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  placeholder="مثال: ITM004"
                  disabled={!!editItem}
                />
              </div>

              <div>
                <label style={styles.label}>اسم الصنف *</label>
                <input
                  style={styles.input}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="مثال: بورسلين 60×60"
                />
              </div>

              <div>
                <label style={styles.label}>الفئة</label>
                <select
                  style={styles.input}
                  value={itemCat}
                  onChange={(e) => setItemCat(e.target.value)}
                >
                  {categories.slice(1).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>الكمية</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={styles.label}>السعر (ج.س) *</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={styles.label}>الحد الأدنى للتنبيه</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={itemMinQty}
                  onChange={(e) => setItemMinQty(e.target.value)}
                  placeholder="5"
                />
              </div>
              {/* حقل رفع الصورة */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>صورة الصنف</label>

                {/* منطقة السحب والإفلات */}
                <div
                  style={{
                    border: "2px dashed #e0e0e0",
                    borderRadius: "10px",
                    padding: "1rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fafafa",
                    transition: "border .2s",
                  }}
                  onClick={() => document.getElementById("imageInput").click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#1D9E75";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload(file);
                  }}
                >
                  {imagePreview ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="معاينة"
                        style={{
                          maxHeight: "140px",
                          maxWidth: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          marginTop: "6px",
                        }}
                      >
                        {uploading
                          ? "⏳ جاري الرفع..."
                          : "✅ تم رفع الصورة — اضغط لتغييرها"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                        📸
                      </div>
                      <div style={{ fontSize: "13px", color: "#888" }}>
                        {uploading
                          ? "⏳ جاري الرفع..."
                          : "اضغط لاختيار صورة أو اسحبها هنا"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#bbb",
                          marginTop: "4px",
                        }}
                      >
                        JPG, PNG, WebP — حجم أقصى 5 ميغابايت
                      </div>
                    </div>
                  )}
                </div>

                <input
                  id="imageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
            </div>

            {/* معاينة البيانات قبل الإرسال */}
            <div style={styles.preview}>
              <div style={styles.previewTitle}>📋 البيانات التي ستُرسل:</div>
              <div style={styles.previewGrid}>
                <span style={styles.previewItem}>
                  الكود: <strong>{itemCode || "—"}</strong>
                </span>
                <span style={styles.previewItem}>
                  الاسم: <strong>{itemName || "—"}</strong>
                </span>
                <span style={styles.previewItem}>
                  الفئة: <strong>{itemCat}</strong>
                </span>
                <span style={styles.previewItem}>
                  الكمية: <strong>{itemQty || "0"}</strong>
                </span>
                <span style={styles.previewItem}>
                  السعر: <strong>{itemPrice || "—"}</strong>
                </span>
                <span style={styles.previewItem}>
                  الحد الأدنى: <strong>{itemMinQty}</strong>
                </span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
              >
                {saving
                  ? "جاري الحفظ..."
                  : editItem
                    ? "حفظ التعديلات"
                    : "إضافة الصنف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  toolbar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "9px 14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    width: "220px",
    outline: "none",
    direction: "rtl",
  },
  cats: { display: "flex", gap: "6px", flex: 1, flexWrap: "wrap" },
  catBtn: {
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all .15s",
  },
  addBtn: {
    padding: "9px 18px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" },
  th: {
    padding: "12px",
    textAlign: "right",
    fontSize: "12px",
    color: "#888",
    fontWeight: 600,
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: {
    padding: "12px",
    textAlign: "right",
    fontSize: "13px",
    color: "#1a1a1a",
  },
  catBadge: {
    background: "#e8f5f0",
    color: "#1D9E75",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 500,
  },
  actions: { display: "flex", gap: "6px" },
  editBtn: {
    padding: "5px 10px",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 10px",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  center: { textAlign: "center", padding: "3rem", color: "#888" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "560px",
    direction: "rtl",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
  },
  error: {
    margin: "1rem 1.5rem 0",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    padding: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#555",
    marginBottom: "5px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    direction: "rtl",
    background: "#fafafa",
  },
  preview: {
    margin: "0 1.5rem 1rem",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  previewTitle: {
    fontSize: "12px",
    color: "#166534",
    fontWeight: 600,
    marginBottom: "6px",
  },
  previewGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" },
  previewItem: { fontSize: "12px", color: "#15803d" },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "9px 20px",
    background: "#f3f4f6",
    color: "#555",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "9px 24px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
