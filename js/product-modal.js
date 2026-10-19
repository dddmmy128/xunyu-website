/* ==========================================================
   珣玗 XUNYU · 商品详情弹窗 + 溯源 / 好评 / 使用方法 / 使用场景展示
   原理：为每件商品展示真实仓储/物流溯源节点、真实用户好评、
        清晰使用方法与典型场景，让“技术信用”替代平台自证。
   ========================================================== */
(function () {
  "use strict";

  const modal = document.getElementById("productModal");
  if (!modal) return;

  const closeBtns = [document.getElementById("pmClose"), document.getElementById("pmCloseBtn")];
  const pmEmoji = document.getElementById("pmEmoji");
  const pmTitle = document.getElementById("pmTitle");
  const pmMeta = document.getElementById("pmMeta");
  const pmWarehouse = document.getElementById("pmWarehouse");
  const pmNote = document.getElementById("pmNote");
  const pmTrace = document.getElementById("pmTrace");
  const pmAddCart = document.getElementById("pmAddCart");
  const pmBody = modal.querySelector(".pm-body");

  // 本地哈希：用于生成溯源节点哈希，标识物流节点
  const quickHash = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return "0x" + (h >>> 0).toString(16).padStart(8, "0");
  };

  function traceNodesFor(p) {
    const locMap = {
      "工厂生产": p.origin || "品牌工厂",
      "品牌海外工厂出厂": p.origin || "海外工厂",
      "品牌质检": "品牌质检中心",
      "京东仓质检": "京东仓库质检",
      "天猫仓质检": "天猫仓库质检",
      "京东国际仓质检": "京东国际仓库质检",
      "天猫仓入库": "天猫仓库",
      "京东仓入库": "京东仓库",
      "国际物流运输": "跨境物流",
      "中国海关清关": "中国海关",
      "平台发货": p.warehouse || "平台仓库"
    };
    return (p.trace && p.trace.length)
      ? p.trace.map((name) => ({ name, loc: locMap[name] || p.origin || "物流节点" }))
      : [
          { name: "仓库备货", loc: p.warehouse || "平台仓库" },
          { name: "质检出库", loc: "平台质检中心" },
          { name: "快递运输", loc: "国内配送" },
          { name: "送达用户", loc: "收货地址" }
        ];
  }

  function renderStars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function renderDetailSections(p) {
    if (!pmBody) return;
    // 更新溯源标题
    const heading = pmBody.querySelector("h4");
    if (heading) heading.textContent = "📦 商品来源 · 区块链溯源";

    // 移除旧动态区块（避免重复渲染）
    pmBody.querySelectorAll(".pm-detail-section").forEach(el => el.remove());

    const sections = [];

    // 用户好评
    if (p.reviews && p.reviews.length) {
      const avg = (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1);
      const totalReviews = p.totalReviews || p.reviews.length;
      sections.push(`
        <div class="pm-detail-section">
          <h4>💬 用户真实好评 <span class="pm-rating">${avg} 分 · 累计 ${totalReviews} 条评价（精选 ${p.reviews.length} 条）</span></h4>
          <div class="pm-reviews">
            ${p.reviews.map(r => `
              <div class="pm-review">
                <div class="pm-review-head">
                  <span class="pm-review-user">${window.escapeHtml(r.user)}</span>
                  <span class="pm-review-stars">${renderStars(r.rating)}</span>
                  <span class="pm-review-date">${window.escapeHtml(r.date)}</span>
                </div>
                <p>${window.escapeHtml(r.text)}</p>
              </div>
            `).join("")}
          </div>
        </div>
      `);
    }

    // 使用方法
    if (p.usage && p.usage.length) {
      sections.push(`
        <div class="pm-detail-section">
          <h4>📝 使用方法</h4>
          <ol class="pm-usage">
            ${p.usage.map(u => `<li>${window.escapeHtml(u)}</li>`).join("")}
          </ol>
        </div>
      `);
    }

    // 使用场景
    if (p.scenarios && p.scenarios.length) {
      sections.push(`
        <div class="pm-detail-section">
          <h4>🎯 适用场景</h4>
          <div class="pm-scenarios">
            ${p.scenarios.map(s => `<span class="pm-scenario-tag">${window.escapeHtml(s)}</span>`).join("")}
          </div>
        </div>
      `);
    }

    pmTrace.insertAdjacentHTML("afterend", sections.join(""));
  }

  function openModal(productId) {
    const p = PRODUCTS.find(x => x.id === Number(productId));
    if (!p) return;

    // 头部图片（真实图片优先，失败回退 emoji）
    if (pmEmoji) {
      pmEmoji.innerHTML = `
        <img class="pm-product-img" src="${window.assetPath(p.image || "")}" alt="${window.escapeHtml(p.name)}">
      `;
      const img = pmEmoji.querySelector(".pm-product-img");
      if (img) {
        img.onerror = () => { pmEmoji.innerHTML = `<span style="font-size:64px">${p.emoji}</span>`; };
      }
    }
    pmTitle.textContent = p.name;
    const shippingType = p.dutyFree ? "海外免税仓" : p.bonded ? "保税仓" : "国内发货";
    pmMeta.textContent = `${p.cat} · ¥${p.price} · +${p.jue} 珏力 · ${shippingType}`;

    const whType = p.dutyFree ? "海外免税仓" : p.bonded ? "保税仓" : "平台仓";
    if (pmWarehouse) {
      pmWarehouse.innerHTML = `
        <span class="pm-wh-tag">${whType}</span>
        <span class="pm-wh-name">${window.escapeHtml(p.warehouse || "平台仓库")}</span>
        <span class="pm-wh-origin">货源地：${window.escapeHtml(p.origin || "—")}</span>
      `;
    }
    if (pmNote) pmNote.textContent = p.note || "购买前请确认所在地法律法规";

    // 生成溯源链
    const nodes = traceNodesFor(p);
    let prevHash = "0x" + "0".repeat(8);
    pmTrace.innerHTML = nodes.map((node, idx) => {
      const data = `${p.id}-${node.name}-${node.loc}-${idx}`;
      const hash = quickHash(prevHash + data);
      prevHash = hash;
      const time = new Date(Date.now() - (nodes.length - idx) * 86400000).toLocaleDateString("zh-CN");
      return `
        <div class="trace-node">
          <div class="trace-dot"></div>
          <div class="trace-card">
            <div class="trace-top">
              <span class="trace-name">${window.escapeHtml(node.name)}</span>
              <span class="trace-time">${time}</span>
            </div>
            <div class="trace-loc">${window.escapeHtml(node.loc)}</div>
            <div class="trace-hash">哈希：${hash}</div>
          </div>
        </div>
      `;
    }).join("");

    // 渲染好评 / 使用方法 / 场景
    renderDetailSections(p);

    // 绑定加入购物车与立即购买
    pmAddCart.onclick = () => {
      window.addCartItem(p, 1);
      window.recordInterest && window.recordInterest(p.cat, 2);
      window.toast && window.toast(`已加入购物车，珏力 +${p.jue}`);
      closeModal();
    };
    // 更新弹窗内“立即购买”链接
    const pmBuy = document.getElementById("pmBuy");
    if (pmBuy) {
      pmBuy.href = p.link || "#";
      pmBuy.target = "_blank";
      pmBuy.rel = "noopener";
    }

    modal.hidden = false;
    window.recordInterest && window.recordInterest(p.cat, 1);
  }

  function closeModal() {
    modal.hidden = true;
  }

  window.openProductModal = openModal;

  // 点击商品卡片（非按钮区域）打开溯源弹窗
  ["productGrid", "mallGrid"].forEach((id) => {
    const grid = document.getElementById(id);
    if (grid) {
      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        if (!card || e.target.closest(".add-cart") || e.target.closest("a")) return;
        openModal(card.dataset.id);
      });
    }
  });

  closeBtns.forEach(btn => btn && btn.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
})();
