/* ==========================================================
   珣玗 XUNYU · 购物车页交互
   商品列表渲染 / 数量调整 / 删除 / 结算跳转
   ========================================================== */
(function () {
  "use strict";

  const listEl = document.getElementById("cartList");
  const card = document.getElementById("cartCard");
  const summaryCount = document.getElementById("summaryCount");
  const summaryPrice = document.getElementById("summaryPrice");
  const summaryJue = document.getElementById("summaryJue");
  const summaryTotal = document.getElementById("summaryTotal");

  function render() {
    const items = window.getCartItems();
    if (!items.length) {
      listEl.innerHTML = `
        <div class="cart-empty">
          <p style="font-size:18px;margin-bottom:10px;">购物车还是空的</p>
          <p style="font-size:13px;">去安全商城挑选适合自己的防护用品吧。</p>
          <a class="btn btn-primary" href="./mall.html" style="margin-top:18px;display:inline-block;">去逛逛</a>
        </div>`;
      updateSummary(0, 0, 0);
      return;
    }

    listEl.innerHTML = items.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id) || {};
      const thumbSrc = item.image || product.image || "";
      const emoji = item.emoji || product.emoji || "🛍️";
      return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-thumb">
          ${thumbSrc ? `
            <img src="${window.assetPath(thumbSrc)}" alt="${window.escapeHtml(item.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <span class="cart-thumb-fallback" style="display:none;font-size:32px;">${emoji}</span>
          ` : `<span style="font-size:32px;">${emoji}</span>`}
        </div>
        <div class="cart-item-info">
          <h3>${window.escapeHtml(item.name)}</h3>
          <p>单价 ¥${item.price} · 每件 +${item.jue || 0} 珏力</p>
        </div>
        <div class="cart-qty">
          <button type="button" class="qty-minus" data-id="${item.id}">−</button>
          <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" aria-label="数量">
          <button type="button" class="qty-plus" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-price">¥${(item.price * item.quantity).toFixed(2)}</div>
        <button type="button" class="cart-item-remove" data-id="${item.id}">删除</button>
      </div>
    `}).join("");

    bindItemEvents();
    const totalCount = items.reduce((s, x) => s + x.quantity, 0);
    const totalPrice = items.reduce((s, x) => s + x.price * x.quantity, 0);
    const totalJue = items.reduce((s, x) => s + (x.jue || 0) * x.quantity, 0);
    updateSummary(totalCount, totalPrice, totalJue);
  }

  function updateSummary(count, price, jue) {
    summaryCount.textContent = count;
    summaryPrice.textContent = `¥${price.toFixed(2)}`;
    summaryJue.textContent = `${jue} 珏力`;
    summaryTotal.textContent = `¥${price.toFixed(2)}`;
  }

  function bindItemEvents() {
    listEl.querySelectorAll(".qty-minus").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const item = window.getCartItems().find(x => x.id === id);
        if (item) window.updateCartItemQuantity(id, item.quantity - 1);
        render();
      });
    });
    listEl.querySelectorAll(".qty-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const item = window.getCartItems().find(x => x.id === id);
        if (item) window.updateCartItemQuantity(id, item.quantity + 1);
        render();
      });
    });
    listEl.querySelectorAll(".cart-qty input").forEach(input => {
      input.addEventListener("change", () => {
        const id = Number(input.dataset.id);
        window.updateCartItemQuantity(id, input.value);
        render();
      });
    });
    listEl.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        window.removeCartItem(Number(btn.dataset.id));
        render();
        window.toast("已从购物车移除");
      });
    });
  }

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const items = window.getCartItems();
    if (!items.length) {
      window.toast("购物车为空，无法结算", "warn");
      return;
    }
    const links = items.map(i => `• ${i.name}：${i.link || "#"}`).join("\n");
    const ok = confirm(`请在下方的链接中逐条完成购买：\n\n${links}\n\n点击“确定”将在新标签页打开第一件商品。`);
    if (ok && items[0].link) {
      window.open(items[0].link, "_blank", "noopener");
    }
  });

  /* ---------- 移动菜单 ---------- */
  const navLinks = document.getElementById("navLinks");
  document.getElementById("hamburger").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });

  /* ---------- 初始化 ---------- */
  window.setJue(window.getJue());
  window.setCart(window.getCart());

  // 购物车页面需要登录才能查看
  if (!window.isLoggedIn()) {
    window.toast("查看购物车与结算需要先登录账户", "warn");
    setTimeout(() => {
      window.location.href = "./auth.html?redirect=./cart.html";
    }, 1200);
    return;
  }

  render();
})();
