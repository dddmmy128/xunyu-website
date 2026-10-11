/* ==========================================================
   珣玗 XUNYU · 法律宣传页交互
   目录滚动高亮 + FAQ 折叠
   ========================================================== */
(function () {
  "use strict";

  const tocLinks = document.querySelectorAll("#legalToc a");
  const sections = Array.from(tocLinks).map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const faqItems = document.querySelectorAll(".faq-item");

  /* ---------- FAQ 折叠 ---------- */
  faqItems.forEach(item => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  /* ---------- 目录滚动高亮 ---------- */
  function updateToc() {
    const scrollPos = window.scrollY + 100;
    let current = sections[0]?.id;
    for (const sec of sections) {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    }
    tocLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateToc();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateToc();
})();
