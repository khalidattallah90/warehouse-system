import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const categories = ["الكل", "بورسلين", "رخام", "حوائط", "أرضيات", "أخرى"];

export default function Store() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showItem, setShowItem] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [error, setError] = useState("");

  // حقول الـ checkout مستقلة
  const [custName, setCustName] = useState(user?.full_name || "");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [payMethod, setPayMethod] = useState("نقدي");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "الكل") params.category = category;
      if (search) params.search = search;
      const res = await api.get("/items", { params });
      setItems(res.data.data.filter((i) => i.quantity > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, search]);

  // ===== السلة =====
  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        if (exists.qty >= item.quantity) {
          alert(`الكمية المتوفرة فقط ${item.quantity}`);
          return prev;
        }
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // ===== إتمام الطلب =====
  const handleOrder = async () => {
    if (!custName.trim()) {
      setError("الاسم مطلوب");
      return;
    }
    if (!custPhone.trim()) {
      setError("الهاتف مطلوب");
      return;
    }

    const body = {
      customer_name: custName.trim(),
      customer_phone: custPhone.trim(),
      customer_address: custAddress.trim(),
      payment_method: payMethod,
      items: cart.map((c) => ({
        item_id: c.id,
        item_name: c.item_name,
        quantity: c.qty,
      })),
    };

    console.log("بيانات الطلب:", body);

    setOrdering(true);
    setError("");
    try {
      const res = await api.post("/orders", body);
      setOrderDone(res.data.order_number);
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "خطأ في إنشاء الطلب");
    } finally {
      setOrdering(false);
    }
  };

  return (
    <Layout title="المتجر">
      {/* رسالة نجاح الطلب */}
      {orderDone && (
        <div style={styles.successBanner}>
          <div style={{ fontSize: "36px" }}>🎉</div>
          <div style={{ flex: 1 }}>
            <div style={styles.successTitle}>تم إنشاء طلبك بنجاح!</div>
            <div style={styles.successSub}>
              رقم الطلب: <strong>{orderDone}</strong> — سنتواصل معك قريباً
            </div>
          </div>
          <button
            onClick={() => setOrderDone(null)}
            style={styles.closeSuccess}
          >
            ✕
          </button>
        </div>
      )}

      {/* شريط الأدوات */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 ابحث عن نوع السيراميك..."
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

        {/* زر السلة */}
        <button onClick={() => setShowCart(true)} style={styles.cartBtn}>
          🛒 السلة
          {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>

      {/* شبكة المنتجات */}
      {loading ? (
        <div style={styles.center}>جاري تحميل المنتجات...</div>
      ) : items.length === 0 ? (
        <div style={styles.center}>لا توجد منتجات في هذه الفئة</div>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => {
            const inCart = cart.find((c) => c.id === item.id);
            return (
              <div
                key={item.id}
                style={styles.card}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0,0,0,0.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.06)")
                }
              >
                {/* الصورة */}
                <div style={styles.imgWrap} onClick={() => setShowItem(item)}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.item_name}
                      style={styles.img}
                    />
                  ) : (
                    <div style={styles.noImg}>🪨</div>
                  )}
                  {/* شارة الفئة */}
                  <span style={styles.catBadge}>{item.category}</span>
                  {/* شارة الكمية المحدودة */}
                  {item.quantity <= 10 && (
                    <span style={styles.lowBadge}>
                      آخر {item.quantity} قطعة!
                    </span>
                  )}
                  {/* زر التكبير */}
                  <div style={styles.zoomHint}>🔍 عرض التفاصيل</div>
                </div>

                {/* بيانات المنتج */}
                <div style={styles.cardBody}>
                  <div style={styles.itemName}>{item.item_name}</div>
                  <div style={styles.itemCode}>كود: {item.item_code}</div>

                  <div style={styles.cardFooter}>
                    <div>
                      <div style={styles.itemPrice}>
                        {Number(item.price).toLocaleString()}
                        <span style={styles.currency}> ج.س</span>
                      </div>
                      <div style={styles.itemStock}>
                        متوفر: {item.quantity} قطعة
                      </div>
                    </div>
                  </div>

                  {/* زر السلة */}
                  {inCart ? (
                    <div style={styles.qtyRow}>
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        style={styles.qtyBtn}
                      >
                        −
                      </button>
                      <span style={styles.qtyNum}>{inCart.qty}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        style={styles.qtyBtn}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={styles.removeBtn}
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      style={styles.addBtn}
                    >
                      🛒 أضف للسلة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة تفاصيل المنتج */}
      {showItem && (
        <div style={styles.overlay} onClick={() => setShowItem(null)}>
          <div style={styles.itemModal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowItem(null)} style={styles.closeBtn}>
              ✕
            </button>

            <div style={styles.itemModalContent}>
              {/* الصورة */}
              <div style={styles.itemModalImg}>
                {showItem.image_url ? (
                  <img
                    src={showItem.image_url}
                    alt={showItem.item_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      fontSize: "80px",
                    }}
                  >
                    🪨
                  </div>
                )}
              </div>

              {/* التفاصيل */}
              <div style={styles.itemModalDetails}>
                <span style={styles.catBadge2}>{showItem.category}</span>
                <h2 style={styles.itemModalName}>{showItem.item_name}</h2>
                <div style={styles.itemModalCode}>
                  كود الصنف: {showItem.item_code}
                </div>

                <div style={styles.itemModalPrice}>
                  {Number(showItem.price).toLocaleString()} ج.س
                </div>

                <div style={styles.itemModalInfo}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>الكمية المتوفرة</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: showItem.quantity <= 10 ? "#ef4444" : "#1D9E75",
                      }}
                    >
                      {showItem.quantity} قطعة
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>الفئة</span>
                    <span style={{ fontWeight: 600 }}>{showItem.category}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>ضريبة القيمة المضافة</span>
                    <span style={{ fontWeight: 600 }}>10%</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>السعر بعد الضريبة</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#1D9E75",
                        fontSize: "15px",
                      }}
                    >
                      {(showItem.price * 1.1).toLocaleString()} ج.س
                    </span>
                  </div>
                </div>

                {cart.find((c) => c.id === showItem.id) ? (
                  <div style={styles.qtyRow}>
                    <button
                      onClick={() => changeQty(showItem.id, -1)}
                      style={styles.qtyBtn}
                    >
                      −
                    </button>
                    <span style={styles.qtyNum}>
                      {cart.find((c) => c.id === showItem.id)?.qty}
                    </span>
                    <button
                      onClick={() => changeQty(showItem.id, 1)}
                      style={styles.qtyBtn}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(showItem.id)}
                      style={styles.removeBtn}
                    >
                      🗑️ إزالة
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      addToCart(showItem);
                      setShowItem(null);
                    }}
                    style={{
                      ...styles.addBtn,
                      fontSize: "15px",
                      padding: "12px",
                    }}
                  >
                    🛒 أضف للسلة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة السلة */}
      {showCart && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🛒 سلة المشتريات ({cartCount})</h2>
              <button
                onClick={() => setShowCart(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {cart.length === 0 ? (
                <div style={styles.emptyCart}>
                  <div style={{ fontSize: "52px", marginBottom: "12px" }}>
                    🛒
                  </div>
                  <div style={{ color: "#888", fontSize: "15px" }}>
                    السلة فارغة
                  </div>
                  <div
                    style={{
                      color: "#bbb",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    أضف منتجات من المتجر
                  </div>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                      {/* صورة مصغرة */}
                      <div style={styles.cartImg}>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "22px" }}>🪨</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={styles.cartItemName}>{item.item_name}</div>
                        <div style={styles.cartItemPrice}>
                          {Number(item.price).toLocaleString()} ج.س × {item.qty}
                        </div>
                      </div>

                      <div style={styles.cartItemActions}>
                        <div style={styles.qtyRow}>
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            style={styles.qtyBtn}
                          >
                            −
                          </button>
                          <span style={styles.qtyNum}>{item.qty}</span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            style={styles.qtyBtn}
                          >
                            +
                          </button>
                        </div>
                        <div style={styles.cartItemTotal}>
                          {Number(item.price * item.qty).toLocaleString()} ج.س
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={styles.removeBtn}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* الإجمالي */}
                  <div style={styles.summary}>
                    <div style={styles.summaryRow}>
                      <span style={{ color: "#888" }}>المجموع</span>
                      <span>{Number(subtotal).toLocaleString()} ج.س</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={{ color: "#888" }}>الضريبة 10%</span>
                      <span>{Number(tax).toLocaleString()} ج.س</span>
                    </div>
                    <div
                      style={{
                        ...styles.summaryRow,
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#1D9E75",
                        borderTop: "2px solid #e5e7eb",
                        paddingTop: "10px",
                        marginTop: "4px",
                      }}
                    >
                      <span>الإجمالي</span>
                      <span>{Number(total).toLocaleString()} ج.س</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowCart(false)}
                  style={styles.cancelBtn}
                >
                  متابعة التسوق
                </button>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                    setError("");
                  }}
                  style={styles.checkoutBtn}
                >
                  إتمام الطلب ←
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* نافذة إتمام الطلب */}
      {showCheckout && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>إتمام الطلب</h2>
              <button
                onClick={() => setShowCheckout(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {error && <div style={styles.error}>{error}</div>}

              <h3 style={styles.sectionTitle}>معلومات الشحن</h3>

              <div style={styles.formGrid}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>الاسم الكامل *</label>
                  <input
                    style={styles.input}
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="اسمك الكامل"
                  />
                </div>
                <div>
                  <label style={styles.label}>رقم الهاتف *</label>
                  <input
                    style={styles.input}
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="رقم هاتفك"
                  />
                </div>
                <div>
                  <label style={styles.label}>العنوان</label>
                  <input
                    style={styles.input}
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="عنوان التسليم"
                  />
                </div>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: "1rem" }}>
                طريقة الدفع
              </h3>
              <div style={styles.payMethods}>
                {[
                  { key: "نقدي", icon: "💵" },
                  { key: "تحويل", icon: "🏦" },
                  { key: "بطاقة", icon: "💳" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPayMethod(m.key)}
                    style={{
                      ...styles.payBtn,
                      background: payMethod === m.key ? "#e8f5f0" : "#fff",
                      border:
                        payMethod === m.key
                          ? "2px solid #1D9E75"
                          : "1.5px solid #e0e0e0",
                      color: payMethod === m.key ? "#1D9E75" : "#555",
                      fontWeight: payMethod === m.key ? 700 : 400,
                    }}
                  >
                    {m.icon} {m.key}
                    {payMethod === m.key && (
                      <span style={{ marginRight: "4px" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ملخص نهائي */}
              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={{ color: "#888" }}>عدد الأصناف</span>
                  <span>
                    {cart.length} صنف ({cartCount} قطعة)
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={{ color: "#888" }}>المجموع</span>
                  <span>{Number(subtotal).toLocaleString()} ج.س</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={{ color: "#888" }}>الضريبة 10%</span>
                  <span>{Number(tax).toLocaleString()} ج.س</span>
                </div>
                <div
                  style={{
                    ...styles.summaryRow,
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#1D9E75",
                    borderTop: "2px solid #e5e7eb",
                    paddingTop: "10px",
                    marginTop: "4px",
                  }}
                >
                  <span>الإجمالي النهائي</span>
                  <span>{Number(total).toLocaleString()} ج.س</span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setShowCart(true);
                }}
                style={styles.cancelBtn}
              >
                ← رجوع للسلة
              </button>
              <button
                onClick={handleOrder}
                disabled={ordering}
                style={{ ...styles.checkoutBtn, opacity: ordering ? 0.7 : 1 }}
              >
                {ordering ? "⏳ جاري الإرسال..." : "✅ تأكيد الطلب"}
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
    marginBottom: "1.5rem",
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
  cartBtn: {
    position: "relative",
    padding: "9px 20px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },
  cartBadge: {
    position: "absolute",
    top: "-8px",
    left: "-8px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "box-shadow .2s, transform .2s",
  },
  imgWrap: {
    height: "180px",
    background: "#f5f7fa",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform .3s",
  },
  noImg: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    fontSize: "56px",
  },
  catBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "rgba(29,158,117,0.9)",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
  },
  catBadge2: {
    display: "inline-block",
    background: "#e8f5f0",
    color: "#1D9E75",
    padding: "3px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  lowBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "rgba(239,68,68,0.9)",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
  },
  zoomHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    fontSize: "12px",
    textAlign: "center",
    padding: "6px",
    opacity: 0,
    transition: "opacity .2s",
  },
  cardBody: { padding: "12px" },
  itemName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "3px",
  },
  itemCode: {
    fontSize: "11px",
    color: "#aaa",
    marginBottom: "8px",
    fontFamily: "monospace",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  itemPrice: { fontSize: "18px", fontWeight: 700, color: "#1D9E75" },
  currency: { fontSize: "12px", fontWeight: 400 },
  itemStock: { fontSize: "11px", color: "#888", marginTop: "2px" },
  addBtn: {
    width: "100%",
    padding: "9px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  qtyRow: { display: "flex", alignItems: "center", gap: "8px", width: "100%" },
  qtyBtn: {
    width: "30px",
    height: "30px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qtyNum: {
    fontSize: "15px",
    fontWeight: 700,
    minWidth: "24px",
    textAlign: "center",
  },
  removeBtn: {
    padding: "5px 8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "auto",
  },
  center: {
    textAlign: "center",
    padding: "4rem",
    color: "#888",
    fontSize: "15px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  itemModal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "700px",
    direction: "rtl",
    overflow: "hidden",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  itemModalContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "380px",
  },
  itemModalImg: { background: "#f5f7fa", minHeight: "300px" },
  itemModalDetails: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  itemModalName: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  },
  itemModalCode: { fontSize: "12px", color: "#aaa", fontFamily: "monospace" },
  itemModalPrice: { fontSize: "26px", fontWeight: 700, color: "#1D9E75" },
  itemModalInfo: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "12px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "5px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  infoLabel: { color: "#888" },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "560px",
    direction: "rtl",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
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
    fontSize: "20px",
    cursor: "pointer",
    color: "#888",
    position: "absolute",
    top: "12px",
    left: "12px",
  },
  modalBody: { padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 },
  emptyCart: { textAlign: "center", padding: "3rem" },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  cartImg: {
    width: "52px",
    height: "52px",
    borderRadius: "8px",
    background: "#f5f7fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  cartItemName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#1a1a1a",
    marginBottom: "3px",
  },
  cartItemPrice: { fontSize: "12px", color: "#888" },
  cartItemActions: { display: "flex", alignItems: "center", gap: "8px" },
  cartItemTotal: {
    fontWeight: 700,
    color: "#1D9E75",
    fontSize: "13px",
    minWidth: "90px",
    textAlign: "left",
  },
  summary: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "14px 16px",
    marginTop: "1rem",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "8px",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    flexShrink: 0,
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
  checkoutBtn: {
    padding: "9px 24px",
    background: "linear-gradient(135deg,#1D9E75,#0d6e50)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "10px",
    paddingBottom: "6px",
    borderBottom: "1px solid #f3f4f6",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
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
  payMethods: { display: "flex", gap: "10px", marginBottom: "1rem" },
  payBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all .15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  successBanner: {
    background: "#e8f5f0",
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    padding: "14px 18px",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  successTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#065f46",
    marginBottom: "2px",
  },
  successSub: { fontSize: "13px", color: "#047857" },
  closeSuccess: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    marginRight: "auto",
  },
};
