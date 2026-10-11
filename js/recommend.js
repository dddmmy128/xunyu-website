/* ==========================================================
   珣玗 XUNYU · 智能推荐（标签加权计分算法）
   原理：记录用户浏览 / 加购的品类标签并加权，
        推荐分 = 商品基础热度 + 品类兴趣权重 × 系数
   ========================================================== */
(function () {
  "use strict";

  const KEY = "xy_interests"; // { 品类: 权重 }

  const getInterests = () => window.LS.jsonGet(KEY, {});

  // 对外暴露：记录一次品类兴趣（main.js 加购时也会调用）
  window.recordInterest = function (cat, n = 1) {
    const o = getInterests();
    o[cat] = (o[cat] || 0) + n;
    window.LS.jsonSet(KEY, o);
  };

  const scoreOf = (p) => p.hot + (getInterests()[p.cat] || 0) * 8;

  const grid = document.getElementById("productGrid");

  function render() {
    const top = [...PRODUCTS].sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, 4);
    grid.innerHTML = top.map((p, i) => `
      <article class="product-card" data-id="${p.id}" data-cat="${p.cat}">
        <div class="product-img ${GRADIENTS[i % GRADIENTS.length]}">
          <span aria-hidden="true">${p.emoji}</span>
          <span class="p-tag">${p.dutyFree ? "海外免税仓" : p.bonded ? "保税仓" : "正品溯源"}</span>
        </div>
        <div class="product-body">
          <h3>${window.escapeHtml(p.name)}</h3>
          <p class="p-meta"><span class="price">¥${p.price}</span><span class="p-jue">+${p.jue} 珏力</span></p>
          <p class="p-note">${window.escapeHtml(p.warehouse)} · 请确认所在地法规</p>
          <button class="btn btn-primary btn-sm add-cart" type="button">加入购物车</button>
        </div>
      </article>
    `).join("");
  }

  // 点击商品卡片（非按钮）：浏览行为 → 该品类权重 +1，推荐即时更新
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card || e.target.closest(".add-cart")) return;
    window.recordInterest(card.dataset.cat, 1);
    render();
    window.toast(`已根据你的浏览偏好更新推荐（${card.dataset.cat}）`);
  });

  // 兴趣分类标签：点击 → 权重 +3（记录主动浏览该品类）
  document.getElementById("interestTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cat]");
    if (!btn) return;
    document.querySelectorAll("#interestTabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    window.recordInterest(btn.dataset.cat, 3);
    render();
    window.toast(`推荐已向你偏好的「${btn.dataset.cat}」倾斜`);
  });

  render();
})();
