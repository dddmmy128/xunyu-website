/* ==========================================================
   珣玗 XUNYU · 她们的故事页交互
   故事投稿、渲染、本地存储、点赞
   ========================================================== */
(function () {
  "use strict";

  const STORIES_KEY = "xy_stories";
  const AVATAR_COLORS = ["#8A4FAF", "#E0779B", "#FF7A45", "#6B2D8E", "#4A7EC9", "#C9A4DC"];

  const getStories = () => window.LS.jsonGet(STORIES_KEY, []);
  const saveStories = (arr) => window.LS.jsonSet(STORIES_KEY, arr);

  /* ---------- 内置故事（首次访问时填充） ---------- */
  const BUILT_IN = [
    {
      id: 1727580000001,
      nickname: "夜行者小安",
      content: "以前下班走夜路总有些害怕，自从包里放了一个高分贝报警器，心理上踏实了很多。也想告诉姐妹们：防护工具不是焦虑，是我们对自己的温柔。",
      tag: "自我保护",
      date: "2026-09-25",
      liked: 12
    },
    {
      id: 1727580000002,
      nickname: "匿名",
      content: "在珣玗的留证空间里，我第一次把那段经历写了下来。不是为了报复谁，是为了让自己知道：那件事真的发生过，而我没有错。",
      tag: "互助经历",
      date: "2026-09-22",
      liked: 28
    },
    {
      id: 1727580000003,
      nickname: "法学生阿琳",
      content: "很多女性不知道，2023 年修订的《妇女权益保障法》已经明确把性骚扰写进了法律，学校、用人单位都有防治义务。了解法律，就是给自己多一件铠甲。",
      tag: "法律知识",
      date: "2026-09-20",
      liked: 15
    },
    {
      id: 1727580000004,
      nickname: "图书馆志愿者小林",
      content: "我们馆加入了暖流计划，在女卫生间放了免费经期用品。第一次看到有女孩悄悄取走一片时，我突然觉得这份‘不必解释’的体贴，真的很重要。",
      tag: "互助经历",
      date: "2026-09-18",
      liked: 34
    },
    {
      id: 1727580000005,
      nickname: "职场妈妈阿雯",
      content: "产假回来被调岗降薪，我打了 12338，又在法律援助帮助下申请了劳动仲裁。最后单位恢复了岗位。姐妹们，别忍，法律真的在保护我们。",
      tag: "法律知识",
      date: "2026-09-15",
      liked: 21
    },
    {
      id: 1727580000006,
      nickname: "山区支教老师",
      content: "我在教室后排放了一个‘安心盒’，女孩们再也不用因为突然来月经而请假翻山回家。一片卫生巾，有时候就是一堂不缺席的课。",
      tag: "互助经历",
      date: "2026-09-10",
      liked: 45
    }
  ];

  function ensureBuiltIn() {
    if (!getStories().length) saveStories(BUILT_IN);
  }

  function firstChar(str) {
    if (!str) return "?";
    const c = str.trim()[0];
    return /[a-zA-Z0-9一-龥]/.test(c) ? c : "她";
  }

  function renderStories() {
    const wall = document.getElementById("storyWall");
    const stories = getStories();
    if (!stories.length) {
      wall.innerHTML = `
        <div class="empty-wall">
          <p>还没有故事</p>
          <p style="font-size:13px;margin-top:8px;">成为第一个发声的人吧。</p>
        </div>`;
      return;
    }
    wall.innerHTML = stories.map((s, idx) => {
      const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      return `
        <div class="story-item" data-id="${s.id}">
          <div class="story-head">
            <div class="story-avatar" style="background:${color}">${firstChar(s.nickname)}</div>
            <div class="story-meta">
              <h3>${window.escapeHtml(s.nickname || "匿名")}</h3>
              <span>${s.date} · ${s.tag}</span>
            </div>
          </div>
          <span class="story-tag">${s.tag}</span>
          <p>${window.escapeHtml(s.content).replace(/\n/g, "<br>")}</p>
          <div class="story-actions">
            <button type="button" class="like-btn" data-id="${s.id}">
              ❤️ 给她加油 · ${s.liked || 0}
            </button>
          </div>
        </div>
      `;
    }).join("");

    wall.querySelectorAll(".like-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const list = getStories();
        const item = list.find(x => x.id === id);
        if (item) {
          item.liked = (item.liked || 0) + 1;
          saveStories(list);
          renderStories();
        }
      });
    });
  }

  /* ---------- 表单提交 ---------- */
  const form = document.getElementById("storyForm");
  const submitBtn = document.getElementById("storySubmitBtn");
  const loginTip = document.getElementById("storyLoginTip");

  function updateAuthState() {
    const user = window.getUser();
    if (user) {
      loginTip.hidden = true;
      submitBtn.disabled = false;
      submitBtn.textContent = "提交故事";
      document.getElementById("storyNickname").placeholder = user.nickname || "匿名";
    } else {
      loginTip.hidden = false;
      submitBtn.disabled = true;
      submitBtn.textContent = "登录后提交";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!window.isLoggedIn()) {
      window.toast("请先登录后再投稿", "warn");
      return;
    }
    const content = document.getElementById("storyContent").value.trim();
    if (!content) {
      window.toast("请填写故事内容", "warn");
      return;
    }
    const user = window.getUser();
    const nicknameInput = document.getElementById("storyNickname").value.trim();
    const tag = document.querySelector("input[name=storyTag]:checked").value;
    const list = getStories();
    list.unshift({
      id: Date.now(),
      nickname: nicknameInput || user.nickname || "匿名",
      content: content,
      tag: tag,
      date: new Date().toLocaleDateString("zh-CN"),
      liked: 0
    });
    saveStories(list);
    renderStories();
    form.reset();
    window.toast("你的故事已提交，感谢你的勇气", "success");
  });

  /* ---------- 移动菜单 ---------- */
  const navLinks = document.getElementById("navLinks");
  document.getElementById("hamburger").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });

  /* ---------- 初始化 ---------- */
  window.setJue(window.getJue());
  ensureBuiltIn();
  renderStories();
  updateAuthState();
  window.addEventListener("xy-auth-change", updateAuthState);
})();
