/* ==========================================================
   珣玗 XUNYU · AI 安全画像（前端规则引擎）
   原理：基于 8 维标签的规则评分，生成场景化防护 bundle，
        并将偏好写回 recommend.js 的兴趣权重，实现可解释的
        "数据驱动选品"。
   ========================================================== */
(function () {
  "use strict";

  const STORAGE_KEY = "xy_safety_profile";

  const form = document.getElementById("profileForm");
  const result = document.getElementById("profileResult");
  if (!form || !result) return;

  const bundleNames = {
    防身防护: "独居守护包",
    居家安全: "居家安心包",
    出行安全: "差旅 / 夜行安心包",
    经期用品: "经期关怀包"
  };

  function scoreProfile(data) {
    const s = { 防身防护: 0, 居家安全: 0, 出行安全: 0, 经期用品: 0 };

    // 年龄
    if (data.age === "18-25") { s.防身防护 += 2; s.经期用品 += 2; }
    if (data.age === "26-35") { s.出行安全 += 2; s.防身防护 += 1; }
    if (data.age === "36-45") { s.居家安全 += 2; }

    // 职业
    if (data.job === "夜班") { s.防身防护 += 3; s.出行安全 += 2; }
    if (data.job === "学生") { s.防身防护 += 2; s.经期用品 += 1; }
    if (data.job === "白领") { s.出行安全 += 2; s.防身防护 += 1; }

    // 通勤
    if (["步行", "公交地铁"].includes(data.commute)) { s.防身防护 += 3; s.出行安全 += 1; }
    if (data.commute === "打车") { s.出行安全 += 2; s.防身防护 += 1; }
    if (data.commute === "自驾") { s.出行安全 += 1; }

    // 居住
    if (data.live === "独居") { s.防身防护 += 3; s.居家安全 += 2; }
    if (data.live === "合租") { s.居家安全 += 2; s.防身防护 += 1; }

    // 夜间外出
    if (data.night === "经常") { s.防身防护 += 3; s.出行安全 += 2; }
    if (data.night === "偶尔") { s.防身防护 += 1; }

    // 经期应急
    if (data.period === "经常") { s.经期用品 += 4; }
    if (data.period === "偶尔") { s.经期用品 += 2; }

    // 运动户外
    if (data.sport === "经常") { s.出行安全 += 2; s.防身防护 += 1; }

    // 预算
    if (data.budget === "100-300") { Object.keys(s).forEach(k => s[k] += 0.5); }
    if (data.budget === "300以上") { Object.keys(s).forEach(k => s[k] += 1); }

    const total = Object.values(s).reduce((a, b) => a + b, 0) || 1;
    const risk = Math.min(100, Math.round((total / 24) * 100));
    return { s, risk };
  }

  function recommendProducts(scores) {
    const cats = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(x => x[1] > 0)
      .map(x => x[0]);
    if (!cats.length) cats.push("防身防护");

    // 每个高需求品类取 1 件热度最高商品，最多 4 件
    const picks = [];
    for (const cat of cats) {
      const item = PRODUCTS.filter(p => p.cat === cat).sort((a, b) => b.hot - a.hot)[0];
      if (item && !picks.find(p => p.id === item.id)) picks.push(item);
      if (picks.length >= 4) break;
    }
    return { cats, picks };
  }

  function renderResult(data) {
    const { s, risk } = scoreProfile(data);
    const { cats, picks } = recommendProducts(s);
    const mainCat = cats[0];
    const bundle = bundleNames[mainCat] || "综合守护包";

    // 将画像偏好写回推荐权重，让首页"为你推荐"即时变化
    if (window.recordInterest) {
      cats.slice(0, 2).forEach(cat => window.recordInterest(cat, 4));
    }

    const riskColor = risk >= 70 ? "#E85F2A" : risk >= 40 ? "#FF7A45" : "#6B2D8E";

    result.innerHTML = `
      <div class="profile-result-head">
        <div class="profile-risk" style="--risk-color:${riskColor}">
          <span class="risk-num" style="color:${riskColor}">${risk}</span>
          <span class="risk-label">安全关注指数</span>
        </div>
        <div class="profile-bundle">
          <h3>为你生成：${bundle}</h3>
          <p>核心需求：${cats.join(" · ")} · 预算：${data.budget}</p>
        </div>
      </div>
      <div class="profile-products">
        ${picks.map(p => `
          <article class="profile-pick" data-id="${p.id}" data-cat="${p.cat}">
            <div class="pick-emoji">
              <img class="pick-img" src="${window.assetPath(p.image || "")}" alt="${window.escapeHtml(p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">
              <span class="pick-img-fallback" style="display:none;font-size:34px;" aria-hidden="true">${p.emoji}</span>
            </div>
            <div class="pick-info">
              <h4>${window.escapeHtml(p.name)}</h4>
              <p>${p.cat} · ¥${p.price} · +${p.jue} 珏力 · 已售 ${p.sold || 0}</p>
            </div>
            <button type="button" class="btn btn-primary btn-sm add-cart">加入购物车</button>
          </article>
        `).join("")}
      </div>
      <p class="profile-note">✦ 推荐基于你的 8 维标签由前端规则引擎实时计算，数据仅保存在本地，可随时点击下方“重新填写”清除。</p>
      <button type="button" class="btn btn-outline" id="resetProfile">重新填写</button>
    `;
    result.hidden = false;
    form.hidden = true;

    document.getElementById("resetProfile").addEventListener("click", () => {
      window.LS.remove(STORAGE_KEY);
      result.hidden = true;
      form.hidden = false;
      form.reset();
    });

    // 购物车事件委托
    result.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-cart");
      if (!btn) return;
      const card = btn.closest(".profile-pick");
      const p = PRODUCTS.find(x => x.id === Number(card.dataset.id));
      if (!p) return;
      window.addCartItem(p, 1);
      window.recordInterest && window.recordInterest(p.cat, 2);
      window.toast(`已加入 ${bundle}，珏力 +${p.jue}`);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      age: fd.get("age"),
      job: fd.get("job"),
      commute: fd.get("commute"),
      live: fd.get("live"),
      night: fd.get("night"),
      period: fd.get("period"),
      sport: fd.get("sport"),
      budget: fd.get("budget")
    };
    window.LS.jsonSet(STORAGE_KEY, data);
    renderResult(data);
    window.toast("安全画像已生成，首页推荐已同步更新");
  });

  // 页面加载时若已有画像，直接展示结果
  const saved = window.LS.jsonGet(STORAGE_KEY, null);
  if (saved) {
    renderResult(saved);
  }
})();
