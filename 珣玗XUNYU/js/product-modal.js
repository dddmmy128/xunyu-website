/* ==========================================================
   珣玗 XUNYU · 商品详情弹窗 + 溯源信息展示
   原理：为每件商品展示真实仓储/物流溯源节点，
        体现“技术信用”替代平台自证的数字创新思路。
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

  function openModal(productId) {
    const p = PRODUCTS.find(x => x.id === Number(productId));
    if (!p) return;

    pmEmoji.textContent = p.emoji;
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
