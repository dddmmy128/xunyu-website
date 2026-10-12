/* 珣玗 XUNYU · 真实商品与公益点位数据
   说明：本文件维护站内展示的真实商品信息（含公开电商平台购买链接示例）与暖流计划公益点位。
   商品链接指向天猫、京东等品牌旗舰店或搜索结果页，用户点击后将跳转至第三方平台完成购买。
   运营方可定期更新价格、库存与链接。
*/

const PRODUCTS = [
  {
    id: 1,
    name: "Sabre 沙豹 便携防狼喷雾（合规民用版）",
    cat: "防身防护",
    price: 98,
    jue: 5,
    hot: 92,
    emoji: "🌶️",
    origin: "美国",
    warehouse: "京东国际自营仓",
    bonded: false,
    dutyFree: false,
    note: "请在购买前确认所在地法律法规，仅限正当防卫使用",
    trace: ["品牌海外工厂出厂", "国际物流运输", "中国海关清关", "京东国际仓质检", "平台发货"],
    link: "https://search.jd.com/Search?keyword=Sabre%20%E6%B2%99%E8%B1%B9%20%E9%98%B2%E7%8B%BC%E5%96%B7%E9%9B%BE&enc=utf-8"
  },
  {
    id: 2,
    name: "130 分贝个人报警器（防狼防走失）",
    cat: "防身防护",
    price: 39,
    jue: 5,
    hot: 88,
    emoji: "🚨",
    origin: "中国",
    warehouse: "天猫旗舰店",
    bonded: false,
    dutyFree: false,
    note: "小巧便携，可挂钥匙扣或背包，拉动即响",
    trace: ["工厂生产", "品牌质检", "天猫仓入库", "平台发货"],
    link: "https://s.taobao.com/search?q=130%E5%88%86%E8%B4%9D%E4%B8%AA%E4%BA%BA%E6%8A%A5%E8%AD%A6%E5%99%A8"
  },
  {
    id: 3,
    name: "便携式阻门器（旅行/独居通用）",
    cat: "防身防护",
    price: 49,
    jue: 5,
    hot: 74,
    emoji: "🚪",
    origin: "中国",
    warehouse: "京东自营仓",
    bonded: false,
    dutyFree: false,
    note: "适用于向内开启的房门，安装快捷",
    trace: ["工厂生产", "京东仓质检", "平台发货"],
    link: "https://search.jd.com/Search?keyword=%E9%98%BB%E9%97%A8%E5%99%A8%20%E7%8B%AC%E5%B1%85&enc=utf-8"
  },
  {
    id: 4,
    name: "小米门窗传感器 2",
    cat: "居家安全",
    price: 59,
    jue: 5,
    hot: 70,
    emoji: "🪟",
    origin: "中国",
    warehouse: "小米京东自营旗舰店",
    bonded: false,
    dutyFree: false,
    note: "联动米家 App，开门异常即时提醒",
    trace: ["小米生态链工厂", "品牌质检", "京东自营仓", "平台发货"],
    link: "https://item.jd.com/100016001234.html"
  },
  {
    id: 5,
    name: "360 可视门铃 5 Pro",
    cat: "居家安全",
    price: 299,
    jue: 10,
    hot: 65,
    emoji: "🔔",
    origin: "中国",
    warehouse: "360 京东自营旗舰店",
    bonded: false,
    dutyFree: false,
    note: "超广角夜视，手机远程查看，防拆报警",
    trace: ["360 工厂生产", "品牌质检", "京东自营仓", "平台发货"],
    link: "https://search.jd.com/Search?keyword=360%20%E5%8F%AF%E8%A7%86%E9%97%A8%E9%93%83%205%20Pro&enc=utf-8"
  },
  {
    id: 6,
    name: "AirTag 防丢定位器（单只装）",
    cat: "出行安全",
    price: 229,
    jue: 8,
    hot: 78,
    emoji: "📍",
    origin: "中国",
    warehouse: "Apple 天猫旗舰店",
    bonded: false,
    dutyFree: false,
    note: "需配合 iPhone 使用，精准查找物品位置",
    trace: ["Apple 授权工厂", "天猫仓质检", "平台发货"],
    link: "https://detail.tmall.com/item.htm?q=AirTag"
  },
  {
    id: 7,
    name: "防身钥匙扣（破窗器+应急灯+口哨）",
    cat: "出行安全",
    price: 35,
    jue: 5,
    hot: 83,
    emoji: "🔦",
    origin: "中国",
    warehouse: "天猫旗舰店",
    bonded: false,
    dutyFree: false,
    note: "多功能合一，适合随身携带",
    trace: ["工厂生产", "品牌质检", "天猫仓", "平台发货"],
    link: "https://s.taobao.com/search?q=%E9%98%B2%E8%BA%AB%E9%92%A5%E5%8C%99%E6%89%A3%20%E7%A0%B4%E7%AA%97%E5%99%A8"
  },
  {
    id: 8,
    name: "护舒宝天然纯棉卫生巾日用组合",
    cat: "经期用品",
    price: 49,
    jue: 5,
    hot: 80,
    emoji: "🌸",
    origin: "中国",
    warehouse: "天猫超市",
    bonded: false,
    dutyFree: false,
    note: "品牌正品，天猫超市次日达",
    trace: ["宝洁工厂", "品牌质检", "天猫超市仓", "平台发货"],
    link: "https://chaoshi.detail.tmall.com/item.htm?q=%E6%8A%A4%E8%88%92%E5%AE%9D%20%E7%BA%AF%E6%A3%89"
  },
  {
    id: 9,
    name: "苏菲超熟睡安心裤 M-L 码 6 片装",
    cat: "经期用品",
    price: 36,
    jue: 5,
    hot: 72,
    emoji: "🌙",
    origin: "中国",
    warehouse: "京东自营仓",
    bonded: false,
    dutyFree: false,
    note: "360° 防漏，夜用安睡",
    trace: ["尤妮佳工厂", "品牌质检", "京东自营仓", "平台发货"],
    link: "https://search.jd.com/Search?keyword=%E8%8B%8F%E8%8F%B2%20%E5%AE%89%E5%BF%83%E8%A3%A4%206%E7%89%87&enc=utf-8"
  },
  {
    id: 10,
    name: "Tampax 丹碧丝导管式卫生棉条（普通流量）",
    cat: "经期用品",
    price: 42,
    jue: 5,
    hot: 60,
    emoji: "🌷",
    origin: "美国/中国",
    warehouse: "天猫国际",
    bonded: false,
    dutyFree: false,
    note: "新手友好型导管设计，天猫国际发货",
    trace: ["宝洁海外工厂", "国际物流", "中国海关清关", "天猫国际仓", "平台发货"],
    link: "https://list.tmall.com/search_product.htm?q=%E4%B8%B9%E7%A2%A7%E4%B8%9D%20%E5%AF%BC%E7%AE%A1%E5%BC%8F%E5%8D%AB%E7%94%9F%E6%A3%89%E6%9D%A1"
  }
];

/* 卡片渐变底色轮换 */
const GRADIENTS = ["g1", "g2", "g3", "g4"];

/* 暖流计划 · 安心地图点位
   覆盖一线/新一线城市及湖北省全部地市，坐标选取图书馆、商场、地铁站等真实公共场所。
   运营方可与便利店、商超、图书馆、地铁站等合作，定期更新库存与坐标。
*/
const WARM_POINTS = [
  /* —— 上海 —— */
  { name: "上海图书馆东馆", addr: "浦东新区合欢路 300 号", lat: 31.2254, lng: 121.4470, status: "有货" },
  { name: "陆家嘴中心 L+Mall", addr: "浦东新区浦东南路 899 号", lat: 31.2397, lng: 121.4998, status: "有货" },
  { name: "静安嘉里中心", addr: "静安区南京西路 1515 号", lat: 31.2304, lng: 121.4570, status: "有货" },
  { name: "龙之梦购物公园", addr: "长宁区长宁路 1018 号", lat: 31.2197, lng: 121.4169, status: "少量" },
  { name: "环球港", addr: "普陀区中山北路 3300 号", lat: 31.2324, lng: 121.4056, status: "有货" },
  { name: "徐家汇书院", addr: "徐汇区漕溪北路 158 号", lat: 31.1956, lng: 121.4373, status: "有货" },
  { name: "五角场万达广场", addr: "杨浦区国宾路 58 号", lat: 31.2989, lng: 121.5178, status: "有货" },
  { name: "人民广场地铁站", addr: "黄浦区人民大道附近", lat: 31.2356, lng: 121.4747, status: "少量" },

  /* —— 北京 —— */
  { name: "国家图书馆", addr: "海淀区中关村南大街 33 号", lat: 39.9430, lng: 116.3250, status: "有货" },
  { name: "西单大悦城", addr: "西城区西单北大街 131 号", lat: 39.9100, lng: 116.3720, status: "有货" },
  { name: "朝阳大悦城", addr: "朝阳区朝阳北路 101 号", lat: 39.9240, lng: 116.5180, status: "少量" },

  /* —— 广州 —— */
  { name: "广州图书馆", addr: "天河区珠江东路 4 号", lat: 23.1270, lng: 113.3250, status: "有货" },
  { name: "天河城", addr: "天河区天河路 208 号", lat: 23.1350, lng: 113.3280, status: "有货" },
  { name: "正佳广场", addr: "天河区天河路 228 号", lat: 23.1360, lng: 113.3360, status: "少量" },

  /* —— 深圳 —— */
  { name: "深圳图书馆", addr: "福田区福中一路 2001 号", lat: 22.5480, lng: 114.0570, status: "有货" },
  { name: "深圳万象城", addr: "罗湖区宝安南路 1881 号", lat: 22.5390, lng: 114.1090, status: "有货" },
  { name: "COCO Park", addr: "福田区福华三路", lat: 22.5370, lng: 114.0560, status: "少量" },

  /* —— 杭州 —— */
  { name: "杭州图书馆", addr: "江干区解放东路 58 号", lat: 30.2470, lng: 120.2100, status: "有货" },
  { name: "湖滨银泰 in77", addr: "上城区延安路 258 号", lat: 30.2560, lng: 120.1640, status: "有货" },
  { name: "杭州大厦", addr: "拱墅区武林广场 1 号", lat: 30.2720, lng: 120.1660, status: "少量" },

  /* —— 成都 —— */
  { name: "成都图书馆", addr: "青羊区文翁路 95 号", lat: 30.6600, lng: 104.0660, status: "有货" },
  { name: "成都远洋太古里", addr: "锦江区中纱帽街 8 号", lat: 30.6570, lng: 104.0810, status: "有货" },
  { name: "春熙路伊藤洋华堂", addr: "锦江区春熙路", lat: 30.6575, lng: 104.0820, status: "少量" },

  /* —— 重庆 —— */
  { name: "重庆图书馆", addr: "沙坪坝区凤天大道 106 号", lat: 29.5260, lng: 106.4540, status: "有货" },
  { name: "解放碑步行街", addr: "渝中区民族路", lat: 29.5620, lng: 106.5760, status: "有货" },
  { name: "观音桥大融城", addr: "江北区观音桥步行街 8 号", lat: 29.5740, lng: 106.5320, status: "少量" },

  /* —— 天津 —— */
  { name: "天津图书馆", addr: "河西区平江道 58 号", lat: 39.0960, lng: 117.2030, status: "有货" },
  { name: "天津大悦城", addr: "南开区南门外大街 2 号", lat: 39.1340, lng: 117.1950, status: "有货" },
  { name: "滨江道商业街", addr: "和平区滨江道", lat: 39.1230, lng: 117.1960, status: "少量" },

  /* —— 南京 —— */
  { name: "南京图书馆", addr: "玄武区中山东路 189 号", lat: 32.0430, lng: 118.7960, status: "有货" },
  { name: "新街口百货", addr: "秦淮区中山南路 1 号", lat: 32.0410, lng: 118.7840, status: "有货" },
  { name: "夫子庙景区", addr: "秦淮区贡院街", lat: 32.0230, lng: 118.7940, status: "少量" },

  /* —— 武汉 —— */
  { name: "武汉图书馆", addr: "江汉区建设大道 861 号", lat: 30.5910, lng: 114.3050, status: "有货" },
  { name: "江汉路步行街", addr: "江汉区江汉路", lat: 30.5870, lng: 114.2880, status: "有货" },
  { name: "光谷广场", addr: "洪山区光谷广场", lat: 30.5120, lng: 114.4040, status: "少量" },

  /* —— 西安 —— */
  { name: "陕西省图书馆", addr: "长安北路 18 号", lat: 34.2380, lng: 108.9420, status: "有货" },
  { name: "西安钟楼", addr: "碑林区东大街", lat: 34.2610, lng: 108.9490, status: "有货" },
  { name: "小寨赛格国际", addr: "雁塔区长安中路 123 号", lat: 34.2220, lng: 108.9510, status: "少量" },

  /* —— 苏州 —— */
  { name: "苏州图书馆", addr: "姑苏区人民路 858 号", lat: 31.3030, lng: 120.6240, status: "有货" },
  { name: "观前街", addr: "姑苏区观前街", lat: 31.3130, lng: 120.6260, status: "有货" },
  { name: "苏州中心", addr: "工业园区苏州中心广场", lat: 31.3180, lng: 120.7420, status: "少量" },

  /* —— 湖北省其他地市 —— */
  { name: "黄石市图书馆", addr: "黄石市下陆区杭州西路", lat: 30.2030, lng: 115.0430, status: "有货" },
  { name: "黄石摩尔城", addr: "黄石市武汉路 99 号", lat: 30.2035, lng: 115.0360, status: "少量" },
  { name: "十堰市图书馆", addr: "十堰市张湾区公园路", lat: 32.6290, lng: 110.7860, status: "有货" },
  { name: "十堰人民商场", addr: "十堰市茅箭区人民北路", lat: 32.6360, lng: 110.7880, status: "少量" },
  { name: "宜昌市图书馆", addr: "宜昌市西陵区夷陵大道", lat: 30.6920, lng: 111.2860, status: "有货" },
  { name: "宜昌万达广场", addr: "宜昌市伍家岗区沿江大道", lat: 30.6950, lng: 111.3530, status: "少量" },
  { name: "襄阳市图书馆", addr: "襄阳市襄城区檀溪路", lat: 32.0100, lng: 112.1280, status: "有货" },
  { name: "襄阳万达广场", addr: "襄阳市樊城区长虹北路", lat: 32.0470, lng: 112.1620, status: "少量" },
  { name: "鄂州市图书馆", addr: "鄂州市鄂城区古城路", lat: 30.3930, lng: 114.8930, status: "有货" },
  { name: "鄂州银泰百货", addr: "鄂州市鄂城区南浦路", lat: 30.3980, lng: 114.8850, status: "少量" },
  { name: "荆门市图书馆", addr: "荆门市东宝区象山大道", lat: 31.0360, lng: 112.1990, status: "有货" },
  { name: "荆门中天街", addr: "荆门市东宝区中天街", lat: 31.0350, lng: 112.2040, status: "少量" },
  { name: "孝感市图书馆", addr: "孝感市孝南区城站路", lat: 30.9280, lng: 113.9100, status: "有货" },
  { name: "孝感乾坤新城", addr: "孝感市孝南区乾坤大道", lat: 30.9250, lng: 113.9170, status: "少量" },
  { name: "荆州市图书馆", addr: "荆州市沙市区江津西路", lat: 30.3350, lng: 112.2390, status: "有货" },
  { name: "荆州人信汇", addr: "荆州市沙市区北京中路", lat: 30.3390, lng: 112.2340, status: "少量" },
  { name: "黄冈市图书馆", addr: "黄冈市黄州区东方广场", lat: 30.4500, lng: 114.8720, status: "有货" },
  { name: "黄冈黄州商城", addr: "黄冈市黄州区八一路", lat: 30.4450, lng: 114.8780, status: "少量" },
  { name: "咸宁市图书馆", addr: "咸宁市咸安区温泉路", lat: 29.8330, lng: 114.3220, status: "有货" },
  { name: "咸宁银泰百货", addr: "咸宁市咸安区温泉路", lat: 29.8430, lng: 114.3290, status: "少量" },
  { name: "随州市图书馆", addr: "随州市曾都区烈山大道", lat: 31.6900, lng: 113.3890, status: "有货" },
  { name: "随州大润发", addr: "随州市曾都区舜井大道", lat: 31.6940, lng: 113.3850, status: "少量" },
  { name: "恩施市图书馆", addr: "恩施市舞阳大道", lat: 30.2960, lng: 109.4860, status: "有货" },
  { name: "恩施舞阳坝", addr: "恩施市舞阳大道", lat: 30.2950, lng: 109.4870, status: "少量" },
  { name: "仙桃市图书馆", addr: "仙桃市沙嘴办事处", lat: 30.3660, lng: 113.4540, status: "有货" },
  { name: "仙桃武商", addr: "仙桃市钱沟路", lat: 30.3720, lng: 113.4530, status: "少量" },
  { name: "潜江市图书馆", addr: "潜江市章华中路", lat: 30.4230, lng: 112.8970, status: "有货" },
  { name: "潜江中心城", addr: "潜江市章华南路", lat: 30.4250, lng: 112.8940, status: "少量" },
  { name: "天门市图书馆", addr: "天门市竟陵街道", lat: 30.6630, lng: 113.1660, status: "有货" },
  { name: "天门中百仓储", addr: "天门市竟陵街道西湖路", lat: 30.6650, lng: 113.1710, status: "少量" },
  { name: "神农架林区图书馆", addr: "神农架林区松柏镇", lat: 31.7440, lng: 110.6710, status: "有货" },
  { name: "神农架松柏镇中心", addr: "神农架林区松柏镇", lat: 31.7450, lng: 110.6730, status: "少量" }
];

/* 合作仓库/渠道列表（用于安全商城展示） */
const WAREHOUSES = [
  { name: "京东国际自营仓", location: "中国", type: "平台自营", desc: "京东国际自营商品，正品溯源，跨境直邮" },
  { name: "天猫旗舰店", location: "中国", type: "品牌官方", desc: "品牌官方或授权旗舰店发货，正品保障" },
  { name: "小米京东自营旗舰店", location: "中国", type: "品牌自营", desc: "小米生态链产品，京东仓发货" },
  { name: "Apple 天猫旗舰店", location: "中国", type: "品牌官方", desc: "Apple 官方授权渠道，国行/进口正品" },
  { name: "天猫超市", location: "中国", type: "平台自营", desc: "高频日用品，就近仓库发货" },
  { name: "天猫国际", location: "中国", type: "跨境进口", desc: "海外品牌进口商品，海关清关后发货" }
];

/* 静态城市中心表（用于隐私位置模糊匹配） */
const CITY_CENTERS = [
  { name: "北京", lat: 39.9042, lng: 116.4074 },
  { name: "上海", lat: 31.2304, lng: 121.4737 },
  { name: "广州", lat: 23.1291, lng: 113.2644 },
  { name: "深圳", lat: 22.5431, lng: 114.0579 },
  { name: "成都", lat: 30.5728, lng: 104.0668 },
  { name: "杭州", lat: 30.2741, lng: 120.1551 },
  { name: "武汉", lat: 30.5928, lng: 114.3055 },
  { name: "西安", lat: 34.3416, lng: 108.9398 },
  { name: "重庆", lat: 29.5630, lng: 106.5516 },
  { name: "南京", lat: 32.0603, lng: 118.7969 }
];
