/* ==========================================================
   珣玗 XUNYU · 登录态公共模块
   负责全局导航登录态渲染、登录/注册/退出
   注意：当前为本地体验版，仅在 localStorage 存储明文用户，正式上线必须由后端完成密码哈希、短信验证与 HTTPS 传输。
   ========================================================== */
(function () {
  "use strict";

  const AUTH_BOX_ID = "authBox";

  /* ---------- 渲染顶部登录态 ---------- */
  function renderAuthBox() {
    const boxes = document.querySelectorAll("#" + AUTH_BOX_ID);
    if (!boxes.length) return;

    const user = window.getUser && window.getUser();
    const html = user
      ? `<span class="auth-greeting">你好，${window.escapeHtml(user.nickname || user.phone)}</span>
         <button class="btn btn-ghost btn-sm" type="button" id="logoutBtn">退出</button>`
      : `<a class="btn btn-ghost btn-sm" href="${window.getRootPath && window.getRootPath()}pages/auth.html">登录 / 注册</a>`;

    boxes.forEach((box) => {
      box.innerHTML = html;
      const logoutBtn = box.querySelector("#logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          window.logout && window.logout();
          window.location.reload();
        });
      }
    });
  }

  /* ---------- 辅助：获取根路径 ---------- */
  window.getRootPath = function () {
    const path = window.location.pathname;
    return path.includes("/pages/") ? "../" : "";
  };

  /* ---------- 登录/注册页逻辑 ---------- */
  function initAuthPage() {
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginPanel = document.getElementById("loginPanel");
    const registerPanel = document.getElementById("registerPanel");

    if (!loginTab || !registerTab) return;

    function showLogin() {
      loginPanel.hidden = false;
      registerPanel.hidden = true;
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
    }
    function showRegister() {
      loginPanel.hidden = true;
      registerPanel.hidden = false;
      loginTab.classList.remove("active");
      registerTab.classList.add("active");
    }

    loginTab.addEventListener("click", showLogin);
    registerTab.addEventListener("click", showRegister);

    /* 登录 */
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = document.getElementById("loginPhone").value.trim();
      const pwd = document.getElementById("loginPwd").value;
      const users = window.LS.jsonGet("xy_users", {});
      const saved = users[phone];
      if (!saved || saved.pwd !== pwd) {
        window.toast("手机号或密码错误", "warn");
        return;
      }
      window.setUser({ phone, nickname: saved.nickname, token: saved.token, createdAt: saved.createdAt });
      window.toast(`欢迎回来，${saved.nickname || phone}`, "success");
      redirectAfterAuth();
    });

    /* 注册 */
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = document.getElementById("regPhone").value.trim();
      const nickname = document.getElementById("regNickname").value.trim() || "小玉";
      const pwd = document.getElementById("regPwd").value;
      const pwd2 = document.getElementById("regPwd2").value;

      if (!/^1\d{10}$/.test(phone)) {
        window.toast("请输入 11 位手机号", "warn");
        return;
      }
      if (pwd.length < 6) {
        window.toast("密码至少 6 位", "warn");
        return;
      }
      if (pwd !== pwd2) {
        window.toast("两次输入的密码不一致", "warn");
        return;
      }

      const users = window.LS.jsonGet("xy_users", {});
      if (users[phone]) {
        window.toast("该手机号已注册", "warn");
        return;
      }

      const token = "local-token-" + Math.random().toString(36).slice(2);
      const createdAt = new Date().toISOString();
      users[phone] = { phone, nickname, pwd, token, createdAt };
      window.LS.jsonSet("xy_users", users);
      window.setUser({ phone, nickname, token, createdAt });
      window.toast("注册成功——双玉成珏，欢迎加入", "success");
      redirectAfterAuth();
    });

    function redirectAfterAuth() {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "../index.html";
      setTimeout(() => { window.location.href = redirect; }, 600);
    }

    /* 手机号输入框实时校验 */
    document.querySelectorAll("input[type=tel]").forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 11);
      });
    });
  }

  /* ---------- 初始化 ---------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      renderAuthBox();
      initAuthPage();
    });
  } else {
    renderAuthBox();
    initAuthPage();
  }

  window.addEventListener("xy-auth-change", renderAuthBox);
})();
