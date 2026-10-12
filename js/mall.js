/* ==========================================================
   珣玗 XUNYU · 安全商城页交互
   海外免税仓 / 保税仓筛选、商品渲染、购物车
   ========================================================== */
(function () {
  "use strict";

  const grid = document.getElementById("mallGrid");
  const warehouseList = document.getElementById("warehouseList");
  const filterBtns = document.querySelectorAll("#mallFilter button");

  /* ---------- 渲染商品 ---------- */
  function renderProducts(filter) {
    let list = PRODUCTS;
    if (filter === "dutyFree") list = PRODUCTS.filter(p => p.dutyFree);
    else if (filter === "bonded") list = PRODUCTS.filter(p => p.bonded);
    else if (["防身防护", "居家安全", "出行安全", "经期用品"].includes(filter)) {
      list = PRODUCTS.filter(p => p.cat === filter);
    }

    grid.innerHTML = list.map((p, idx) => {
      const grad = GRADIENTS[idx % GRADIENTS.length];
      const tags = [];
      if (p.dutyFree) tags.push({ cls: "dutyfree", text: "海外免税仓" });
      else if (p.bonded) tags.push({ cls: "bonded", text: "保税仓" });
      tags.push({ cls: "trace", text: "溯源可查" });

      return `
        <div class="mall-card product-card" data-id="${p.id}">
          <div class="product-img ${grad}">
            <span style="font-size:58px;">${p.emoji}</span>
            <span class="p-tag">${p.cat}</span>
          </div>
          <div class="product-body">
            <h3>${window.escapeHtml(p.name)}</h3>
            <div class="mall-tags">
              ${tags.map(t => `<span class="mall-tag ${t.cls}">${t.text}</span>`).join("")}
            </div>
            <div class="p-meta" style="margin-top:10px;">
              <span class="price">¥${p.price}</span>
              <span class="p-jue">+${p.jue} 珏力</span>
            </div>
            <p class="p-note">${window.escapeHtml(p.warehouse)}</p>
            <div style="display:flex;gap:8px;margin-top:auto;">
              <button type="button" class="btn btn-primary btn-sm add-cart" data-id="${p.id}" style="flex:1;">加入购物车</button>
              <a class="btn btn-outline btn-sm" href="${p.link || '#'}" target="_blank" rel="noopener" data-id="${p.id}" style="flex:1;text-align:center;" onclick="event.stopPropagation();">立即购买</a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  /* ---------- 渲染仓库信息 ---------- */
  function renderWarehouses() {
    warehouseList.innerHTML = WAREHOUSES.map(w => `
      <div class="warehouse-card">
        <span class="wh-type">${w.type}</span>
        <h4>${window.escapeHtml(w.name)}</h4>
        <p style="color:var(--purple);font-weight:600;margin-bottom:4px;">${window.escapeHtml(w.location)}</p>
        <p>${window.escapeHtml(w.desc)}</p>
      </div>
    `).join("");
  }

  /* ---------- 筛选绑定 ---------- */
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.dataset.filter);
    });
  });

  /* ---------- 加入购物车（事件委托） ---------- */
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-cart");
    if (btn) {
      e.stopPropagation();
      const p = PRODUCTS.find(x => x.id === Number(btn.dataset.id));
      if (!p) return;
      window.addCartItem(p, 1);
      window.recordInterest && window.recordInterest(p.cat, 2);
      window.toast(`已加入购物车，珏力 +${p.jue}`, "success");
      return;
    }
  });

  /* ---------- 购物车入口 ---------- */
  document.getElementById("cartBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./cart.html";
  });

  /* ---------- 移动菜单 ---------- */
  const navLinks = document.getElementById("navLinks");
  document.getElementById("hamburger").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });

  /* ---------- 初始化 ---------- */
  window.setJue(window.getJue());
  window.setCart(window.getCart());
  renderProducts("all");
  renderWarehouses();
})();
