/* ==========================================================
   珣玗 XUNYU · 隐私安全位置选择器
   核心原则：用户手势触发、一次性定位、不存原始坐标、有回退、有明确 consent 文案
   ========================================================== */
(function () {
  "use strict";

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

  /* ---------- 最近城市匹配（模糊位置） ---------- */
  function nearestCity(lat, lng) {
    if (typeof CITY_CENTERS === "undefined" || !CITY_CENTERS.length) return null;
    let best = CITY_CENTERS[0];
    let bestDist = Infinity;
    CITY_CENTERS.forEach(c => {
      const d = haversine(lat, lng, c.lat, c.lng);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    });
    return best;
  }

  /* ---------- 一次性浏览器定位，返回模糊标签 ---------- */
  function requestGeoOnce() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("浏览器不支持定位"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const city = nearestCity(pos.coords.latitude, pos.coords.longitude);
          if (city) {
            resolve({ mode: "geo", label: `${city.name}市附近` });
          } else {
            resolve({ mode: "geo", label: "当前位置附近" });
          }
          // 原始坐标在函数返回后自然释放，不存储
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /* ---------- 手动选择省/市（回退方案） ---------- */
  const PROVINCE_CITY = {
    "北京市": ["北京市"],
    "上海市": ["上海市"],
    "天津市": ["天津市"],
    "重庆市": ["重庆市"],
    "广东省": ["广州市", "深圳市", "珠海市", "佛山市", "东莞市"],
    "浙江省": ["杭州市", "宁波市", "温州市", "嘉兴市"],
    "江苏省": ["南京市", "苏州市", "无锡市", "常州市"],
    "四川省": ["成都市", "绵阳市", "乐山市"],
    "湖北省": ["武汉市", "宜昌市", "襄阳市"],
    "陕西省": ["西安市", "咸阳市", "宝鸡市"],
    "山东省": ["济南市", "青岛市", "烟台市"],
    "河南省": ["郑州市", "洛阳市", "南阳市"],
    "湖南省": ["长沙市", "株洲市", "湘潭市"],
    "福建省": ["福州市", "厦门市", "泉州市"]
  };

  /* ---------- 在指定容器初始化位置选择 UI ---------- */
  window.LocationPicker = {
    current: null,

    init(containerId, onSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="location-picker" id="${containerId}_box">
          <button type="button" class="btn btn-outline btn-sm" id="${containerId}_toggle">+ 添加大致位置（可选）</button>
          <div class="location-options" id="${containerId}_options" hidden style="margin-top:10px;padding:14px;border-radius:10px;background:var(--lavender);">
            <p class="form-note" style="margin-bottom:10px;color:var(--purple-dark);">
              是否需要为本次留证添加位置？位置仅用于生成“城市/区域”描述，<b>不会保存原始经纬度</b>，也<b>不会后台持续追踪</b>。
            </p>
            <div class="location-btns" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
              <button type="button" class="btn btn-primary btn-sm" id="${containerId}_auto">📍 自动定位</button>
              <button type="button" class="btn btn-outline btn-sm" id="${containerId}_manual">✎ 手动选择区域</button>
            </div>
            <div class="location-manual" id="${containerId}_manualBox" hidden>
              <select id="${containerId}_province" style="margin-bottom:8px;width:100%;padding:9px;border-radius:8px;border:1.5px solid #E3D3EF;">
                <option value="">选择省/直辖市</option>
              </select>
              <select id="${containerId}_city" style="width:100%;padding:9px;border-radius:8px;border:1.5px solid #E3D3EF;">
                <option value="">选择城市</option>
              </select>
              <button type="button" class="btn btn-primary btn-sm" id="${containerId}_confirmManual" style="margin-top:8px;">确认区域</button>
            </div>
            <div class="location-result" id="${containerId}_result" style="margin-top:10px;font-size:13px;color:var(--purple);font-weight:600;"></div>
          </div>
        </div>
      `;

      const toggle = document.getElementById(`${containerId}_toggle`);
      const options = document.getElementById(`${containerId}_options`);
      const autoBtn = document.getElementById(`${containerId}_auto`);
      const manualBtn = document.getElementById(`${containerId}_manual`);
      const manualBox = document.getElementById(`${containerId}_manualBox`);
      const provinceSel = document.getElementById(`${containerId}_province`);
      const citySel = document.getElementById(`${containerId}_city`);
      const confirmManual = document.getElementById(`${containerId}_confirmManual`);
      const result = document.getElementById(`${containerId}_result`);

      toggle.addEventListener("click", () => {
        options.hidden = !options.hidden;
      });

      autoBtn.addEventListener("click", () => {
        autoBtn.textContent = "定位中…";
        autoBtn.disabled = true;
        requestGeoOnce()
          .then(loc => {
            this.current = loc;
            result.textContent = `已选择位置：${loc.label}（模糊）`;
            manualBox.hidden = true;
            if (onSelect) onSelect(loc);
            window.toast && window.toast("位置已模糊添加", "success");
          })
          .catch(err => {
            console.warn("定位失败", err);
            window.toast && window.toast("定位失败，请使用手动选择", "warn");
            manualBox.hidden = false;
          })
          .finally(() => {
            autoBtn.textContent = "📍 自动定位";
            autoBtn.disabled = false;
          });
      });

      manualBtn.addEventListener("click", () => {
        manualBox.hidden = !manualBox.hidden;
      });

      // 填充省份
      Object.keys(PROVINCE_CITY).forEach(prov => {
        const opt = document.createElement("option");
        opt.value = prov;
        opt.textContent = prov;
        provinceSel.appendChild(opt);
      });

      provinceSel.addEventListener("change", () => {
        citySel.innerHTML = '<option value="">选择城市</option>';
        const cities = PROVINCE_CITY[provinceSel.value] || [];
        cities.forEach(city => {
          const opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          citySel.appendChild(opt);
        });
      });

      confirmManual.addEventListener("click", () => {
        const prov = provinceSel.value;
        const city = citySel.value;
        if (!prov || !city) {
          window.toast && window.toast("请选择完整的省和城市", "warn");
          return;
        }
        const loc = { mode: "manual", label: `${prov} · ${city}` };
        this.current = loc;
        result.textContent = `已选择位置：${loc.label}（模糊）`;
        if (onSelect) onSelect(loc);
      });
    },

    getValue() {
      return this.current;
    },

    reset() {
      this.current = null;
    }
  };
})();
