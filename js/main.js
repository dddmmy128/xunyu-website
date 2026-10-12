/* ==========================================================
   珣玗 XUNYU · 公共交互（首页版）
   复用 utils.js 的 toast / 珏力 / 购物车 / 用户态
   负责 Hero轮播 / 留证空间弹窗 / 购物车计数 / 移动菜单
   ========================================================== */
(function () {
  "use strict";

  /* ---------- 初始化显示 ---------- */
  window.setJue(window.getJue());
  window.setCart(window.getCart());

  /* ---------- 加入购物车（事件委托：推荐卡片由 recommend.js 动态渲染） ---------- */
  const productGrid = document.getElementById("productGrid");
  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-cart");
      if (!btn) return;
      const card = btn.closest(".product-card");
      const p = PRODUCTS.find(x => x.id === Number(card.dataset.id));
      if (!p) return;
      window.addCartItem(p, 1);
      window.recordInterest && window.recordInterest(p.cat, 2); // 加购行为权重更高
      window.toast(`已加入购物车，珏力 +${p.jue}（一玉为珣，双玉成珏）`, "success");
    });
  }

  document.getElementById("cartBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./pages/cart.html";
  });

  /* ---------- 首页留证空间入口弹窗 ---------- */
  const homeEvidenceBtn = document.getElementById("homeEvidenceBtn");
  const homeEvidenceModal = document.getElementById("homeEvidenceModal");
  if (homeEvidenceBtn && homeEvidenceModal) {
    const homeHotlineList = document.getElementById("homeEvidenceHotlineList");
    const openHomeModal = () => { homeEvidenceModal.hidden = false; };
    const closeHomeModal = () => {
      homeEvidenceModal.hidden = true;
      if (homeHotlineList) homeHotlineList.classList.remove("glow");
    };

    homeEvidenceBtn.addEventListener("click", openHomeModal);
    document.getElementById("homeEvidenceClose").addEventListener("click", closeHomeModal);
    homeEvidenceModal.addEventListener("click", (e) => {
      if (e.target === homeEvidenceModal) closeHomeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !homeEvidenceModal.hidden) closeHomeModal();
    });
    document.getElementById("homeNeedHelpBtn").addEventListener("click", () => {
      if (homeHotlineList) homeHotlineList.classList.add("glow");
      window.toast("求助入口已为你标亮：110 · 12338 · 12348——你并不孤单", "warn");
    });
    document.getElementById("homeEnterSpaceBtn").addEventListener("click", () => {
      window.location.href = "./pages/evidence.html";
    });
  }

  /* ---------- Hero 轮播 ---------- */
  const slides = Array.from(document.querySelectorAll("#slides .slide"));
  const dotsBox = document.getElementById("heroDots");
  let cur = 0, timer = null;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `第 ${i + 1} 张`);
    d.addEventListener("click", () => go(i));
    dotsBox.appendChild(d);
  });
  const dots = Array.from(dotsBox.children);

  function go(i) {
    slides[cur].classList.remove("active");
    dots[cur].classList.remove("active");
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add("active");
    dots[cur].classList.add("active");
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(cur + 1), 4500);
  }
  document.getElementById("heroPrev").addEventListener("click", () => go(cur - 1));
  document.getElementById("heroNext").addEventListener("click", () => go(cur + 1));
  dots[0].classList.add("active");
  restart();

  /* ---------- 移动端折叠菜单 ---------- */
  const navLinks = document.getElementById("navLinks");
  document.getElementById("hamburger").addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });
})();
