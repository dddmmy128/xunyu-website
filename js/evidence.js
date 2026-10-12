/* ==========================================================
   珣玗 XUNYU · 留证空间页交互
   进入询问 / 留证表单 / 时间轴 / 求助通道
   ========================================================== */
(function () {
  "use strict";

  const UNLOCK_KEY = "xy_unlocked";
  const UNLOCK_NEED = 0; // 留证空间可直接进入，无需累积珏力
  const EVIDENCE_KEY = "xy_evidence_entries";

  const getEntries = () => window.LS.jsonGet(EVIDENCE_KEY, []);
  const saveEntries = (arr) => window.LS.jsonSet(EVIDENCE_KEY, arr);

  // 本地哈希时间戳：用于验证证据记录未被篡改（正式版本可升级为 SHA-256 + 区块链存证）
  const quickHash = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return "0x" + (h >>> 0).toString(16).padStart(8, "0");
  };

  /* ---------- 初始化：珏力与解锁状态 ---------- */
  const jue = window.getJue();
  window.setJue(jue);
  const unlocked = window.LS.get(UNLOCK_KEY) === "1" || jue >= UNLOCK_NEED;
  if (unlocked) window.LS.set(UNLOCK_KEY, "1");

  const body = document.getElementById("evidenceBody");
  const overlay = document.getElementById("lockOverlay");
  const lockBar = document.getElementById("lockBar");
  const lockText = document.getElementById("lockText");
  const statusText = document.getElementById("jueStatusText");
  const mainEl = document.getElementById("evidenceMain");
  const revealMain = () => { if (mainEl) mainEl.classList.add("revealed"); };

  if (statusText) {
    statusText.textContent = `留证空间已开放 · 当前珏力 ${jue}`;
  }

  const startBtn = document.getElementById("startEvidenceBtn");
  if (startBtn) startBtn.style.display = "inline-block";

  // 始终开放留证空间，不再使用覆盖层锁定
  overlay.hidden = true;

  /* ---------- 进入留证空间询问弹窗 ---------- */
  const modal = document.getElementById("entryModal");
  const hotlineList = document.getElementById("entryHotlineList");
  const ENTERED_KEY = "xy_evidence_entered";
  const openModal = () => { modal.hidden = false; };
  const closeModal = () => {
    modal.hidden = true;
    hotlineList.classList.remove("glow");
    revealMain();
  };

  // 首次进入时自动弹出询问弹窗，选择“继续留证”后记录状态并展示表单
  if (window.LS.get(ENTERED_KEY) !== "1") {
    openModal();
  } else {
    revealMain();
  }

  if (startBtn) {
    startBtn.textContent = "进入留证空间";
    startBtn.addEventListener("click", openModal);
  }

  document.getElementById("entryClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  document.getElementById("needHelpBtn").addEventListener("click", () => {
    hotlineList.classList.add("glow");
    window.toast("求助入口已为你标亮：110 · 12338 · 12348——你并不孤单", "warn");
  });
  document.getElementById("enterSpaceBtn").addEventListener("click", () => {
    window.LS.set(ENTERED_KEY, "1");
    closeModal();
    window.toast("留证工具已开放，请妥善保管你的记录", "success");
  });

  /* ---------- 移动菜单 ---------- */
  const navLinks = document.getElementById("navLinks");
  document.getElementById("hamburger").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });

  /* ---------- 隐私位置选择器 ---------- */
  if (window.LocationPicker) {
    window.LocationPicker.init("locationPicker");
  }

  /* ---------- 留证表单 ---------- */
  const form = document.getElementById("evidenceForm");
  const SAVE_COST = 25; // 保存一条留证消耗 25 珏力（20-30 区间）
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // 查看留证空间无需门槛；保存留证需要登录并消耗一定珏力
      if (!window.isLoggedIn()) {
        window.toast("保存留证需要先登录账户，以确保记录安全归属", "warn");
        setTimeout(() => {
          window.location.href = "./auth.html?redirect=./evidence.html";
        }, 1200);
        return;
      }
      if (window.getJue() < SAVE_COST) {
        window.toast(`保存留证需要 ${SAVE_COST} 珏力，当前不足，可通过购物或捐赠获取`, "warn");
        return;
      }
      const files = Array.from(document.getElementById("evFile").files).map(f => f.name);
      const createdAt = new Date().toISOString();
      const location = window.LocationPicker ? window.LocationPicker.getValue() : null;
      const entryRaw = {
        id: Date.now(),
        type: document.getElementById("evType").value,
        date: document.getElementById("evDate").value,
        title: document.getElementById("evTitle").value,
        desc: document.getElementById("evDesc").value,
        files: files,
        location: location,
        createdAt: createdAt
      };
      const entry = {
        ...entryRaw,
        hash: quickHash(JSON.stringify(entryRaw))
      };
      const list = getEntries();
      list.unshift(entry);
      saveEntries(list);
      window.addJue(-SAVE_COST); // 保存留证扣除积分
      renderTimeline();
      form.reset();
      if (window.LocationPicker) window.LocationPicker.reset();
      const locText = location ? `（位置：${location.label}）` : "";
      window.toast(`留证已保存${locText}，消耗 ${SAVE_COST} 珏力。请记住：这不是你的错。`, "success");
    });
  }

  /* ---------- 时间轴渲染 ---------- */
  const listEl = document.getElementById("timelineList");
  function renderTimeline() {
    const entries = getEntries();
    if (!entries.length) {
      listEl.innerHTML = `
        <div style="text-align:center;color:var(--text-light);padding:30px 0;">
          <p>暂无留证记录</p>
          <p style="font-size:12px;margin-top:6px;">每一次记录，都是保护自己的一步。</p>
        </div>`;
      return;
    }
    listEl.innerHTML = entries.map(item => {
      const d = new Date(item.date);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const fileStr = item.files.length ? `附件：${item.files.join("、")}` : "无附件";
      const raw = {
        id: item.id, type: item.type, date: item.date,
        title: item.title, desc: item.desc, files: item.files,
        location: item.location, createdAt: item.createdAt
      };
      const currentHash = quickHash(JSON.stringify(raw));
      const intact = currentHash === item.hash;
      const locHtml = item.location
        ? `<div class="timeline-location">📍 位置：${window.escapeHtml(item.location.label)}（模糊）</div>`
        : "";
      return `
        <div class="timeline-item" data-id="${item.id}">
          <div class="timeline-date"><span>${month}月</span>${day}日</div>
          <div class="timeline-content">
            <h3>${window.escapeHtml(item.title)} <small style="color:var(--orange)">[${item.type}]</small></h3>
            <p>${window.escapeHtml(item.desc || "未填写详细经过")}</p>
            ${locHtml}
            <div class="timeline-files">${fileStr}</div>
            <div class="timeline-hash">
              <span>哈希时间戳：${item.hash || "—"}</span>
              <button type="button" class="btn btn-sm btn-ghost verify-hash">${intact ? "✓ 完整性校验通过" : "✗ 疑似被篡改"}</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // 绑定校验按钮
    listEl.querySelectorAll(".verify-hash").forEach(btn => {
      btn.addEventListener("click", () => {
        const itemId = Number(btn.closest(".timeline-item").dataset.id);
        const item = getEntries().find(x => x.id === itemId);
        if (!item) return;
        const raw = {
          id: item.id, type: item.type, date: item.date,
          title: item.title, desc: item.desc, files: item.files,
          location: item.location, createdAt: item.createdAt
        };
        const ok = quickHash(JSON.stringify(raw)) === item.hash;
        window.toast(ok ? "完整性校验通过：记录未被篡改" : "警告：记录内容可能已被修改", ok ? "success" : "warn");
      });
    });
  }

  renderTimeline();
})();
