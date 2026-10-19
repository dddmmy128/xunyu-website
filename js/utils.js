/* ==========================================================
   珣玗 XUNYU · 公共工具层
   封装 localStorage、toast、HTML 转义、珏力、购物车、用户态
   供全站页面复用，避免重复代码
   ========================================================== */
(function () {
  "use strict";

  const LS_KEYS = {
    jue: "xy_jue",
    cart: "xy_cart",
    user: "xy_user",
    interests: "xy_interests",
    safetyProfile: "xy_safety_profile",
    unlocked: "xy_unlocked",
    evidence: "xy_evidence_entries",
    donateLog: "xy_donate_log",
    mapPoints: "xy_map_points",
    stories: "xy_stories"
  };

  /* ---------- localStorage 安全读写 ---------- */
  window.LS = {
    get: (k, fallback) => localStorage.getItem(k) ?? fallback,
    set: (k, v) => localStorage.setItem(k, String(v)),
    jsonGet: (k, fallback) => {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        console.warn("LS parse error", k, e);
        return fallback;
      }
    },
    jsonSet: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    remove: (k) => localStorage.removeItem(k)
  };

  /* ---------- Toast 全局提示 ---------- */
  let toastEl = null;
  let toastTimer = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.getElementById("toast");
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "toast";
      toastEl.className = "toast";
      toastEl.hidden = true;
      document.body.appendChild(toastEl);
    }
    return toastEl;
  }

  window.toast = function (msg, type = "") {
    const el = ensureToast();
    el.textContent = msg;
    el.className = "toast" + (type ? " " + type : "");
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
  };

  /* ---------- HTML 转义（防 XSS） ---------- */
  window.escapeHtml = function (s) {
    return (s || "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  };

  /* ---------- 资源路径解析（兼容首页与 pages/ 子页面） ---------- */
  window.assetPath = function (path) {
    if (!path || path.startsWith("http") || path.startsWith("data:") || path.startsWith("/")) return path;
    const inPages = location.pathname.includes("/pages/");
    return (inPages ? "../" : "") + path;
  };

  /* ---------- 用户态 ---------- */
  window.getUser = function () {
    return window.LS.jsonGet(LS_KEYS.user, null);
  };
  window.setUser = function (user) {
    window.LS.jsonSet(LS_KEYS.user, user);
    window.dispatchEvent(new CustomEvent("xy-auth-change", { detail: user }));
  };
  window.isLoggedIn = function () {
    return !!window.getUser();
  };
  window.logout = function () {
    window.LS.remove(LS_KEYS.user);
    window.dispatchEvent(new CustomEvent("xy-auth-change", { detail: null }));
  };

  /* ---------- 珏力 ---------- */
  window.getJue = function () {
    return Number(window.LS.get(LS_KEYS.jue, 60));
  };
  window.setJue = function (v) {
    const n = Math.max(0, Number(v) || 0);
    window.LS.set(LS_KEYS.jue, n);
    const badges = document.querySelectorAll("#jueValue");
    badges.forEach((b) => { if (b) b.textContent = n; });
    return n;
  };
  window.addJue = function (n, msg) {
    const result = window.setJue(window.getJue() + n);
    if (msg) window.toast(msg, "success");
    return result;
  };

  /* ---------- 购物车 ---------- */
  const CART_ITEMS_KEY = "xy_cart_items";

  window.getCartItems = function () {
    return window.LS.jsonGet(CART_ITEMS_KEY, []);
  };
  window.setCartItems = function (items) {
    const valid = items.filter(x => x.quantity > 0);
    window.LS.jsonSet(CART_ITEMS_KEY, valid);
    const total = valid.reduce((sum, x) => sum + x.quantity, 0);
    window.LS.set(LS_KEYS.cart, total);
    const counts = document.querySelectorAll("#cartCount");
    counts.forEach((c) => { if (c) c.textContent = total; });
    return valid;
  };
  window.addCartItem = function (product, qty = 1) {
    const items = window.getCartItems();
    const existing = items.find(x => x.id === product.id);
    const addedQty = Math.max(1, Number(qty) || 1);
    if (existing) {
      existing.quantity += addedQty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        jue: product.jue,
        emoji: product.emoji,
        image: product.image || "",
        link: product.link || "#",
        quantity: addedQty
      });
    }
    const result = window.setCartItems(items);
    // 购物车与珏力同步：新增商品按数量增加珏力
    window.addJue((product.jue || 0) * addedQty);
    return result;
  };
  window.removeCartItem = function (id) {
    const items = window.getCartItems();
    const item = items.find(x => x.id === id);
    if (item) {
      // 购物车与珏力同步：移除商品扣减对应珏力
      window.addJue(-(item.jue || 0) * item.quantity);
    }
    return window.setCartItems(items.filter(x => x.id !== id));
  };
  window.updateCartItemQuantity = function (id, qty) {
    const items = window.getCartItems();
    const item = items.find(x => x.id === id);
    if (!item) return window.setCartItems(items);
    const oldQty = item.quantity;
    const newQty = Math.max(0, Number(qty) || 0);
    const delta = newQty - oldQty;
    item.quantity = newQty;
    // 购物车与珏力同步：数量变化按比例增减珏力
    if (delta !== 0) window.addJue((item.jue || 0) * delta);
    return window.setCartItems(items);
  };

  // 兼容旧接口：getCart/setCart/addCart 仅操作总件数
  window.getCart = function () {
    return Number(window.LS.get(LS_KEYS.cart, 0));
  };
  window.setCart = function (v) {
    const n = Math.max(0, Number(v) || 0);
    window.LS.set(LS_KEYS.cart, n);
    const counts = document.querySelectorAll("#cartCount");
    counts.forEach((c) => { if (c) c.textContent = n; });
    return n;
  };
  window.addCart = function (n) {
    return window.setCart(window.getCart() + n);
  };

  /* ---------- 兴趣标签 ---------- */
  window.recordInterest = function (cat, weight) {
    const map = window.LS.jsonGet(LS_KEYS.interests, {});
    map[cat] = (map[cat] || 0) + weight;
    window.LS.jsonSet(LS_KEYS.interests, map);
  };

  /* ---------- 常量导出 ---------- */
  window.XY_KEYS = LS_KEYS;
})();
