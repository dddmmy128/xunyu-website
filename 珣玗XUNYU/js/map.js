/* ==========================================================
   珣玗 XUNYU · 暖流计划页交互
   高德地图安心地图 / 捐赠 / 点位上报 / 透明公示 / 珏力体系
   ========================================================== */
(function () {
  "use strict";

  const DONATE_LOG_KEY = "xy_donate_log";
  const POINTS_KEY = "xy_map_points";

  const getDonations = () => window.LS.jsonGet(DONATE_LOG_KEY, []);
  const saveDonations = (arr) => window.LS.jsonSet(DONATE_LOG_KEY, arr);

  /* ---------- 初始化点位（优先使用 WARM_POINTS 真实坐标） ---------- */
  function getInitialPoints() {
    if (typeof WARM_POINTS !== "undefined" && WARM_POINTS.length) {
      return WARM_POINTS.map(p => ({
        name: p.name,
        addr: p.addr,
        lat: p.lat,
        lng: p.lng,
        status: p.status,
        distance: null
      }));
    }
    return [];
  }

  const getPoints = () => {
    const saved = window.LS.jsonGet(POINTS_KEY, null);
    const init = getInitialPoints();
    // 如果本地缓存的点位数量与当前数据不一致（如数据已扩展），自动重置为最新数据
    if (saved && saved.length === init.length) return saved;
    window.LS.jsonSet(POINTS_KEY, init);
    return init;
  };
  const savePoints = (arr) => window.LS.jsonSet(POINTS_KEY, arr);

  /* ---------- Haversine 距离（千米） ---------- */
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatDistance(km) {
    if (km < 1) return `距你 ${(km * 1000).toFixed(0)}m`;
    return `距你 ${km.toFixed(2)}km`;
  }

  /* ---------- 初始化珏力显示 ---------- */
  window.setJue(window.getJue());

  /* ---------- 附近点位列表 ---------- */
  function renderPoints(sortedPoints) {
    const list = document.getElementById("pointList");
    const points = sortedPoints || getPoints();
    list.innerHTML = points.map((p) => `
      <div class="point-item">
        <span class="point-icon">📍</span>
        <div class="point-info">
          <h4>${window.escapeHtml(p.name)} <small style="color:${p.status === "少量" ? "#FF7A45" : "#6B2D8E"}">${p.status}</small></h4>
          <p>${window.escapeHtml(p.addr)}${p.distance != null ? ` · ${formatDistance(p.distance)}` : ""}</p>
        </div>
      </div>
    `).join("");
  }

  /* ---------- 高德地图初始化 ---------- */
  let amap = null;
  let amapMarkers = [];
  let userMarker = null;
  let infoWindow = null;

  function initAmap() {
    if (typeof AMap === "undefined" || !AMap.Map) {
      document.getElementById("mapFallback").innerHTML = `
        <p>🗺 高德地图尚未配置有效 Key</p>
        <p style="font-size:12px;margin-top:6px;max-width:360px;line-height:1.6;">
          请在 pages/warm-current.html 中将 <code style="background:#fff;padding:2px 4px;border-radius:4px;">YOUR_AMAP_KEY</code> 替换为你申请的高德 Key 后刷新页面。
          在未显示地图时，你仍可点击右侧「定位并排序附近点位」按钮，系统会使用浏览器定位按真实距离排序列表。
        </p>
      `;
      return false;
    }

    const container = document.getElementById("mapContainer");
    container.innerHTML = "";

    // 以第一个点位或上海为中心
    const first = (typeof WARM_POINTS !== "undefined" && WARM_POINTS[0]) ? WARM_POINTS[0] : { lat: 31.2304, lng: 121.4737 };
    amap = new AMap.Map(container, {
      resizeEnable: true,
      zoom: 12,
      center: [first.lng, first.lat]
    });

    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });

    renderAmapMarkers(getPoints());

    // 地图加载后自动尝试定位用户（静默，失败不打扰）
    locateUser({ silent: true, centerMap: true, sortList: true });

    return true;
  }

  function renderAmapMarkers(points) {
    if (!amap) return;
    // 清除旧标记
    amap.remove(amapMarkers);
    amapMarkers = [];

    points.forEach(p => {
      const marker = new AMap.Marker({
        position: [p.lng, p.lat],
        title: p.name,
        map: amap,
        label: {
          content: `<div style="padding:2px 6px;font-size:11px;background:#fff;border-radius:4px;border:1px solid #6B2D8E;color:#6B2D8E;">${window.escapeHtml(p.name)}</div>`,
          offset: new AMap.Pixel(0, -30)
        }
      });
      marker.on("click", () => {
        infoWindow.setContent(`
          <div style="padding:8px;max-width:220px;">
            <h4 style="margin:0 0 6px;color:#6B2D8E;">${window.escapeHtml(p.name)}</h4>
            <p style="margin:0 0 4px;font-size:13px;color:#555;">${window.escapeHtml(p.addr)}</p>
            <p style="margin:0;font-size:12px;color:${p.status === "少量" ? "#FF7A45" : "#389E0D"}">状态：${p.status}</p>
          </div>
        `);
        infoWindow.open(amap, marker.getPosition());
      });
      amapMarkers.push(marker);
    });
  }

  function setUserLocation(lat, lng) {
    if (!amap) return;
    if (userMarker) {
      userMarker.setPosition([lng, lat]);
    } else {
      userMarker = new AMap.Marker({
        position: [lng, lat],
        map: amap,
        content: `<div style="width:18px;height:18px;border-radius:50%;background:#FF7A45;border:3px solid #fff;box-shadow:0 0 0 2px #FF7A45;"></div>`,
        title: "你的位置",
        offset: new AMap.Pixel(-9, -9)
      });
    }
    amap.setCenter([lng, lat]);
  }

  /* ---------- 真实定位并排序 ---------- */
  let userCoords = null; // 仅保存在内存中，页面刷新即释放

  function locateUser(options = {}) {
    const { silent = false, centerMap = true, sortList = true, onDone } = options;

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        if (!silent) window.toast("你的浏览器不支持定位功能", "warn");
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (amap && centerMap) setUserLocation(userCoords.lat, userCoords.lng);

          if (sortList) {
            const points = getPoints().map(p => ({
              ...p,
              distance: haversine(userCoords.lat, userCoords.lng, p.lat, p.lng)
            }));
            points.sort((a, b) => a.distance - b.distance);
            savePoints(points);
            renderPoints(points);
          }

          if (!silent) window.toast("已定位到你的位置，并按真实距离排序附近点位", "success");
          if (typeof onDone === "function") onDone(userCoords);
          resolve(userCoords);
        },
        (err) => {
          console.warn("定位失败", err);
          if (!silent) {
            window.toast("定位失败或权限被拒绝，已使用默认排序", "warn");
            renderPoints(getInitialPoints());
          }
          resolve(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  const locateBtn = document.getElementById("locateBtn");
  locateBtn.addEventListener("click", () => {
    locateBtn.textContent = "定位中…";
    locateBtn.disabled = true;
    locateUser({ silent: false }).then(() => {
      locateBtn.textContent = "📍 定位并排序附近点位";
      locateBtn.disabled = false;
    });
  });

  const myLocationBtn = document.getElementById("myLocationBtn");
  myLocationBtn.addEventListener("click", () => {
    myLocationBtn.disabled = true;
    locateUser({ silent: false, sortList: false }).then((coords) => {
      myLocationBtn.disabled = false;
      if (coords) {
        amap.setZoom(15);
        window.toast("已定位并居中到你的当前位置", "success");
      }
    });
  });

  /* ---------- 捐赠 Tab 切换 ---------- */
  const tabs = document.querySelectorAll("#donateTabs button");
  let donateMode = "实物";
  tabs.forEach((btn) => {
    if (btn.dataset.mode === donateMode) btn.classList.add("active");
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      donateMode = btn.dataset.mode;
      const input = document.getElementById("donateItem");
      const examples = {
        实物: "例如：日用卫生巾 10 包",
        资金: "例如：50 元",
        积分: "例如：捐赠 20 珏力"
      };
      input.placeholder = examples[donateMode];
    });
  });

  /* ---------- 捐赠表单 ---------- */
  document.getElementById("donateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const item = document.getElementById("donateItem").value;
    const region = document.getElementById("donateRegion").value;
    const user = window.getUser();
    const donor = user ? user.nickname || user.phone : "匿名爱心用户";
    const arr = getDonations();
    arr.unshift({
      mode: donateMode,
      item,
      region,
      donor,
      date: new Date().toLocaleDateString("zh-CN"),
      jue: 20
    });
    saveDonations(arr);
    window.addJue(20);
    renderTransparent();
    document.getElementById("donateForm").reset();
    window.toast("感谢你的捐赠——双玉成珏，珏力 +20", "success");
  });

  /* ---------- 上报新点位 ---------- */
  document.getElementById("reportForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("pointName").value;
    const addr = document.getElementById("pointAddr").value;
    const points = getPoints();
    points.unshift({ name: `${name}（审核中）`, addr, status: "待审核", distance: null });
    savePoints(points);
    renderPoints(points);
    document.getElementById("reportForm").reset();
    window.toast("点位已提交审核，审核通过后将显示在地图上", "success");
  });

  /* ---------- 透明公示 ---------- */
  function renderTransparent() {
    const log = getDonations();
    const container = document.getElementById("transparentList");
    if (!log.length) {
      container.innerHTML = "<p style=\"color:var(--text-light);font-size:13px;\">暂无公示记录</p>";
      return;
    }
    container.innerHTML = log.slice(0, 5).map((d) => `
      <div class="transparent-item">
        <span>${d.date} · ${d.donor} · ${d.mode} · ${window.escapeHtml(d.item)}</span>
        <span>投放：${window.escapeHtml(d.region)}</span>
      </div>
    `).join("");
  }

  /* ---------- 地理围栏提醒 ---------- */
  const geoToggle = document.getElementById("geoToggle");
  const geoStatus = document.getElementById("geoStatus");
  let geoActive = false;
  let geoWatchId = null;
  let notified = new Set();

  function checkGeoFence(lat, lng) {
    const points = getPoints().filter(p => p.status === "有货" || p.status === "少量");
    points.forEach(p => {
      const km = haversine(lat, lng, p.lat, p.lng);
      if (km < 0.5 && !notified.has(p.name)) {
        notified.add(p.name);
        window.toast(`📍 你附近有“${p.name}”，可领取免费经期用品`, "success");
      }
    });
  }

  function startGeoFence() {
    if (geoActive) return;
    if (!navigator.geolocation) {
      window.toast("你的浏览器不支持定位功能", "warn");
      return;
    }
    geoActive = true;
    geoToggle.textContent = "关闭附近点位提醒";
    geoToggle.classList.replace("btn-outline", "btn-primary");
    geoStatus.textContent = "当前状态：已开启，靠近点位会收到提醒";
    notified.clear();

    geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (amap) setUserLocation(lat, lng);
        checkGeoFence(lat, lng);
      },
      (err) => {
        console.warn("地理围栏定位失败", err);
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 }
    );
  }

  function stopGeoFence() {
    geoActive = false;
    if (geoWatchId != null) navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
    geoToggle.textContent = "开启附近点位提醒";
    geoToggle.classList.replace("btn-primary", "btn-outline");
    geoStatus.textContent = "当前状态：已关闭";
  }

  geoToggle.addEventListener("click", () => {
    if (geoActive) stopGeoFence(); else startGeoFence();
  });

  /* ---------- 移动菜单 ---------- */
  const navLinks = document.getElementById("navLinks");
  document.getElementById("hamburger").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });

  renderPoints();
  renderTransparent();
  initAmap();
})();
