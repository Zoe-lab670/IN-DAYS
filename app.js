let createClient = null;
let supabase = null;

const CONFIG = window.IN_DAYS_CONFIG || {};
function normalizeSupabaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try { return new URL(raw).origin; } catch { return ''; }
}
const SUPABASE_URL = normalizeSupabaseUrl(CONFIG.SUPABASE_URL);
const SUPABASE_KEY = String(CONFIG.SUPABASE_PUBLISHABLE_KEY || '').trim();


const weekdayLabels = ['一','二','三','四','五','六','日'];
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthCN = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const backgroundOptions = ['#fffdf7','#f2f5ec','#fff6e9','#f4f0f7','#eef4f5','#f3eee6'];
const LOCAL_PREFIX = 'in-days:entry:';
const DRAFT_PREFIX = 'in-days:draft:';
const CANVAS_W = 560;
const CANVAS_H = 420;

const STICKER_CATEGORIES = [
  {key:'all',label:'全部'}, {key:'recommended',label:'推荐'}, {key:'daily',label:'日常'},
  {key:'food',label:'食物'}, {key:'nature',label:'自然'}, {key:'animals',label:'动物'},
  {key:'mood',label:'心情'}, {key:'travel',label:'旅行'}, {key:'hobby',label:'兴趣'}, {key:'festival',label:'节日'}, {key:'life',label:'生活'}
];

function s(id,name,category,accent,render,tags=[]) { return {id,name,category,accent,render,tags:[name,...tags]}; }
const STICKERS = [
  s('coffee','咖啡','daily','#cbb995','coffee',['咖啡店','拿铁','饮料','喝','工作']),
  s('tea','茶','daily','#a8b99b','tea',['奶茶','饮料','下午茶','喝']),
  s('book','书本','daily','#8d9ca6','book',['阅读','看书','学习']),
  s('pen','钢笔','daily','#7f8786','pen',['写字','记录','文具','学习']),
  s('laptop','电脑','daily','#9a9c98','laptop',['工作','办公','写代码','上班']),
  s('phone','手机','daily','#8f9898','phone',['消息','聊天','电话']),
  s('headphones','耳机','daily','#ae9aac','headphones',['音乐','听歌','播客']),
  s('camera','相机','daily','#9b9b98','camera',['拍照','照片','摄影']),
  s('bag','包包','daily','#b89f90','bag',['购物','通勤','出门']),
  s('clock','时钟','daily','#9f9d91','clock',['时间','早起','晚睡']),
  s('journal','手账','daily','#a99b8b','journal',['手账','日记','记录']),
  s('glasses','眼镜','daily','#8f948f','glasses',['阅读','学习','办公']),

  s('bread','面包','food','#c9926f','bread',['早餐','吐司','吃饭']),
  s('cake','蛋糕','food','#c7a5b4','cake',['生日','甜点','庆祝']),
  s('apple','苹果','food','#d58f88','apple',['水果','健康','吃']),
  s('pear','梨','food','#d2ba72','pear',['水果','秋天','吃']),
  s('strawberry','草莓','food','#d58a87','strawberry',['水果','甜','春天']),
  s('orange','橙子','food','#e0aa69','orange',['水果','橙子']),
  s('ramen','拉面','food','#b39a83','ramen',['面','晚餐','日本','吃饭']),
  s('rice','米饭','food','#aaa69b','rice',['吃饭','午餐','晚餐']),
  s('donut','甜甜圈','food','#d3a0a6','donut',['甜点','下午茶']),
  s('icecream','冰淇淋','food','#b9c5c1','icecream',['甜点','夏天','开心']),
  s('sushi','寿司','food','#9da6a3','sushi',['日本','晚餐','吃饭']),
  s('pizza','披萨','food','#c69c82','pizza',['聚会','晚餐','吃饭']),

  s('leaf','叶子','nature','#8da684','leaf',['植物','绿色','治愈']),
  s('flower','花','nature','#cbaaa0','flower',['花束','春天','送花']),
  s('sprout','小芽','nature','#90af85','sprout',['成长','开始','植物']),
  s('tree','树','nature','#7e9d78','tree',['散步','森林','植物']),
  s('sun','太阳','nature','#d7b86e','sun',['晴天','阳光','天气']),
  s('moon','月亮','nature','#aeb8bf','moon',['夜晚','晚安','睡觉']),
  s('cloud','云','nature','#b2c0c7','cloud',['天空','天气','发呆']),
  s('rain','雨','nature','#8fa9b6','rain',['下雨','雨天','天气']),
  s('rainbow','彩虹','nature','#c3a0a5','rainbow',['天气','希望','彩虹']),
  s('star','星星','nature','#d7b86e','star',['夜晚','愿望','闪耀']),
  s('mountain','山','nature','#8fa295','mountain',['旅行','徒步','自然']),
  s('seashell','贝壳','nature','#c0a697','seashell',['海边','夏天','海']),

  s('cat','猫','animals','#9a9690','cat',['宠物','陪伴','可爱']),
  s('dog','狗狗','animals','#a68f7b','dog',['宠物','散步','陪伴']),
  s('bear','熊','animals','#a88f79','bear',['可爱','玩偶']),
  s('rabbit','兔子','animals','#b59fa7','rabbit',['可爱','春天']),
  s('penguin','企鹅','animals','#73787d','penguin',['冬天','可爱']),
  s('bird','小鸟','animals','#8da6a5','bird',['天空','自由']),
  s('fish','小鱼','animals','#87a9b0','fish',['海边','水族馆']),
  s('butterfly','蝴蝶','animals','#c4a0aa','butterfly',['花园','春天','自由']),
  s('bee','蜜蜂','animals','#c5a64f','bee',['花','春天','忙碌']),
  s('whale','鲸鱼','animals','#7fa5ac','whale',['海','旅行','大海']),
  s('frog','青蛙','animals','#8cab80','frog',['雨天','池塘','自然']),
  s('fox','狐狸','animals','#bf8f6f','fox',['森林','秋天','可爱']),

  s('happy','开心','mood','#d8b971','happy',['快乐','开心','今天不错']),
  s('calm','平静','mood','#9db5a2','calm',['治愈','放松','舒服']),
  s('excited','期待','mood','#d39b77','excited',['期待','兴奋','开心']),
  s('tired','疲惫','mood','#9cabb6','tired',['累','上班','熬夜']),
  s('sad','难过','mood','#95a7b3','sad',['难过','失落','低落']),
  s('angry','生气','mood','#c88e87','angry',['生气','郁闷']),
  s('love','喜欢','mood','#c58d8c','heart',['喜欢','爱','心动']),
  s('wow','惊喜','mood','#c5a269','wow',['惊喜','意外','礼物']),

  s('suitcase','行李箱','travel','#9f9f98','suitcase',['旅行','出发','机场']),
  s('plane','飞机','travel','#97a8b2','plane',['旅行','机场','出差']),
  s('train','火车','travel','#9aa89b','train',['旅行','通勤','车站']),
  s('bus','巴士','travel','#bba26f','bus',['通勤','旅行','交通']),
  s('map','地图','travel','#b6aa91','map',['旅行','路线','探索']),
  s('tent','帐篷','travel','#96a18c','tent',['露营','户外','旅行']),
  s('lighthouse','灯塔','travel','#af9a86','lighthouse',['海边','旅行','大海']),
  s('passport','护照','travel','#8f8e86','passport',['出国','机场','旅行']),

  s('music','音乐','hobby','#ae9aac','music',['听歌','音乐','演出']),
  s('paint','画画','hobby','#b49388','paint',['画画','创作','艺术']),
  s('movie','电影','hobby','#939ba0','movie',['电影','影院','追剧']),
  s('game','游戏','hobby','#9a9b88','game',['游戏','娱乐','周末']),
  s('yoga','瑜伽','hobby','#9aae99','yoga',['运动','健康','放松']),
  s('running','跑步','hobby','#a49a8c','running',['运动','锻炼','健康']),
  s('bicycle','骑行','hobby','#8ca19e','bicycle',['运动','骑车','户外']),
  s('ball','运动','hobby','#b39888','ball',['运动','打球','健康']),
  s('gardening','园艺','hobby','#8da684','gardening',['种花','植物','花园']),

  s('home','家','life','#b59d89','home',['回家','生活','房间']),
  s('gift','礼物','life','#c79998','gift',['生日','惊喜','送礼']),
  s('umbrella','雨伞','life','#8ea4aa','umbrella',['下雨','雨天','出门']),
  s('candle','蜡烛','life','#c5a171','candle',['夜晚','生日','仪式感']),
  s('key','钥匙','life','#9d978c','key',['回家','门','生活']),
  s('mail','信件','life','#9ea7a4','mail',['邮件','消息','写信']),
  s('shopping','购物袋','life','#b2a18f','shopping',['购物','逛街','买东西']),
  s('plant','盆栽','life','#8da684','plant',['植物','房间','生活']),
  s('alarm','闹钟','daily','#b6a58f','alarm',['早起','起床','时间']),
  s('calendar','日历','daily','#9f9d91','calendar',['安排','计划','会议']),
  s('keyboard','键盘','daily','#8f9898','keyboard',['电脑','写字','工作']),
  s('mouse','鼠标','daily','#a0a39d','mouse',['电脑','工作','办公']),
  s('water','水杯','daily','#8ea9a7','water',['喝水','健康','饮料']),
  s('toast','吐司','food','#d19e76','toast',['早餐','面包','烤面包']),
  s('burger','汉堡','food','#c38f70','burger',['晚餐','快餐','聚会']),
  s('croissant','可颂','food','#d3aa78','croissant',['早餐','面包','咖啡']),
  s('avocado','牛油果','food','#8ea47c','avocado',['水果','健康','早餐']),
  s('noodles','面条','food','#baa18a','noodles',['午餐','晚餐','吃饭']),
  s('watermelon','西瓜','food','#9faf78','watermelon',['夏天','水果','清爽']),
  s('pine','松树','nature','#849b80','pine',['森林','冬天','露营']),
  s('ocean','海浪','nature','#83a7ad','ocean',['海边','旅行','大海']),
  s('snow','雪花','nature','#9aaeb8','snow',['冬天','下雪','天气']),
  s('fire','篝火','nature','#c58f6b','fire',['露营','夜晚','温暖']),
  s('panda','熊猫','animals','#6f7773','panda',['可爱','动物园','中国']),
  s('turtle','乌龟','animals','#88a284','turtle',['海边','慢慢','自然']),
  s('deer','小鹿','animals','#a28d7d','deer',['森林','秋天','可爱']),
  s('elephant','大象','animals','#8f9495','elephant',['旅行','动物园']),
  s('seal','海豹','animals','#9aa7ac','seal',['海边','可爱']),
  s('sleepy','困困','mood','#99a5ae','sleepy',['困','睡觉','晚安']),
  s('popcorn','爆米花','hobby','#d0ae70','popcorn',['电影','影院','零食']),
  s('hotel','酒店','travel','#9a9a91','hotel',['旅行','入住','出差']),
  s('car','汽车','travel','#9a9d98','car',['自驾','出门','旅行']),
  s('boat','小船','travel','#89a5ad','boat',['海边','旅行','湖']),
  s('campfire','篝火','travel','#c58f6b','fire',['露营','夜晚','户外'])
];

const SUPPLEMENT_STICKERS = [
  {
    "id": "wallet",
    "name": "钱包",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "钱包",
      "出门",
      "消费"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14%2019h32a5%205%200%200%201%205%205v23H14z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M14%2022h34M14%2028h30%22%2F%3E%3Cpath%20d%3D%22M41%2037h12v9H41a4%204%200%200%201%200-9Z%22%2F%3E%3Ccircle%20cx%3D%2244%22%20cy%3D%2241.5%22%20r%3D%221.5%22%20fill%3D%22%233f3f3b%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "bottle",
    "name": "水瓶",
    "category": "daily",
    "accent": "#a7b8c0",
    "tags": [
      "喝水",
      "水杯",
      "健康"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M23%2013h18v8l3%206v22H20V27l3-6Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M27%2013h10v7H27zM20%2034h24%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "thermos",
    "name": "保温杯",
    "category": "daily",
    "accent": "#d6a47f",
    "tags": [
      "热水",
      "通勤",
      "办公室"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2222%22%20y%3D%2215%22%20width%3D%2220%22%20height%3D%2238%22%20rx%3D%225%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M27%2010h10v7H27zM22%2025h20%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "tissue",
    "name": "纸巾",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "纸巾",
      "日常",
      "清洁"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2024c7-5%2021-5%2028%200v29H18Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M18%2024c7-5%2021-5%2028%200M24%2018c4-3%2012-3%2016%200M25%2033h14M25%2039h9%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "flashlight",
    "name": "手电筒",
    "category": "daily",
    "accent": "#d7b86e",
    "tags": [
      "夜晚",
      "露营",
      "照明"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M24%2014h16l-2%2010-12%2024H22l4-24Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M24%2014h16M22%2048h6M27%2024h10%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "charger",
    "name": "充电器",
    "category": "daily",
    "accent": "#a7b8c0",
    "tags": [
      "充电",
      "手机",
      "数据线"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2213%22%20width%3D%2217%22%20height%3D%2221%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M35%2025h8c6%200%206%208%201%208h-9M24%2034v10c0%206%205%209%209%209%22%2F%3E%3Cpath%20d%3D%22M24%2016v5M29%2016v5%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "powerbank",
    "name": "充电宝",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "充电",
      "电量",
      "出门"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2221%22%20y%3D%229%22%20width%3D%2222%22%20height%3D%2246%22%20rx%3D%226%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M26%2018h12M29%2047h6%22%2F%3E%3Cpath%20d%3D%22M31%2026h2v12h-2z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.6%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "remote",
    "name": "遥控器",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "电视",
      "遥控",
      "家里"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2222%22%20y%3D%228%22%20width%3D%2220%22%20height%3D%2248%22%20rx%3D%226%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.18%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2218%22%20r%3D%223%22%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2227%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2227%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2235%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2235%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "umbrella_folded",
    "name": "折叠伞",
    "category": "daily",
    "accent": "#a7b8c0",
    "tags": [
      "雨天",
      "出门",
      "雨伞"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M27%2012h10v29c0%204-2%207-5%207s-5-3-5-7Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.3%22%2F%3E%3Cpath%20d%3D%22M27%2012h10M32%2048c0%205%205%205%206%201%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "shoes",
    "name": "鞋子",
    "category": "daily",
    "accent": "#d6a47f",
    "tags": [
      "鞋",
      "出门",
      "运动"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2038c8%200%2010%208%2018%208h13c5%200%206%207%201%208H23c-7%200-12-5-7-16Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M18%2040c5%203%209%203%2015%203M29%2034c3%203%205%205%209%207%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "scarf",
    "name": "围巾",
    "category": "daily",
    "accent": "#c89e9c",
    "tags": [
      "冬天",
      "保暖",
      "穿搭"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2013c7%206%2017%206%2024%200v12c-7%205-17%205-24%200Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.32%22%2F%3E%3Cpath%20d%3D%22M20%2025v27l10-7%208%207V25%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "hat",
    "name": "帽子",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "帽子",
      "穿搭",
      "出门"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2044c2-10%208-16%2019-16s17%206%2019%2016H13Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M10%2044h44M25%2028c0-6%2014-6%2014%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "banana",
    "name": "香蕉",
    "category": "food",
    "accent": "#d7b86e",
    "tags": [
      "水果",
      "早餐",
      "零食"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2039c8%209%2018%208%2027-2%205-6%207-13%206-18-1-3-5-2-6%201-1%205-3%208-7%2011-6%205-12%204-18-1%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.5%22%2F%3E%3Cpath%20d%3D%22M18%2039c8%209%2018%208%2027-2M49%2019l3-2%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "grapes",
    "name": "葡萄",
    "category": "food",
    "accent": "#c89e9c",
    "tags": [
      "水果",
      "零食",
      "聚会"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M31%2019c6-6%2011-4%2013%201-5%202-9%202-13-1Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.65%22%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2228%22%20r%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2228%22%20r%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3Ccircle%20cx%3D%2231%22%20cy%3D%2238%22%20r%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%2238%22%20r%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2238%22%20r%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2247%22%20r%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "peach",
    "name": "桃子",
    "category": "food",
    "accent": "#c89e9c",
    "tags": [
      "水果",
      "夏天",
      "甜"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2020c-10-7-18%201-16%2011%202%2011%209%2021%2016%2022%207-1%2014-11%2016-22%202-10-6-18-16-11Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.48%22%2F%3E%3Cpath%20d%3D%22M32%2020c1-6%205-9%2010-9-2%206-5%209-10%209Z%22%2F%3E%3Cpath%20d%3D%22M32%2025v28%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "cherry",
    "name": "樱桃",
    "category": "food",
    "accent": "#c89e9c",
    "tags": [
      "水果",
      "甜",
      "夏天"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2225%22%20cy%3D%2240%22%20r%3D%227%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.5%22%2F%3E%3Ccircle%20cx%3D%2241%22%20cy%3D%2240%22%20r%3D%227%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.5%22%2F%3E%3Cpath%20d%3D%22M25%2033c2-11%205-17%209-21M41%2033c-2-10-5-16-7-21%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "pineapple",
    "name": "菠萝",
    "category": "food",
    "accent": "#d7b86e",
    "tags": [
      "水果",
      "夏天",
      "热带"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2024c-2%207-2%2019%202%2028%205%206%2011%206%2016%200%204-9%204-20%202-28Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.45%22%2F%3E%3Cpath%20d%3D%22M23%2023c-3-5%200-10%205-8%201-7%206-10%209-4%204-4%208%201%205%207M28%2030l8%2018M38%2030l-9%2018%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "yogurt",
    "name": "酸奶",
    "category": "food",
    "accent": "#a7b8c0",
    "tags": [
      "早餐",
      "乳制品",
      "健康"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2022h24l-2%2030H22Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M20%2022h24l-2-7H22Z%22%2F%3E%3Cpath%20d%3D%22M25%2030h14M25%2037h11%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "milk",
    "name": "牛奶",
    "category": "food",
    "accent": "#a7b8c0",
    "tags": [
      "早餐",
      "饮品",
      "健康"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2016h20l-2%2039H24Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M22%2016h20M28%2010h8v6h-8zM25%2030h14%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "bubbletea",
    "name": "奶茶",
    "category": "food",
    "accent": "#d6a47f",
    "tags": [
      "奶茶",
      "饮料",
      "下午茶"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M21%2022h22l-3%2030H24Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.3%22%2F%3E%3Cpath%20d%3D%22M22%2022h20M26%2014h12M32%2014v-5M26%2043l3%203M34%2042l3%204M39%2041l-1%205%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "dumpling",
    "name": "饺子",
    "category": "food",
    "accent": "#d6a47f",
    "tags": [
      "春节",
      "早餐",
      "吃饭"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14%2039c5-12%2031-12%2036%200-8%208-28%209-36%200Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.45%22%2F%3E%3Cpath%20d%3D%22M14%2039c5-12%2031-12%2036%200M20%2036c3%202%206%202%209%200s6%202%209%200%205%201%207%203%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "hotpot",
    "name": "火锅",
    "category": "food",
    "accent": "#c89e9c",
    "tags": [
      "聚餐",
      "冬天",
      "吃饭"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2028h32l-4%2020c-6%207-18%207-24%200Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.24%22%2F%3E%3Cpath%20d%3D%22M16%2028h32M21%2023c5-6%209%206%2014%200%204-5%206%204%209%201M24%2036h16M24%2042h16%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "friedegg",
    "name": "煎蛋",
    "category": "food",
    "accent": "#d7b86e",
    "tags": [
      "早餐",
      "蛋",
      "吃饭"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2036c3-10%2015-10%2020-6%205%204%2016-2%2020%204%205%209-5%2016-14%2016-10%200-29-3-26-14Z%22%20fill%3D%22%23fffdf7%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2240%22%20r%3D%226%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.75%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "salad",
    "name": "沙拉",
    "category": "food",
    "accent": "#9fb29b",
    "tags": [
      "健康",
      "午餐",
      "蔬菜"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2031h32c-2%2013-8%2022-16%2022s-14-9-16-22Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.4%22%2F%3E%3Cpath%20d%3D%22M18%2030c5-7%2010-4%2014%200%204-8%2010-7%2014%200M23%2036h18%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "blanket",
    "name": "毯子",
    "category": "life",
    "accent": "#c89e9c",
    "tags": [
      "家居",
      "休息",
      "保暖"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2025h34v27H15Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M20%2025c4%205%208%205%2012%200%204%205%208%205%2012%200M20%2034h24M20%2042h24%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "wardrobe",
    "name": "衣柜",
    "category": "life",
    "accent": "#b3ada2",
    "tags": [
      "衣柜",
      "家居",
      "整理"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2215%22%20y%3D%2210%22%20width%3D%2234%22%20height%3D%2244%22%20rx%3D%223%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M32%2010v44M22%2031h4M38%2031h4%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "bookshelf",
    "name": "书架",
    "category": "life",
    "accent": "#b3ada2",
    "tags": [
      "书架",
      "阅读",
      "家居"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2010h28v44H18Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M18%2025h28M18%2040h28M24%2017v7M32%2029v11M41%2043v11%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "laundry",
    "name": "洗衣",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "洗衣",
      "家务",
      "日常"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2214%22%20width%3D%2236%22%20height%3D%2240%22%20rx%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2237%22%20r%3D%2210%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2237%22%20r%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.35%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2222%22%20r%3D%221.8%22%20fill%3D%22%233f3f3b%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "vacuum",
    "name": "吸尘器",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "清洁",
      "家务"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M23%2013h12v22H23Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M35%2025c10%200%2013%205%2013%2012v8M20%2035c-5%200-8%204-8%209v9h8V37%22%2F%3E%3Cpath%20d%3D%22M28%2035v19%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mop",
    "name": "拖把",
    "category": "life",
    "accent": "#9fb29b",
    "tags": [
      "清洁",
      "家务",
      "打扫"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M39%2011%2030%2044%22%2F%3E%3Cpath%20d%3D%22M22%2043h23l-5%2011H27Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.35%22%2F%3E%3Cpath%20d%3D%22M29%2044%2025%2055M36%2044l-2%2011M42%2044l-1%2011%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "trash",
    "name": "垃圾桶",
    "category": "life",
    "accent": "#b3ada2",
    "tags": [
      "清洁",
      "家务",
      "垃圾"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2021h26l-3%2033H22Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M17%2021h30M25%2015h14M28%2012h8M26%2028v18M32%2028v18M38%2028v18%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "bathtub",
    "name": "浴缸",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "洗澡",
      "浴室",
      "放松"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2031h40c-2%2013-9%2022-20%2022s-18-9-20-22Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.24%22%2F%3E%3Cpath%20d%3D%22M13%2031h40M20%2027V18c0-6%209-6%209%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "shower",
    "name": "淋浴",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "洗澡",
      "浴室",
      "清洁"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2024c0-8%207-13%2015-13%209%200%2015%205%2015%2013%22%2F%3E%3Cpath%20d%3D%22M47%2024H30M37%2024v17M28%2041h18%22%2F%3E%3Cpath%20d%3D%22M22%2031v3M28%2031v3M34%2031v3%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mirror",
    "name": "镜子",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "镜子",
      "梳妆",
      "家里"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cellipse%20cx%3D%2232%22%20cy%3D%2229%22%20rx%3D%2216%22%20ry%3D%2221%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M32%2050v7M26%2057h12%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "monitor",
    "name": "显示器",
    "category": "daily",
    "accent": "#a7b8c0",
    "tags": [
      "电脑",
      "办公",
      "工作"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2211%22%20y%3D%2212%22%20width%3D%2242%22%20height%3D%2229%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M28%2041v8M21%2052h22M18%2049h28%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "tablet",
    "name": "平板",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "学习",
      "办公",
      "阅读"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%229%22%20width%3D%2228%22%20height%3D%2246%22%20rx%3D%225%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.2%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2249%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "document",
    "name": "文件",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "文件",
      "工作",
      "资料"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2010h22l8%208v36H18Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.18%22%2F%3E%3Cpath%20d%3D%22M40%2010v10h8M24%2030h18M24%2037h15M24%2044h12%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "paperclip",
    "name": "回形针",
    "category": "daily",
    "accent": "#a7b8c0",
    "tags": [
      "文具",
      "文件",
      "办公"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M25%2048%2043%2030c5-5-2-12-7-7L20%2039c-8%208%204%2020%2012%2012l13-13%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "sticky",
    "name": "便利贴",
    "category": "daily",
    "accent": "#d7b86e",
    "tags": [
      "便签",
      "记录",
      "工作"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14%2014h36v27H32l-18%2012Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M32%2041v12M22%2023h20M22%2030h14%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "ruler",
    "name": "尺子",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "文具",
      "学习",
      "画图"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2051%2013%2045%2043%2015l6%206Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M22%2044l-4-4M27%2039l-4-4M32%2034l-4-4M37%2029l-4-4%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "calculator",
    "name": "计算器",
    "category": "daily",
    "accent": "#a7b8c0",
    "tags": [
      "计算",
      "工作",
      "学习"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%229%22%20width%3D%2228%22%20height%3D%2246%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M24%2018h16v7H24zM24%2031h5M35%2031h5M24%2039h5M35%2039h5M24%2047h5M35%2047h5%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "presentation",
    "name": "演示",
    "category": "daily",
    "accent": "#c89e9c",
    "tags": [
      "汇报",
      "会议",
      "工作"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2212%22%20y%3D%2214%22%20width%3D%2240%22%20height%3D%2230%22%20rx%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.18%22%2F%3E%3Cpath%20d%3D%22M32%2044v11M24%2055h16M20%2036l8-8%206%205%2010-12%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "meeting",
    "name": "会议",
    "category": "daily",
    "accent": "#b3ada2",
    "tags": [
      "会议",
      "讨论",
      "工作"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2221%22%20cy%3D%2227%22%20r%3D%225%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.35%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2223%22%20r%3D%225%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.35%22%2F%3E%3Ccircle%20cx%3D%2243%22%20cy%3D%2227%22%20r%3D%225%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.35%22%2F%3E%3Cpath%20d%3D%22M14%2045c2-7%2011-7%2014%200M25%2043c2-8%2012-8%2014%200M36%2045c2-7%2011-7%2014%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "graduation",
    "name": "毕业",
    "category": "daily",
    "accent": "#d7b86e",
    "tags": [
      "毕业",
      "学校",
      "学业"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M11%2025%2032%2014l21%2011-21%2011Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.35%22%2F%3E%3Cpath%20d%3D%22M20%2030v13c8%207%2016%207%2024%200V30M53%2025v14%22%2F%3E%3Cpath%20d%3D%22M49%2040v7M46%2047h6%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "metro",
    "name": "地铁",
    "category": "travel",
    "accent": "#a7b8c0",
    "tags": [
      "通勤",
      "地铁",
      "交通"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2216%22%20y%3D%2210%22%20width%3D%2232%22%20height%3D%2244%22%20rx%3D%228%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M22%2022h20M22%2030h20M20%2047h24M27%2054l-5%206M37%2054l5%206%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2240%22%20r%3D%223%22%20fill%3D%22%233f3f3b%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%223%22%20fill%3D%22%233f3f3b%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "tram",
    "name": "电车",
    "category": "travel",
    "accent": "#a7b8c0",
    "tags": [
      "交通",
      "城市",
      "出行"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2215%22%20y%3D%2214%22%20width%3D%2234%22%20height%3D%2236%22%20rx%3D%226%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.24%22%2F%3E%3Cpath%20d%3D%22M20%2022h24M21%2031h22M25%2050v6M39%2050v6M32%2014V8M25%208h14%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "taxi",
    "name": "出租车",
    "category": "travel",
    "accent": "#d7b86e",
    "tags": [
      "打车",
      "城市",
      "出行"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2036h34l-5-11c-1-3-4-5-7-5H27c-4%200-6%202-8%205l-4%2011Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.33%22%2F%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%2242%22%20r%3D%224%22%2F%3E%3Ccircle%20cx%3D%2242%22%20cy%3D%2242%22%20r%3D%224%22%2F%3E%3Cpath%20d%3D%22M19%2032h26%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "bikeride",
    "name": "摩托车",
    "category": "travel",
    "accent": "#b3ada2",
    "tags": [
      "出行",
      "骑行",
      "城市"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2244%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%2245%22%20cy%3D%2244%22%20r%3D%228%22%2F%3E%3Cpath%20d%3D%22M20%2044h12l8-12h10M31%2044l-6-14h10M36%2030h-5%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "parking",
    "name": "停车",
    "category": "travel",
    "accent": "#a7b8c0",
    "tags": [
      "停车",
      "开车",
      "出行"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2216%22%20y%3D%2210%22%20width%3D%2232%22%20height%3D%2244%22%20rx%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M27%2045V19h9c9%200%209%2012%200%2012h-9%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "landmark",
    "name": "景点",
    "category": "travel",
    "accent": "#d6a47f",
    "tags": [
      "旅行",
      "景点",
      "城市"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2052h40M17%2052V28h30v24M13%2028%2032%2014l19%2014M23%2038h5M36%2038h5%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.22%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "ticket",
    "name": "车票",
    "category": "travel",
    "accent": "#a7b8c0",
    "tags": [
      "车票",
      "旅行",
      "出行"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2021h40v22H12Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M18%2027h28M18%2034h18%22%2F%3E%3Cpath%20d%3D%22M16%2020l3-3M44%2020l3-3%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "luggage_tag",
    "name": "行李牌",
    "category": "travel",
    "accent": "#c89e9c",
    "tags": [
      "行李",
      "旅行",
      "机场"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2017h29v31H18Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M28%2017v-5h9v5M24%2025h17M24%2033h12%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "guitar",
    "name": "吉他",
    "category": "hobby",
    "accent": "#d6a47f",
    "tags": [
      "音乐",
      "乐器",
      "弹琴"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M27%2045c-8%203-12-6-8-12%203-4%207-5%2010-2l16-16%206%206-16%2016c3%203%202%208-2%2010-2%202-4%202-6-2Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M40%2025l6%206M29%2029l-8%208%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "crochet",
    "name": "钩针",
    "category": "hobby",
    "accent": "#c89e9c",
    "tags": [
      "手工",
      "钩织",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2047c8%204%2020-3%2027-12%205-6%202-14-4-13-4%201-5%207-2%2010M18%2047l-5%204M41%2022l8-8%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "knitting",
    "name": "编织",
    "category": "hobby",
    "accent": "#d6a47f",
    "tags": [
      "手工",
      "毛线",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14%2020l36%2024M50%2020%2014%2044%22%2F%3E%3Cpath%20d%3D%22M20%2024c5%209%2019%2016%2024%207M44%2040c-6-8-18-14-24-6%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "novel",
    "name": "小说",
    "category": "hobby",
    "accent": "#b3ada2",
    "tags": [
      "阅读",
      "小说",
      "周末"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14%2015c9-4%2018-4%2018%202v38c0-6-9-7-18-2Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.18%22%2F%3E%3Cpath%20d%3D%22M50%2015c-9-4-18-4-18%202v38c0-6%209-7%2018-2Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.18%22%2F%3E%3Cpath%20d%3D%22M19%2025h9M19%2032h9M37%2025h9M37%2032h9%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "puzzle",
    "name": "拼图",
    "category": "hobby",
    "accent": "#a7b8c0",
    "tags": [
      "游戏",
      "益智",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2017h18v10c6-4%2011%201%207%206h9v18H31V41c-7%204-12-3-6-8h-10Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M33%2017v10c6-4%2011%201%207%206h9%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "skateboard",
    "name": "滑板",
    "category": "hobby",
    "accent": "#d6a47f",
    "tags": [
      "滑板",
      "运动",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2039c7%208%2033%208%2040%200%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2247%22%20r%3D%224%22%2F%3E%3Ccircle%20cx%3D%2244%22%20cy%3D%2247%22%20r%3D%224%22%2F%3E%3Cpath%20d%3D%22M20%2039h24%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "badminton",
    "name": "羽毛球",
    "category": "hobby",
    "accent": "#a7b8c0",
    "tags": [
      "羽毛球",
      "运动",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2025v28M19%2025c7%204%2019%204%2026%200M22%2020l-7-6M27%2020l-3-8M37%2020l3-8M42%2020l7-6%22%2F%3E%3Cpath%20d%3D%22M26%2013c-4%202-5%207-2%2011M38%2013c4%202%205%207%202%2011%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "fishing",
    "name": "钓鱼",
    "category": "hobby",
    "accent": "#a7b8c0",
    "tags": [
      "钓鱼",
      "户外",
      "休闲"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2016v24M16%2040c0%208%207%2010%2013%205s8-11%208-18M37%2027c7-4%2013-1%2013%206%200%206-6%2010-12%207%22%2F%3E%3Cpath%20d%3D%22M37%2027l6-7%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "baking",
    "name": "烘焙",
    "category": "hobby",
    "accent": "#d6a47f",
    "tags": [
      "烘焙",
      "厨房",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2034h32v19H16Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M21%2029c-4-3-1-8%204-7%203-7%2010-6%2012%200%206-3%2010%203%205%207M16%2040h32%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "planting",
    "name": "种植",
    "category": "hobby",
    "accent": "#9fb29b",
    "tags": [
      "种花",
      "植物",
      "园艺"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2036h24l-3%2018H23Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.3%22%2F%3E%3Cpath%20d%3D%22M32%2036V17M32%2025c-8-3-10-8-7-11%204-4%208%200%207%206%201-8%208-11%2011-7%202%203-1%207-7%2010%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "swim",
    "name": "游泳",
    "category": "hobby",
    "accent": "#a7b8c0",
    "tags": [
      "游泳",
      "运动",
      "夏天"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2042c6-6%2012%206%2018%200%206-6%2012%206%2022%200M12%2051c6-6%2012%206%2018%200%206-6%2012%206%2022%200M24%2016c7-6%2014%202%209%209-5%207-13%203-12-4%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "basketball",
    "name": "篮球",
    "category": "hobby",
    "accent": "#d6a47f",
    "tags": [
      "篮球",
      "运动",
      "打球"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2219%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M18%2023c7%204%2021%204%2028-2M18%2041c7-4%2021-4%2028%202M26%2014c3%206%203%2018%200%2036M38%2014c-3%206-3%2018%200%2036%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "football",
    "name": "足球",
    "category": "hobby",
    "accent": "#b3ada2",
    "tags": [
      "足球",
      "运动",
      "球类"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2219%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22m32%2024%207%205-3%208h-8l-3-8%207-5ZM18%2035l9%202M46%2035l-9%202M23%2020l5%207M41%2020l-5%207%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "tennis",
    "name": "网球",
    "category": "hobby",
    "accent": "#9fb29b",
    "tags": [
      "网球",
      "运动",
      "球类"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2218%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M19%2023c6%205%2020%201%2026-6M19%2041c6-5%2020-1%2026%206%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "jump_rope",
    "name": "跳绳",
    "category": "hobby",
    "accent": "#c89e9c",
    "tags": [
      "跳绳",
      "运动",
      "健身"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2217%22%20r%3D%225%22%2F%3E%3Cpath%20d%3D%22M32%2022v13M32%2027l-10-6M32%2027l10-6M32%2035l-10%2015M32%2035l10%2015%22%2F%3E%3Cpath%20d%3D%22M16%2049c6%208%2026%208%2032%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mat",
    "name": "瑜伽垫",
    "category": "hobby",
    "accent": "#9fb29b",
    "tags": [
      "瑜伽",
      "健身",
      "放松"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2045h28v9H18Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.3%22%2F%3E%3Cpath%20d%3D%22M23%2045c0-8%2018-8%2018%200M32%2019v15M25%2025l7%205%207-5%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "dumbbell",
    "name": "哑铃",
    "category": "hobby",
    "accent": "#b3ada2",
    "tags": [
      "健身",
      "力量",
      "运动"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2028v8M18%2024v16M24%2028v8M40%2028v8M46%2024v16M52%2028v8M24%2032h16%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "hiking",
    "name": "徒步",
    "category": "hobby",
    "accent": "#9fb29b",
    "tags": [
      "徒步",
      "登山",
      "户外"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2214%22%20r%3D%225%22%2F%3E%3Cpath%20d%3D%22M34%2021l-4%2012%2010%206M30%2029l10%202M34%2033l-10%208M40%2039l10%2010%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "wind",
    "name": "风",
    "category": "nature",
    "accent": "#a7b8c0",
    "tags": [
      "风",
      "天气",
      "散步"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M11%2025h31c7%200%207-9%201-10-4-1-7%202-8%205M11%2035h38c5%200%206%208%201%209-4%201-6-1-7-4M11%2045h20%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "fog",
    "name": "雾",
    "category": "nature",
    "accent": "#a7b8c0",
    "tags": [
      "雾",
      "天气",
      "清晨"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2026h38M10%2035h44M16%2044h33%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "lake",
    "name": "湖",
    "category": "nature",
    "accent": "#a7b8c0",
    "tags": [
      "湖",
      "自然",
      "旅行"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M10%2037c8-8%2015%208%2022%200%207-8%2014%208%2022%200M10%2047c8-8%2015%208%2022%200%207-8%2014%208%2022%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "maple",
    "name": "枫叶",
    "category": "nature",
    "accent": "#d6a47f",
    "tags": [
      "秋天",
      "落叶",
      "自然"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2014%2037%2024l10-3-5%2010%208%205-10%202%201%2010-9-6-9%206%201-10-10-2%208-5-5-10%2010%203Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.38%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "cherry_blossom",
    "name": "樱花",
    "category": "nature",
    "accent": "#c89e9c",
    "tags": [
      "春天",
      "樱花",
      "自然"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2049V34M32%2034c-4-8-12-4-10%202%202%205%209%205%2010%200M32%2034c4-8%2012-4%2010%202-2%205-9%205-10%200M32%2031c-7-3-10-11-4-13%205-1%208%205%204%2013M32%2031c7-3%2010-11%204-13-5-1-8%205-4%2013%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2231%22%20r%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.8%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "grass",
    "name": "草地",
    "category": "nature",
    "accent": "#9fb29b",
    "tags": [
      "草地",
      "公园",
      "自然"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2050c5-8%208-17%208-25M20%2050c1-9%205-15%209-21M28%2050c3-8%208-14%2013-20M38%2050c2-7%206-11%2012-16%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "rainboots",
    "name": "雨靴",
    "category": "nature",
    "accent": "#a7b8c0",
    "tags": [
      "下雨",
      "雨天",
      "出门"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2013h13v27c0%206-4%2010-10%2010H14c-3%200-4-4-2-6l6-7Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.35%22%2F%3E%3Cpath%20d%3D%22M36%2013h13v27c0%206-4%2010-10%2010h-7c-3%200-4-4-2-6l6-7Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.35%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "kite",
    "name": "风筝",
    "category": "nature",
    "accent": "#c89e9c",
    "tags": [
      "放风筝",
      "春天",
      "户外"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2013%2048%2030%2032%2047%2016%2030Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M32%2013v34M16%2030h32M32%2047c0%207%205%2010%2010%2010%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "hamster",
    "name": "仓鼠",
    "category": "animals",
    "accent": "#d6a47f",
    "tags": [
      "宠物",
      "可爱",
      "动物"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2233%22%20r%3D%2218%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.28%22%2F%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%2220%22%20r%3D%226%22%2F%3E%3Ccircle%20cx%3D%2242%22%20cy%3D%2220%22%20r%3D%226%22%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2233%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2238%22%20cy%3D%2233%22%20r%3D%222%22%2F%3E%3Cpath%20d%3D%22M29%2041c2%202%204%202%206%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "squirrel",
    "name": "松鼠",
    "category": "animals",
    "accent": "#d6a47f",
    "tags": [
      "森林",
      "秋天",
      "动物"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2039c-4-11%205-19%2013-12%207-10%2018-3%2015%206-2%208-10%2015-19%2015-5%200-8-4-9-9Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M39%2029c4-7%2010-10%2011-4%201%206-4%2010-9%2011%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "otter",
    "name": "水獭",
    "category": "animals",
    "accent": "#a7b8c0",
    "tags": [
      "海边",
      "河边",
      "可爱"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2039c1-11%2010-17%2018-15%207%202%2012%209%2010%2016-2%2010-11%2014-20%2011-6-2-9-7-8-12Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.24%22%2F%3E%3Ccircle%20cx%3D%2228%22%20cy%3D%2233%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2238%22%20cy%3D%2233%22%20r%3D%222%22%2F%3E%3Cpath%20d%3D%22M31%2040c2%202%204%202%206%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "deer_head",
    "name": "鹿",
    "category": "animals",
    "accent": "#b3ada2",
    "tags": [
      "森林",
      "秋天",
      "动物"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2234%22%20r%3D%2215%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M23%2020l-6-8M41%2020l6-8M21%2015l-5-2M43%2015l5-2M32%2019v-8%22%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2233%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2233%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "horse",
    "name": "马",
    "category": "animals",
    "accent": "#b3ada2",
    "tags": [
      "动物",
      "农场",
      "旅行"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2046c-4-9%202-20%2011-20%208%200%2015%207%2013%2015-2%2010-17%2015-24%205Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M25%2025c-2-6%200-10%205-13M31%2025c2-4%206-6%209-5%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "pig",
    "name": "小猪",
    "category": "animals",
    "accent": "#c89e9c",
    "tags": [
      "农场",
      "可爱",
      "动物"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2235%22%20r%3D%2218%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M18%2027c-5-6-1-9%204-5M46%2027c5-6%201-9-4-5%22%2F%3E%3Cellipse%20cx%3D%2232%22%20cy%3D%2241%22%20rx%3D%228%22%20ry%3D%226%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.55%22%2F%3E%3Ccircle%20cx%3D%2229%22%20cy%3D%2241%22%20r%3D%221.5%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2241%22%20r%3D%221.5%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "cow",
    "name": "奶牛",
    "category": "animals",
    "accent": "#b3ada2",
    "tags": [
      "农场",
      "动物",
      "牛奶"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2028c0-9%207-14%2015-14s15%205%2015%2014v13c0%208-6%2012-15%2012s-15-4-15-12Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M20%2022l-6-5M44%2022l6-5M25%2033c3-3%205%202%208-1%203-3%205%202%208-1%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "duck",
    "name": "鸭子",
    "category": "animals",
    "accent": "#d7b86e",
    "tags": [
      "动物",
      "水边",
      "可爱"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2038c0-10%208-16%2017-16%207%200%2012%204%2014%209%204%207-1%2016-10%2018H24c-4%200-6-4-6-11Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M46%2031h8M36%2036c2%202%204%202%206%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "dolphin",
    "name": "海豚",
    "category": "animals",
    "accent": "#a7b8c0",
    "tags": [
      "海边",
      "游泳",
      "海洋"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M11%2036c10-12%2025-14%2039-6l-7%203%205%206c-12%204-27%203-37-3Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.28%22%2F%3E%3Cpath%20d%3D%22M31%2028c2-7%207-10%2012-8-4%204-7%207-12%208Z%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "seagull",
    "name": "海鸥",
    "category": "animals",
    "accent": "#a7b8c0",
    "tags": [
      "海边",
      "旅行",
      "天空"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2032c7-8%2014-8%2020%200%206-8%2013-8%2020%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "butterfly2",
    "name": "小蝴蝶",
    "category": "animals",
    "accent": "#c89e9c",
    "tags": [
      "花园",
      "春天",
      "可爱"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2031c-9-14-20-10-17-2%202%207%2010%208%2017%204M32%2031c9-14%2020-10%2017-2-2%207-10%208-17%204M32%2031v19%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2230%22%20r%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.6%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "comfort",
    "name": "安慰",
    "category": "mood",
    "accent": "#c89e9c",
    "tags": [
      "安慰",
      "治愈",
      "陪伴"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2036c4-8%2010-12%2014-12s10%204%2014%2012c-4%207-10%2012-14%2012s-10-5-14-12Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M24%2035c2%203%204%203%206%200M34%2035c2%203%204%203%206%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "energy",
    "name": "元气",
    "category": "mood",
    "accent": "#d7b86e",
    "tags": [
      "精神",
      "活力",
      "开心"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2212%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.5%22%2F%3E%3Cpath%20d%3D%22M32%208v7M32%2049v7M8%2032h7M49%2032h7M15%2015l5%205M44%2044l5%205M49%2015l-5%205M20%2044l-5%205%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "focus",
    "name": "专注",
    "category": "mood",
    "accent": "#a7b8c0",
    "tags": [
      "专注",
      "工作",
      "学习"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2219%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M22%2035c5-10%2015-10%2020%200M25%2026h14%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "relaxed",
    "name": "放松",
    "category": "mood",
    "accent": "#9fb29b",
    "tags": [
      "放松",
      "治愈",
      "休息"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2039c7-8%2014%208%2021%200%207-8%2014%208%2017%200M19%2049h26%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "anxious",
    "name": "焦虑",
    "category": "mood",
    "accent": "#a7b8c0",
    "tags": [
      "焦虑",
      "压力",
      "心情"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2218%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.18%22%2F%3E%3Cpath%20d%3D%22M24%2028c3%203%205%203%208%200M34%2028c3%203%205%203%208%200M25%2042c4-4%2010-4%2014%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "surprise",
    "name": "惊讶",
    "category": "mood",
    "accent": "#d7b86e",
    "tags": [
      "惊讶",
      "意外",
      "心情"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2218%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.18%22%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2228%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2238%22%20cy%3D%2228%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2240%22%20r%3D%223%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "newyear",
    "name": "元旦",
    "category": "festival",
    "accent": "#d7b86e",
    "tags": [
      "元旦",
      "新年",
      "一月"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2012h24v40H20Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M26%208v8M38%208v8M20%2022h24M27%2030h10M27%2038h6%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "newyear_firework",
    "name": "跨年烟花",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "元旦",
      "跨年",
      "烟花"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2035V12M32%2019l-8-8M32%2019l8-8M32%2019v-8M32%2019l8%202M32%2019l-8%202M32%2035l-7%207M32%2035l7%207%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2212%22%20r%3D%222%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.7%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "spring_lantern",
    "name": "春节灯笼",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "春节",
      "灯笼",
      "过年"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2019c6-5%2014-5%2020%200l3%2022c-7%207-19%207-26%200Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.38%22%2F%3E%3Cpath%20d%3D%22M22%2019h20M25%2030h14M27%2045v7M37%2045v7%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "red_envelope",
    "name": "红包",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "春节",
      "红包",
      "过年"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2213%22%20width%3D%2228%22%20height%3D%2240%22%20rx%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.3%22%2F%3E%3Cpath%20d%3D%22M18%2030h28M25%2023l7-6%207%206M32%2022v16%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "spring_couplet",
    "name": "春联",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "春节",
      "春联",
      "过年"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2215%22%20y%3D%2214%22%20width%3D%2212%22%20height%3D%2238%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.22%22%2F%3E%3Crect%20x%3D%2237%22%20y%3D%2214%22%20width%3D%2212%22%20height%3D%2238%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M21%2020v24M43%2020v24M30%2018h4v28h-4z%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "qingming_kite",
    "name": "清明风筝",
    "category": "festival",
    "accent": "#a7b8c0",
    "tags": [
      "清明节",
      "风筝",
      "踏青"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2012%2046%2027%2032%2042%2018%2027Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M32%2012v30M18%2027h28M32%2042c1%208%207%2012%2012%2010%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "qingming_willow",
    "name": "清明柳枝",
    "category": "festival",
    "accent": "#9fb29b",
    "tags": [
      "清明节",
      "柳树",
      "踏青"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2052c1-16%204-29%2013-39M32%2039c-7-4-11-9-13-16M35%2029c7-4%2010-8%2012-13M29%2034c-6-3-9-6-12-11%22%2F%3E%3Cpath%20d%3D%22M43%2015l-3-4M46%2020l4-3M20%2023l-5-1M23%2029l-5%201%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mayday_tools",
    "name": "劳动节工具",
    "category": "festival",
    "accent": "#d6a47f",
    "tags": [
      "劳动节",
      "劳动",
      "工作"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2048h32M28%2048V19M22%2019h19M19%2026l8-8M45%2026l-8-8%22%2F%3E%3Cpath%20d%3D%22M16%2048v6M48%2048v6%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mayday_luggage",
    "name": "劳动节出行",
    "category": "festival",
    "accent": "#a7b8c0",
    "tags": [
      "劳动节",
      "假期",
      "出游"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2219%22%20y%3D%2217%22%20width%3D%2226%22%20height%3D%2235%22%20rx%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M27%2017v-6h10v6M27%2029h10M25%2040h14%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "dragonboat",
    "name": "龙舟",
    "category": "festival",
    "accent": "#a7b8c0",
    "tags": [
      "端午节",
      "龙舟",
      "端午"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2039h40c-3%209-12%2013-20%2013S15%2048%2012%2039Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M26%2039l4-20%205%2020M30%2019l-4-5M30%2019l7-1%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "zongzi",
    "name": "粽子",
    "category": "festival",
    "accent": "#9fb29b",
    "tags": [
      "端午节",
      "粽子",
      "端午"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2012%2050%2035%2032%2055%2014%2035Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.38%22%2F%3E%3Cpath%20d%3D%22M32%2012v43M20%2027l24%2016M44%2027%2020%2043%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mugwort",
    "name": "艾草",
    "category": "festival",
    "accent": "#9fb29b",
    "tags": [
      "端午节",
      "艾草",
      "香包"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2052V21M32%2032c-9-3-13-9-10-13%204-4%2010%202%2010%209%201-9%207-14%2011-10%203%203-1%209-7%2012M32%2039c-8-2-12-6-11-10%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "mooncake",
    "name": "月饼",
    "category": "festival",
    "accent": "#d6a47f",
    "tags": [
      "中秋节",
      "月饼",
      "团圆"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2234%22%20r%3D%2218%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.35%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2234%22%20r%3D%229%22%2F%3E%3Cpath%20d%3D%22M32%2020v8M24%2028l8%205%208-5M24%2040l8-5%208%205M32%2040v8%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "fullmoon",
    "name": "满月",
    "category": "festival",
    "accent": "#d7b86e",
    "tags": [
      "中秋节",
      "月亮",
      "团圆"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2219%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.5%22%2F%3E%3Cpath%20d%3D%22M43%2019c-7%202-10%2010-7%2016%203%207%2010%2010%2016%207-4%208-14%2011-22%207-11-5-15-17-10-28%204-9%2014-14%2023-12Z%22%20fill%3D%22%23fffdf7%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "midautumn_lantern",
    "name": "中秋灯笼",
    "category": "festival",
    "accent": "#d6a47f",
    "tags": [
      "中秋节",
      "灯笼",
      "赏月"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M24%2020c5-4%2011-4%2016%200l2%2020c-6%206-14%206-20%200Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.3%22%2F%3E%3Cpath%20d%3D%22M24%2020h16M27%2029h10M28%2044v8M36%2044v8%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "moonrabbit",
    "name": "玉兔",
    "category": "festival",
    "accent": "#b3ada2",
    "tags": [
      "中秋节",
      "玉兔",
      "月亮"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2231%22%20cy%3D%2235%22%20r%3D%2215%22%20fill%3D%22%23b3ada2%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M24%2023V12c0-5%205-6%207%200v10M39%2023V12c0-5-5-6-7%200M27%2035h0M37%2035h0M30%2042c2%202%204%202%206%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "nationalflag",
    "name": "国庆红旗",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "国庆节",
      "国庆",
      "假期"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2053V12M16%2014h30L37%2024l9%2010H16Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.35%22%2F%3E%3Ccircle%20cx%3D%2225%22%20cy%3D%2220%22%20r%3D%223%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.8%22%2F%3E%3Cpath%20d%3D%22M16%2053h34%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "nationalfirework",
    "name": "国庆烟花",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "国庆节",
      "烟花",
      "庆祝"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2043V12M32%2022l-9-9M32%2022l9-9M32%2022l11-1M32%2022l-11-1M32%2022l7%2010M32%2022l-7%2010%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2212%22%20r%3D%222.5%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.75%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "nationalribbon",
    "name": "国庆彩带",
    "category": "festival",
    "accent": "#c89e9c",
    "tags": [
      "国庆节",
      "庆祝",
      "中国"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2018c12%208%2010%2020%200%2028M49%2018c-12%208-10%2020%200%2028M18%2024c8%204%209%209%209%2016M46%2024c-8%204-9%209-9%2016%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.18%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "festival_calendar",
    "name": "节日日期",
    "category": "festival",
    "accent": "#d7b86e",
    "tags": [
      "节日",
      "日历",
      "纪念"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2215%22%20y%3D%2212%22%20width%3D%2234%22%20height%3D%2242%22%20rx%3D%225%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M22%208v9M42%208v9M15%2024h34M24%2033h4M36%2033h4M24%2041h4M36%2041h4%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "medicine",
    "name": "药品",
    "category": "life",
    "accent": "#c89e9c",
    "tags": [
      "药品",
      "生病",
      "健康"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2216%22%20y%3D%2214%22%20width%3D%2232%22%20height%3D%2238%22%20rx%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M32%2023v20M22%2033h20%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "firstaid",
    "name": "急救箱",
    "category": "life",
    "accent": "#c89e9c",
    "tags": [
      "急救",
      "健康",
      "药箱"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2222%22%20width%3D%2236%22%20height%3D%2229%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M24%2022v-6h16v6M32%2029v13M25%2035h14%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "phonecall",
    "name": "电话",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "电话",
      "联系",
      "消息"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2014c-5%203-7%209-4%2016%204%2010%2012%2018%2022%2022%207%203%2013%200%2016-5l-8-7-6%204c-4-3-9-8-12-12l4-6Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.22%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "email",
    "name": "邮件",
    "category": "life",
    "accent": "#a7b8c0",
    "tags": [
      "邮件",
      "邮箱",
      "消息"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2211%22%20y%3D%2218%22%20width%3D%2242%22%20height%3D%2230%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22m13%2021%2019%2016%2019-16M13%2046l15-13M51%2046%2036%2033%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "photo",
    "name": "照片",
    "category": "life",
    "accent": "#c89e9c",
    "tags": [
      "照片",
      "回忆",
      "拍照"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2212%22%20y%3D%2218%22%20width%3D%2240%22%20height%3D%2233%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.18%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2234%22%20r%3D%229%22%2F%3E%3Cpath%20d%3D%22M21%2018l4-6h14l4%206%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "cooking",
    "name": "做饭",
    "category": "life",
    "accent": "#d6a47f",
    "tags": [
      "做饭",
      "厨房",
      "生活"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2031h34v18a7%207%200%200%201-7%207H22a7%207%200%200%201-7-7V31Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M11%2031h42M22%2022c4-5%208%204%2012-1%204-5%208%204%2010%201%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "musicnote",
    "name": "音乐会",
    "category": "hobby",
    "accent": "#c89e9c",
    "tags": [
      "音乐",
      "演出",
      "兴趣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M23%2018v27M23%2018l24-6v27%22%2F%3E%3Cellipse%20cx%3D%2218%22%20cy%3D%2247%22%20rx%3D%228%22%20ry%3D%226%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.45%22%2F%3E%3Cellipse%20cx%3D%2242%22%20cy%3D%2241%22%20rx%3D%228%22%20ry%3D%226%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.45%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "plantcare",
    "name": "浇花",
    "category": "hobby",
    "accent": "#9fb29b",
    "tags": [
      "植物",
      "浇水",
      "园艺"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2038h24v16H20Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%22.25%22%2F%3E%3Cpath%20d%3D%22M32%2038V21M32%2028c-7-2-10-7-7-10%204-3%207%201%207%206%201-8%207-11%2010-7%202%203-1%208-7%2011%22%2F%3E%3Cpath%20d%3D%22M15%2024h9v8c-2%205-7%205-9%200Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%22.25%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "sleep",
    "name": "睡觉",
    "category": "mood",
    "accent": "#a7b8c0",
    "tags": [
      "睡觉",
      "晚安",
      "休息"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2044c5-13%2027-13%2032%200%22%2F%3E%3Cpath%20d%3D%22M22%2044v8h20v-8%22%2F%3E%3Cpath%20d%3D%22M26%2029c2-3%204%201%206-1%202-2%204%201%206%200%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "raincoat",
    "name": "雨衣",
    "category": "daily",
    "accent": "#d7b86e",
    "tags": [
      "下雨",
      "雨天",
      "穿衣"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M25%2014h14l8%2012-5%208v20H22V34l-5-8%208-12Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%22.22%22%2F%3E%3Cpath%20d%3D%22M25%2014c3%205%2011%205%2014%200M22%2034h20%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  },
  {
    "id": "notebook",
    "name": "记事本",
    "category": "daily",
    "accent": "#c89e9c",
    "tags": [
      "记事",
      "笔记",
      "记录"
    ],
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2210%22%20width%3D%2231%22%20height%3D%2245%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%22.2%22%2F%3E%3Cpath%20d%3D%22M24%2010v45M29%2021h13M29%2030h13M29%2039h10%22%2F%3E%3C%2Fg%3E%0A%3C%2Fsvg%3E"
  }
];
STICKERS.push(...SUPPLEMENT_STICKERS.map(({body, ...rest}) => ({...rest, tags:[...new Set([rest.name,...(rest.tags||[])])]})));


const RECOMMENDATION_RULES = [
  [/咖啡|拿铁|咖啡店|☕/, ['coffee','tea','cake']],
  [/奶茶|下午茶|喝|饮料/, ['tea','donut','icecream']],
  [/早餐|面包|吐司/, ['bread','coffee','apple']],
  [/午餐|晚餐|吃饭|拉面|米饭|面/, ['ramen','rice','bread']],
  [/蛋糕|生日|庆祝/, ['cake','gift','candle','happy']],
  [/水果|苹果|梨|草莓|橙子/, ['apple','pear','strawberry','orange']],
  [/下雨|雨天|下雨了/, ['rain','umbrella','cloud']],
  [/晴|阳光|晴天|太阳/, ['sun','cloud','happy']],
  [/夜晚|晚上|晚安|睡觉|熬夜/, ['moon','star','sleepy','tired']],
  [/海|海边|大海|海滩/, ['whale','lighthouse','sun','fish']],
  [/旅行|旅游|机场|出发|出差/, ['suitcase','plane','map','passport']],
  [/火车|车站|通勤/, ['train','bus','bag']],
  [/露营|户外/, ['tent','tree','star','campfire']],
  [/阅读|看书|读书/, ['book','pen','coffee']],
  [/学习|上课|考试/, ['book','pen','laptop']],
  [/工作|上班|办公|写代码/, ['laptop','coffee','pen','clock']],
  [/开会|会议/, ['laptop','coffee','clock']],
  [/音乐|听歌|演出|播客/, ['music','headphones']],
  [/电影|影院|追剧/, ['movie','popcorn','happy']],
  [/画画|绘画|创作|艺术/, ['paint','flower','star']],
  [/跑步|运动|健身|锻炼/, ['running','yoga','bicycle','ball']],
  [/骑车|骑行/, ['bicycle','sun','tree']],
  [/猫|猫咪/, ['cat','love']],
  [/狗|狗狗/, ['dog','love']],
  [/花|花园|春天/, ['flower','butterfly','bee','sprout']],
  [/成长|开始|新的开始/, ['sprout','sun','star']],
  [/开心|快乐|高兴/, ['happy','love','wow']],
  [/放松|治愈|舒服|平静/, ['calm','leaf','cloud']],
  [/累|疲惫|很困|熬夜/, ['tired','sleepy','coffee']],
  [/难过|失落|低落/, ['sad','cloud','rain']],
  [/生气|郁闷/, ['angry','cloud']],
  [/喜欢|心动|爱/, ['love','flower','happy']],
  [/惊喜|礼物|收到/, ['wow','gift','happy']],
  [/购物|逛街|买东西/, ['shopping','bag','gift']],
  [/回家|家里|房间/, ['home','plant','candle']]
];

const app = document.getElementById('app');
const now = new Date();
const currentYear = Math.max(2026, now.getFullYear());
const currentMonth = now.getFullYear() >= 2026 ? now.getMonth() : 0;
const currentDay = now.getFullYear() >= 2026 ? now.getDate() : 1;

let state = {
  year: currentYear, month: currentMonth, selectedDay: currentDay,
  drawerOpen: false, stickerCategory:'all', stickerSearch:'', recommendedIds:[],
  multiSelectMode:false, selectedLibrary:new Set(), canvasMultiSelect:false, selectedCanvas:new Set(),
  monthEntries:{}, entry:null, user:null, authOpen:false, profileOpen:false,
  email:'', authStatus:'', status:'', autosaveStatus:'', drag:null, selectedText:null, historyPast:[], historyFuture:[], textEditStart:null, historyBusy:false, draftTimer:null, recoTimer:null, inputComposing:false, stickerSearchComposing:false
};

function dateKey(year,month,day){ return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
function currentDateKey(){ return dateKey(state.year,state.month,state.selectedDay); }
function emptyEntry(date){ return {entry_date:date,title:'',content:'',background:'#fffdf7',stickers:[],titlePos:{x:.10,y:.18},contentPos:{x:.10,y:.36},titleStyle:{fontSize:25,align:'left'},contentStyle:{fontSize:12,align:'left'}}; }
function isToday(year,month,day){ return year===now.getFullYear() && month===now.getMonth() && day===now.getDate(); }
function sanitizeText(value){ return String(value ?? '').replace(/[<>&]/g, ch=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[ch])); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function uid(prefix='x'){ return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

function cloneEntry(entry){ return JSON.parse(JSON.stringify(entry||emptyEntry(currentDateKey()))); }
function resetHistory(){ state.historyPast=[]; state.historyFuture=[]; state.textEditStart=null; }
function pushHistory(before){ if(state.historyBusy)return; state.historyPast.push(cloneEntry(before)); if(state.historyPast.length>60)state.historyPast.shift(); state.historyFuture=[]; }
function undoChange(){ if(!state.historyPast.length)return; const current=cloneEntry(state.entry); state.historyFuture.push(current); state.entry=state.historyPast.pop(); saveDraft(state.entry); state.status='已撤销'; renderDrawer(); }
function redoChange(){ if(!state.historyFuture.length)return; const current=cloneEntry(state.entry); state.historyPast.push(current); state.entry=state.historyFuture.pop(); saveDraft(state.entry); state.status='已恢复'; renderDrawer(); }
function beginTextEdit(kind){ state.textEditStart={kind,before:cloneEntry(state.entry)}; }
function endTextEdit(){ const t=state.textEditStart; if(!t)return; state.textEditStart=null; if(JSON.stringify(t.before)!==JSON.stringify(state.entry)) pushHistory(t.before); }
function mutateEntry(mutator){ const before=cloneEntry(state.entry); mutator(); pushHistory(before); saveDraft(state.entry); }
function selectedSticker(){ const id=[...state.selectedCanvas][0]; return id?(state.entry.stickers||[]).find(x=>x.id===id):null; }
function updateSelectedSticker(mutator){ const before=cloneEntry(state.entry); const ids=[...state.selectedCanvas]; if(!ids.length)return; (state.entry.stickers||[]).forEach(item=>{if(ids.includes(item.id))mutator(item);}); pushHistory(before); saveDraft(state.entry); renderCanvasOnly(); }

function normalizeDesign(raw,date){
  const base = emptyEntry(date);
  if (Array.isArray(raw)) return {...base,stickers:normalizeStickerItems(raw)};
  if (!raw || typeof raw!=='object') return base;
  return {
    ...base,
    stickers: normalizeStickerItems(raw.stickers || []),
    titlePos: normalizePos(raw.titlePos || raw.title_position, base.titlePos),
    contentPos: normalizePos(raw.contentPos || raw.content_position, base.contentPos),
    titleStyle: normalizeTextStyle(raw.titleStyle || raw.title_style, base.titleStyle),
    contentStyle: normalizeTextStyle(raw.contentStyle || raw.content_style, base.contentStyle)
  };
}
function normalizePos(pos, fallback){
  if (!pos || typeof pos!=='object') return {...fallback};
  const x = Number(pos.x), y=Number(pos.y);
  if (!Number.isFinite(x)||!Number.isFinite(y)) return {...fallback};
  return {x:x>1?clamp(x/CANVAS_W,0,1):clamp(x,0,1), y:y>1?clamp(y/CANVAS_H,0,1):clamp(y,0,1)};
}
function normalizeTextStyle(style,fallback){ if(!style||typeof style!=='object')return {...fallback}; return {fontSize:Number.isFinite(Number(style.fontSize))?Number(style.fontSize):fallback.fontSize,align:['left','center','right'].includes(style.align)?style.align:fallback.align}; }
function normalizeStickerItems(items){
  if (!Array.isArray(items)) return [];
  return items.map((item,idx)=>{
    const x = Number(item?.x), y=Number(item?.y);
    return {
      id:String(item?.id || uid('st')),
      stickerId:String(item?.stickerId || ''),
      x:Number.isFinite(x)?(x>1?clamp(x/CANVAS_W,0,1):clamp(x,0,1)):.5,
      y:Number.isFinite(y)?(y>1?clamp(y/CANVAS_H,0,1):clamp(y,0,1)):.5,
      scale:clamp(Number(item?.scale)||1,.65,1.55),
      rotation:clamp(Number(item?.rotation)||0,-28,28),
      z:Number.isFinite(Number(item?.z))?Number(item.z):idx+1
    };
  }).filter(x=>STICKERS.some(s=>s.id===x.stickerId));
}

function getDisplayName(user){
  const metadata=user?.user_metadata||{};
  const preferred=String(metadata.display_name||metadata.nickname||'').trim();
  return preferred||'我的一隅';
}
function getInitial(name){ const value=String(name||'一').trim(); return sanitizeText(value.slice(0,1).toUpperCase()); }

function svgSticker(sticker,size=54){
  if (sticker?.inlineSvg) {
    return `<img class="sticker-image" src="${sticker.inlineSvg}" width="${size}" height="${size}" alt="${sanitizeText(sticker.name||'贴纸')}" loading="lazy" draggable="false" />`;
  }
  const stroke='#3f3f3b', accent=sticker?.accent||'#b7c9ad';
  const common=`fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"`;
  let content='';
  switch(sticker?.render){
    case 'coffee': content=`<path ${common} d="M15 27h29v17a9 9 0 0 1-9 9H24a9 9 0 0 1-9-9V27Z"/><path ${common} d="M44 31h5a6 6 0 0 1 0 12h-5"/><path ${common} d="M23 18c-2-4 4-5 2-9M33 18c-2-4 4-5 2-9"/><path d="M19 31h21v11H19z" fill="${accent}" opacity=".62"/>`; break;
    case 'tea': content=`<path ${common} d="M16 28h31v15a9 9 0 0 1-9 9H25a9 9 0 0 1-9-9V28Z"/><path ${common} d="M47 32h3a6 6 0 0 1 0 12h-3"/><path ${common} d="M24 18c-2-4 4-5 2-9"/><path d="M20 31h23v9H20z" fill="${accent}" opacity=".55"/>`; break;
    case 'book': content=`<path ${common} d="M11 17c10-4 18-2 21 2v34c-3-4-11-6-21-2V17Z"/><path ${common} d="M53 17c-10-4-18-2-21 2v34c3-4 11-6 21-2V17Z"/><path d="M15 23c7-2 12-1 17 1v23c-4-2-10-3-17-1Z" fill="${accent}" opacity=".42"/>`; break;
    case 'pen': content=`<path ${common} d="M18 48 42 20l7 7-24 28-10 3 3-10Z" fill="${accent}" opacity=".55"/><path ${common} d="m39 23 7 7M26 51l-5-5"/>`; break;
    case 'laptop': content=`<rect ${common} x="12" y="14" width="40" height="27" rx="4"/><path ${common} d="M8 48h48"/><path ${common} d="M20 48l2 4h20l2-4"/><path d="M17 19h30v20H17z" fill="${accent}" opacity=".28"/>`; break;
    case 'phone': content=`<rect ${common} x="19" y="9" width="26" height="46" rx="6" fill="${accent}" opacity=".26"/><path ${common} d="M28 50h8"/><path ${common} d="M26 14h12"/>`; break;
    case 'headphones': content=`<path ${common} d="M14 34v-5c0-10 8-18 18-18s18 8 18 18v5"/><path ${common} d="M14 34h6v13h-6zM44 34h6v13h-6z" fill="${accent}" opacity=".5"/>`; break;
    case 'camera': content=`<rect ${common} x="12" y="22" width="40" height="28" rx="6"/><path ${common} d="M22 22l4-6h12l4 6"/><circle ${common} cx="32" cy="36" r="9"/><circle cx="32" cy="36" r="5" fill="${accent}" opacity=".6"/>`; break;
    case 'bag': content=`<path ${common} d="M15 22h34l3 31H12l3-31Z" fill="${accent}" opacity=".42"/><path ${common} d="M24 22v-3a8 8 0 0 1 16 0v3"/>`; break;
    case 'clock': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".22"/><path ${common} d="M32 20v13l8 5"/>`; break;
    case 'journal': content=`<rect ${common} x="16" y="12" width="32" height="43" rx="3" fill="${accent}" opacity=".22"/><path ${common} d="M23 12v43M29 24h13M29 32h13M29 40h9"/>`; break;
    case 'glasses': content=`<circle ${common} cx="23" cy="33" r="9"/><circle ${common} cx="41" cy="33" r="9"/><path ${common} d="M32 33h-4M14 30l-4-2M50 30l4-2"/>`; break;

    case 'bread': content=`<path ${common} d="M18 48V28c0-8 6-13 14-13s14 5 14 13v20c0 3-3 5-7 5H25c-4 0-7-2-7-5Z" fill="${accent}" opacity=".6"/><path ${common} d="M24 28c3-3 12-3 15 0"/>`; break;
    case 'cake': content=`<path ${common} d="M12 30c10-7 30-7 40 0v20H12Z"/><path ${common} d="M12 41c10 7 30 7 40 0"/><path ${common} d="M17 26c4 3 8 3 12 0 4 4 8 4 12 0 2 2 4 3 6 2"/><path ${common} d="M26 21c0-4 5-4 5-8M39 21c0-4 5-4 5-8"/><path d="M17 33h30v7H17z" fill="${accent}" opacity=".52"/>`; break;
    case 'apple': content=`<path ${common} d="M32 19c-6-6-18-3-19 9-1 10 6 23 19 27 13-4 20-17 19-27-1-12-13-15-19-9Z" fill="${accent}" opacity=".55"/><path ${common} d="M32 17c1-6 6-9 11-8-3 6-7 9-11 8Z"/><path ${common} d="M31 18c0-5-3-7-7-8"/>`; break;
    case 'pear': content=`<path ${common} d="M34 19c4-7 2-10-1-12M35 18c9 1 13 9 11 18-2 11-9 19-15 19s-13-8-15-19c-2-9 2-18 11-18 3 0 5 2 8 0Z" fill="${accent}" opacity=".66"/><path ${common} d="M35 10c4-3 7-2 10-1"/>`; break;
    case 'strawberry': content=`<path ${common} d="M16 26c8-5 24-5 32 0-1 13-7 24-16 29-9-5-15-16-16-29Z" fill="${accent}" opacity=".58"/><path ${common} d="M21 21c3-6 9-6 11-1 2-5 8-5 11 1"/><circle cx="24" cy="33" r="1.6" fill="${stroke}"/><circle cx="33" cy="38" r="1.6" fill="${stroke}"/><circle cx="41" cy="32" r="1.6" fill="${stroke}"/>`; break;
    case 'orange': content=`<circle ${common} cx="32" cy="34" r="18" fill="${accent}" opacity=".55"/><path ${common} d="M32 16c0-4 4-6 7-6M33 14c4-3 7-2 10 0"/>`; break;
    case 'ramen': content=`<path ${common} d="M14 28h36v19a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8V28Z"/><path ${common} d="M12 28h40"/><path ${common} d="M22 21c5-3 10 4 15 0 4-3 7 1 9 2"/><path ${common} d="M21 36c6 4 14 4 22 0"/><path d="M18 30h28v11H18z" fill="${accent}" opacity=".25"/>`; break;
    case 'rice': content=`<path ${common} d="M14 34c6-6 30-6 36 0v14c0 5-4 7-8 7H22c-4 0-8-2-8-7V34Z"/><path ${common} d="M20 30c4-10 20-13 26-1"/><path d="M19 38h26v10H19z" fill="${accent}" opacity=".3"/>`; break;
    case 'donut': content=`<path d="M32 14c12 0 21 8 21 18s-9 18-21 18-21-8-21-18 9-18 21-18Z" fill="${accent}" opacity=".5"/><circle ${common} cx="32" cy="32" r="8"/><path ${common} d="M20 25l4-2M39 20l4 3M44 37l-4 3M20 39l-3-2"/>`; break;
    case 'icecream': content=`<path ${common} d="m20 33 12 23 12-23"/><path d="M22 31c-2-9 6-17 15-14 7-6 16 3 13 11-2 6-7 8-14 7-6 2-11 1-14-4Z" fill="${accent}" opacity=".55"/>`; break;
    case 'sushi': content=`<ellipse ${common} cx="32" cy="36" rx="17" ry="12" fill="${accent}" opacity=".42"/><path ${common} d="M15 36c3-12 31-12 34 0M20 31l8-5 8 5"/>`; break;
    case 'pizza': content=`<path d="M12 17c15 1 28 7 40 19L18 52c-3-11-5-23-6-35Z" fill="${accent}" opacity=".45"/><path ${common} d="M12 17c15 1 28 7 40 19L18 52c-3-11-5-23-6-35Z"/><circle cx="27" cy="31" r="3" fill="${stroke}"/><circle cx="35" cy="37" r="3" fill="${stroke}"/>`; break;

    case 'leaf': content=`<path ${common} d="M18 47C27 32 38 24 50 17c-2 15-10 29-27 35-3 1-5-2-5-5Z" fill="${accent}" opacity=".72"/><path ${common} d="M20 48c9-9 17-15 28-23"/>`; break;
    case 'flower': content=`<path ${common} d="M32 53V31"/><path ${common} d="M32 40c-8-3-11-8-8-11 4-4 8 0 8 5 0-7 5-11 8-8 3 3 0 8-5 10 8-1 13 3 11 7-2 4-8 3-12-1"/><circle cx="32" cy="27" r="4" fill="${accent}"/>`; break;
    case 'sprout': content=`<path ${common} d="M32 53V32"/><path ${common} d="M32 36c-10-4-14-10-11-14 3-4 10-2 12 8 1-9 7-14 12-10 3 3-1 10-13 16Z" fill="${accent}" opacity=".65"/>`; break;
    case 'tree': content=`<path ${common} d="M32 52V34"/><path ${common} d="M31 15c-8 0-13 5-13 12-7 1-9 10-3 14 6 4 25 4 33 0 6-4 4-13-3-14 0-7-6-12-14-12Z" fill="${accent}" opacity=".5"/>`; break;
    case 'sun': content=`<circle ${common} cx="32" cy="32" r="11" fill="${accent}" opacity=".65"/><path ${common} d="M32 7v7M32 50v7M7 32h7M50 32h7M14 14l5 5M45 45l5 5M50 14l-5 5M19 45l-5 5"/>`; break;
    case 'moon': content=`<path d="M42 15c-7 1-12 8-10 15 2 8 10 12 18 9-4 9-13 13-22 10-11-4-16-16-12-27 4-11 15-16 26-14Z" fill="${accent}" opacity=".6"/>`; break;
    case 'cloud': content=`<path ${common} d="M16 45h32a8 8 0 0 0 1-16c-2-8-14-12-20-3-8-5-17 1-15 9-5 0-6 10 2 10Z" fill="${accent}" opacity=".55"/>`; break;
    case 'rain': content=`<path ${common} d="M16 31h32a8 8 0 0 0 1-16c-2-8-14-12-20-3-8-5-17 1-15 9-5 0-6 10 2 10Z" fill="${accent}" opacity=".4"/><path ${common} d="M22 38l-3 8M33 38l-3 8M44 38l-3 8"/>`; break;
    case 'rainbow': content=`<path ${common} d="M13 45a19 19 0 0 1 38 0M20 45a12 12 0 0 1 24 0"/><path ${common} d="M17 45h30"/>`; break;
    case 'star': content=`<path d="m32 11 5 14 15 1-11 9 4 15-13-8-13 8 4-15-11-9 15-1 5-14Z" fill="${accent}" opacity=".55"/><path ${common} d="m32 11 5 14 15 1-11 9 4 15-13-8-13 8 4-15-11-9 15-1 5-14Z"/>`; break;
    case 'mountain': content=`<path d="M10 50 27 21l9 14 6-9 12 24Z" fill="${accent}" opacity=".34"/><path ${common} d="M10 50 27 21l9 14 6-9 12 24"/>`; break;
    case 'seashell': content=`<path ${common} d="M14 43c4-17 32-22 38 0-8 7-30 7-38 0Z" fill="${accent}" opacity=".4"/><path ${common} d="M21 42c0-8 3-15 7-20M28 44c0-10 2-16 4-22M36 44c1-9 1-14-1-22M43 42c2-7 1-12-2-17"/>`; break;

    case 'cat': content=`<path ${common} d="M17 26l4-10 11 7 11-7 4 10v15c0 8-6 13-15 13S17 49 17 41V26Z" fill="${accent}" opacity=".32"/><circle cx="26" cy="33" r="2.2" fill="${stroke}"/><circle cx="38" cy="33" r="2.2" fill="${stroke}"/><path ${common} d="M29 40c2 2 4 2 6 0"/>`; break;
    case 'dog': content=`<path ${common} d="M18 27c-4-8 1-13 7-7l7 4 7-4c6-6 11-1 7 7v15c0 8-6 12-14 12s-14-4-14-12V27Z" fill="${accent}" opacity=".34"/><circle cx="26" cy="34" r="2.2" fill="${stroke}"/><circle cx="38" cy="34" r="2.2" fill="${stroke}"/><path ${common} d="M29 41c2 2 4 2 6 0"/>`; break;
    case 'bear': content=`<circle ${common} cx="23" cy="21" r="6" fill="${accent}" opacity=".45"/><circle ${common} cx="41" cy="21" r="6" fill="${accent}" opacity=".45"/><path ${common} d="M17 31c0-9 30-9 30 0v12c0 9-6 13-15 13s-15-4-15-13V31Z" fill="${accent}" opacity=".42"/><circle cx="26" cy="36" r="2" fill="${stroke}"/><circle cx="38" cy="36" r="2" fill="${stroke}"/><path ${common} d="M29 43c2 2 4 2 6 0"/>`; break;
    case 'rabbit': content=`<path ${common} d="M23 25V11c0-5 5-7 7-1l2 12M41 25V11c0-5-5-7-7-1l-2 12"/><path ${common} d="M17 31c0-8 7-13 15-13s15 5 15 13v11c0 8-6 13-15 13s-15-5-15-13V31Z" fill="${accent}" opacity=".3"/><circle cx="26" cy="34" r="2" fill="${stroke}"/><circle cx="38" cy="34" r="2" fill="${stroke}"/><path ${common} d="M29 41c2 2 4 2 6 0"/>`; break;
    case 'penguin': content=`<ellipse ${common} cx="32" cy="36" rx="17" ry="21" fill="${accent}" opacity=".25"/><path ${common} d="M24 18c5-5 11-5 16 0"/><circle cx="27" cy="29" r="2"/><circle cx="37" cy="29" r="2"/><path d="M30 33h4l-2 3Z" fill="#d7b86e"/>`; break;
    case 'bird': content=`<path ${common} d="M14 35c6-8 14-13 23-11 8 2 13 9 13 17-8 3-15 2-21-2-5 3-10 3-15-1Z" fill="${accent}" opacity=".45"/><path ${common} d="M34 30c4-6 8-6 12-5"/><circle cx="41" cy="28" r="1.8" fill="${stroke}"/>`; break;
    case 'fish': content=`<path ${common} d="M12 35c8-12 25-17 37-5-12 12-29 7-37 5Z" fill="${accent}" opacity=".46"/><path ${common} d="M49 27l7-6-2 14 2 14-7-6"/><circle cx="22" cy="31" r="2" fill="${stroke}"/>`; break;
    case 'butterfly': content=`<path ${common} d="M32 27c-4-12-14-18-18-10-3 6 4 14 16 17-11 4-17 11-13 16 5 6 13-2 16-11 3 9 11 17 16 11 4-5-2-12-13-16 12-3 19-11 16-17-4-8-14-2-20 10Z" fill="${accent}" opacity=".34"/><path ${common} d="M32 24v23"/>`; break;
    case 'bee': content=`<path ${common} d="M19 36c0-8 6-14 13-14s13 6 13 14-6 14-13 14-13-6-13-14Z" fill="${accent}" opacity=".45"/><path ${common} d="M24 26v20M32 23v26M40 26v20"/><path ${common} d="M23 21c-1-6 4-8 8-3 4-5 9-3 8 3"/>`; break;
    case 'whale': content=`<path ${common} d="M13 34c7-9 18-15 31-11 5 2 8 6 8 12-3 9-13 14-24 12-8-2-13-6-15-13Z" fill="${accent}" opacity=".42"/><path ${common} d="M39 25c3-7 9-7 13-1M43 22c2-5 6-5 8-2"/><circle cx="27" cy="31" r="2" fill="${stroke}"/>`; break;
    case 'frog': content=`<circle ${common} cx="23" cy="25" r="8" fill="${accent}" opacity=".42"/><circle ${common} cx="41" cy="25" r="8" fill="${accent}" opacity=".42"/><path ${common} d="M16 34c2 12 30 12 32 0" fill="${accent}" opacity=".3"/><circle cx="23" cy="25" r="2"/><circle cx="41" cy="25" r="2"/>`; break;
    case 'fox': content=`<path ${common} d="M17 26 21 13l11 7 11-7 4 13v13c0 9-6 14-15 14s-15-5-15-14V26Z" fill="${accent}" opacity=".34"/><circle cx="26" cy="34" r="2"/><circle cx="38" cy="34" r="2"/><path ${common} d="M29 41c2 2 4 2 6 0"/>`; break;

    case 'happy': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".35"/><circle cx="25" cy="29" r="2" fill="${stroke}"/><circle cx="39" cy="29" r="2" fill="${stroke}"/><path ${common} d="M24 38c5 5 11 5 16 0"/>`; break;
    case 'calm': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".25"/><path ${common} d="M22 35c4 3 7 3 10 0 3 3 6 3 10 0"/><path ${common} d="M25 28h0M39 28h0"/>`; break;
    case 'excited': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".28"/><path ${common} d="M24 28h5M35 28h5M26 39c4-5 8-5 12 0"/><path ${common} d="M32 8v5M10 16l4 3M54 16l-4 3"/>`; break;
    case 'tired': content=`<path ${common} d="M17 29c3-9 11-14 20-12 9 1 15 10 13 19-2 12-13 20-24 16-9-3-14-13-9-23Z" fill="${accent}" opacity=".3"/><path ${common} d="M24 33l5 0M35 33l5 0M30 40c2-2 4-2 6 0"/>`; break;
    case 'sad': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".2"/><path ${common} d="M24 29h0M40 29h0M26 41c4-5 8-5 12 0"/><path ${common} d="M39 41c0 5 5 6 5 10"/>`; break;
    case 'angry': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".2"/><path ${common} d="M22 27l7 3M42 27l-7 3M25 41c5 3 9 3 14 0"/>`; break;
    case 'heart': content=`<path d="M32 51S13 40 13 26c0-8 10-12 16-5 3-4 13-6 19 1 8 10-4 21-16 29Z" fill="${accent}" opacity=".56"/><path ${common} d="M32 51S13 40 13 26c0-8 10-12 16-5 3-4 13-6 19 1 8 10-4 21-16 29Z"/>`; break;
    case 'wow': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".24"/><circle cx="25" cy="28" r="2"/><circle cx="39" cy="28" r="2"/><circle cx="32" cy="40" r="4" fill="none" stroke="${stroke}" stroke-width="2.8"/>`; break;

    case 'suitcase': content=`<rect ${common} x="14" y="22" width="36" height="29" rx="5" fill="${accent}" opacity=".38"/><path ${common} d="M24 22v-5h16v5M22 51v5M42 51v5M14 31h36"/>`; break;
    case 'plane': content=`<path ${common} d="M12 34l18-5 12-17 5 1-7 18 11 7-2 4-12-4-10 13-4-2 5-14-16-1Z" fill="${accent}" opacity=".38"/>`; break;
    case 'train': content=`<rect ${common} x="15" y="14" width="34" height="34" rx="7" fill="${accent}" opacity=".28"/><path ${common} d="M23 48l-5 7M41 48l5 7M18 31h32"/><circle cx="25" cy="39" r="3" fill="${stroke}"/><circle cx="39" cy="39" r="3" fill="${stroke}"/>`; break;
    case 'bus': content=`<rect ${common} x="12" y="17" width="40" height="34" rx="6" fill="${accent}" opacity=".32"/><path ${common} d="M18 27h28M22 51v5M42 51v5"/><circle cx="23" cy="42" r="3" fill="${stroke}"/><circle cx="41" cy="42" r="3" fill="${stroke}"/>`; break;
    case 'map': content=`<path ${common} d="M10 17l14-5 16 5 14-5v35l-14 5-16-5-14 5V17Z" fill="${accent}" opacity=".25"/><path ${common} d="M24 12v35M40 17v35"/><path ${common} d="M29 23c0-4 6-4 6 0 0 5-3 8-3 8s-3-3-3-8Z"/>`; break;
    case 'tent': content=`<path ${common} d="M10 52 32 14l22 38H10Z" fill="${accent}" opacity=".35"/><path ${common} d="M32 14v38M23 52l9-18 9 18"/>`; break;
    case 'lighthouse': content=`<path ${common} d="M23 51h18M25 23h14l-2 28H27l-2-28Z" fill="${accent}" opacity=".3"/><path ${common} d="M22 23h20l-3-8H25l-3 8ZM31 15V9h2v6M20 31h24"/>`; break;
    case 'passport': content=`<rect ${common} x="16" y="10" width="32" height="44" rx="4" fill="${accent}" opacity=".28"/><circle ${common} cx="32" cy="31" r="8"/><path ${common} d="M22 46h20"/>`; break;

    case 'music': content=`<path ${common} d="M22 22v24M22 22l23-5v24"/><path ${common} d="M22 40c-5-2-10 1-10 6s5 6 10 3c4-3 4-8 0-9Z" fill="${accent}" opacity=".55"/><path ${common} d="M45 36c-5-2-10 1-10 6s5 6 10 3c4-3 4-8 0-9Z" fill="${accent}" opacity=".55"/>`; break;
    case 'paint': content=`<path ${common} d="M20 41c-5 4-3 11 5 11h9c7 0 11-4 11-10 0-6-4-10-10-10-4 0-6-2-8-5-4-6-12-3-12 4 0 4 2 7 5 10Z" fill="${accent}" opacity=".45"/><circle cx="24" cy="25" r="2"/><circle cx="33" cy="21" r="2"/><circle cx="41" cy="25" r="2"/>`; break;
    case 'movie': content=`<rect ${common} x="11" y="18" width="42" height="30" rx="5"/><path ${common} d="M11 26h42M22 18l5 8M33 18l5 8M44 18l5 8"/><path d="m28 34 10 5-10 5Z" fill="${accent}" opacity=".65"/>`; break;
    case 'game': content=`<path ${common} d="M14 40c-3-9 2-17 11-17h14c9 0 14 8 11 17-2 6-7 8-11 2l-4-5H27l-4 5c-4 6-9 4-11-2Z" fill="${accent}" opacity=".3"/><path ${common} d="M21 31v10M16 36h10M40 34h0M46 34h0"/>`; break;
    case 'yoga': content=`<circle ${common} cx="32" cy="17" r="5"/><path ${common} d="M32 22v15M32 28l-11-6M32 28l11-6M32 37l-11 14M32 37l11 14"/>`; break;
    case 'running': content=`<circle ${common} cx="36" cy="14" r="5"/><path ${common} d="M33 21l-5 14 10 5M28 28l11 2M31 35l-11 7M37 40l9 10"/>`; break;
    case 'bicycle': content=`<circle ${common} cx="20" cy="43" r="10"/><circle ${common} cx="44" cy="43" r="10"/><path ${common} d="M20 43l11-15 7 15M31 28h10M31 28l-4-7M38 43h-9"/>`; break;
    case 'ball': content=`<circle ${common} cx="32" cy="32" r="19" fill="${accent}" opacity=".28"/><path ${common} d="M18 22c8 3 20 0 28-6M18 42c8-3 20 0 28 6M24 14c2 7 5 14 8 18M40 50c-2-7-5-14-8-18"/>`; break;
    case 'gardening': content=`<path ${common} d="M20 35h24v18H20z" fill="${accent}" opacity=".38"/><path ${common} d="M32 35V18M32 25c-8-3-11-8-8-11 4-4 8 0 8 5 0-7 5-11 8-8 3 3 0 8-5 10"/>`; break;

    case 'home': content=`<path ${common} d="M12 31 32 14l20 17"/><path ${common} d="M17 29v24h30V29" fill="${accent}" opacity=".25"/><path ${common} d="M28 53V40h8v13"/>`; break;
    case 'gift': content=`<rect ${common} x="14" y="24" width="36" height="29" rx="3" fill="${accent}" opacity=".34"/><path ${common} d="M12 24h40v9H12Z"/><path ${common} d="M32 24v29"/><path ${common} d="M32 24c-8 0-12-4-9-8 3-4 9 1 9 8ZM32 24c8 0 12-4 9-8-3-4-9 1-9 8Z"/>`; break;
    case 'umbrella': content=`<path ${common} d="M12 30a20 20 0 0 1 40 0c-4-4-8-4-12 0-4-4-8-4-12 0-4-4-8-4-16 0Z" fill="${accent}" opacity=".45"/><path ${common} d="M32 30v19c0 4 6 5 8 1"/>`; break;
    case 'candle': content=`<rect ${common} x="23" y="25" width="18" height="25" rx="3" fill="${accent}" opacity=".44"/><path ${common} d="M32 25c-4-5 2-8 1-13 5 4 5 9 1 13"/><path ${common} d="M18 52h28"/>`; break;
    case 'key': content=`<circle ${common} cx="23" cy="34" r="9"/><path ${common} d="M31 34h23M46 34v6M40 34v5"/>`; break;
    case 'mail': content=`<rect ${common} x="11" y="18" width="42" height="30" rx="4" fill="${accent}" opacity=".3"/><path ${common} d="m13 21 19 16 19-16M13 46l15-13M51 46 36 33"/>`; break;
    case 'shopping': content=`<path ${common} d="M16 22h32l4 31H12l4-31Z" fill="${accent}" opacity=".28"/><path ${common} d="M24 22v-3a8 8 0 0 1 16 0v3"/>`; break;
    case 'plant': content=`<path ${common} d="M20 35h24v17H20z" fill="${accent}" opacity=".38"/><path ${common} d="M32 35V18M32 25c-8-3-11-8-8-11 4-4 8 0 8 5 0-7 5-11 8-8 3 3 0 8-5 10"/>`; break;
    case 'alarm': content=`<circle ${common} cx="32" cy="34" r="18" fill="${accent}" opacity=".28"/><path ${common} d="M24 14l-6-5M40 14l6-5M32 20v14l8 5"/>`; break;
    case 'calendar': content=`<rect ${common} x="13" y="16" width="38" height="37" rx="5" fill="${accent}" opacity=".23"/><path ${common} d="M20 11v10M44 11v10M13 27h38M23 34h6M35 34h6M23 42h6M35 42h6"/>`; break;
    case 'keyboard': content=`<rect ${common} x="10" y="22" width="44" height="24" rx="5" fill="${accent}" opacity=".24"/><path ${common} d="M16 30h2M22 30h2M28 30h2M34 30h2M40 30h2M16 37h2M22 37h2M28 37h12"/>`; break;
    case 'mouse': content=`<path ${common} d="M22 14h20c5 0 9 4 9 9v12c0 11-9 19-19 19s-19-8-19-19V23c0-5 4-9 9-9Z" fill="${accent}" opacity=".26"/><path ${common} d="M32 14v14M28 20h8"/>`; break;
    case 'water': content=`<path ${common} d="M20 14h24l-2 34c-4 5-16 5-20 0l-2-34Z" fill="${accent}" opacity=".25"/><path ${common} d="M22 14h20"/>`; break;
    case 'toast': content=`<path ${common} d="M16 48V27c0-8 6-13 16-13s16 5 16 13v21c0 4-3 6-7 6H23c-4 0-7-2-7-6Z" fill="${accent}" opacity=".58"/><path ${common} d="M24 28c4-3 12-3 16 0"/>`; break;
    case 'burger': content=`<path ${common} d="M15 29c2-10 9-15 17-15s15 5 17 15H15Z" fill="${accent}" opacity=".52"/><path ${common} d="M14 34h36M16 41h32M20 49h24"/><path ${common} d="M17 34l4 7h22l4-7"/>`; break;
    case 'croissant': content=`<path ${common} d="M13 39c3-13 12-22 23-22 8 0 14 5 15 12-2 10-11 18-23 18-6 0-11-3-15-8Z" fill="${accent}" opacity=".55"/><path ${common} d="M23 22c1 7 4 13 10 18M32 19c0 8 4 15 10 19M41 22c-1 7 2 11 7 14"/>`; break;
    case 'avocado': content=`<path ${common} d="M32 12c-11 0-20 15-20 27 0 11 9 16 20 16s20-5 20-16c0-12-9-27-20-27Z" fill="${accent}" opacity=".5"/><circle ${common} cx="32" cy="40" r="7" fill="#c6a36c"/>`; break;
    case 'noodles': content=`<path ${common} d="M15 28h34v18a8 8 0 0 1-8 8H23a8 8 0 0 1-8-8V28Z"/><path ${common} d="M20 23c7 5 11-5 16 0 5 5 9-4 12 0M22 35c8 5 15 5 22 0M22 41c8 5 15 5 22 0"/>`; break;
    case 'watermelon': content=`<path ${common} d="M12 31h40c-3 14-11 23-20 23S15 45 12 31Z" fill="${accent}" opacity=".55"/><path ${common} d="M18 31h28M23 38h2M31 42h2M40 37h2"/>`; break;
    case 'pine': content=`<path ${common} d="M32 12 17 31h9L15 44h13l-6 10h20l-6-10h13L38 31h9L32 12Z" fill="${accent}" opacity=".55"/><path ${common} d="M32 43v11"/>`; break;
    case 'ocean': content=`<path ${common} d="M12 36c7-7 13 7 20 0 7-7 13 7 20 0M12 46c7-7 13 7 20 0 7-7 13 7 20 0"/>`; break;
    case 'snow': content=`<path ${common} d="M32 11v42M14 21l36 22M50 21 14 43M23 15l9 10 9-10M23 49l9-10 9 10" fill="${accent}" opacity=".28"/>`; break;
    case 'fire': content=`<path ${common} d="M32 54c11 0 17-6 17-16 0-8-5-13-10-18 1 8-2 10-6 13 0-11-5-17-10-21 2 12-8 15-8 26 0 10 7 16 17 16Z" fill="${accent}" opacity=".55"/>`; break;
    case 'panda': content=`<circle ${common} cx="32" cy="34" r="18" fill="${accent}" opacity=".28"/><circle cx="25" cy="33" r="4"/><circle cx="39" cy="33" r="4"/><circle cx="32" cy="41" r="2.5" fill="${stroke}"/>`; break;
    case 'turtle': content=`<ellipse ${common} cx="32" cy="35" rx="18" ry="13" fill="${accent}" opacity=".42"/><circle ${common} cx="51" cy="36" r="5"/><path ${common} d="M18 30l-7-5M18 40l-7 5M40 30l7-5M40 40l7 5"/>`; break;
    case 'deer': content=`<path ${common} d="M20 48c-2-10 3-18 12-18s14 8 12 18M25 26l-7-9M39 26l7-9M21 23l-4-1M43 23l4-1"/>`; break;
    case 'elephant': content=`<path ${common} d="M18 42V29c0-9 7-15 16-15s16 6 16 15v13M18 36c-8-2-9-12-3-14 4-1 7 2 7 6M45 35c8-2 10-10 4-14" fill="${accent}" opacity=".24"/>`; break;
    case 'seal': content=`<ellipse ${common} cx="32" cy="36" rx="20" ry="14" fill="${accent}" opacity=".35"/><circle cx="25" cy="34" r="2" fill="${stroke}"/><circle cx="39" cy="34" r="2" fill="${stroke}"/><path ${common} d="M29 42c2 2 4 2 6 0"/>`; break;
    case 'sleepy': content=`<circle ${common} cx="32" cy="33" r="19" fill="${accent}" opacity=".24"/><path ${common} d="M23 33h5M36 33h5M28 41c3 2 5 2 8 0"/><path ${common} d="M44 12h8M48 8v8"/>`; break;
    case 'popcorn': content=`<path ${common} d="M17 25h30l-3 29H20l-3-29Z" fill="${accent}" opacity=".4"/><path ${common} d="M21 23c-4-4 1-9 6-5 3-7 9-6 11 0 6-4 11 2 6 7"/>`; break;
    case 'hotel': content=`<path ${common} d="M14 52V20h36v32M20 28h8M36 28h8M20 36h8M36 36h8M27 52V42h10v10" fill="${accent}" opacity=".22"/>`; break;
    case 'car': content=`<path ${common} d="M14 40h36l-4-13c-1-3-4-5-7-5H25c-4 0-6 2-8 5l-3 13Z" fill="${accent}" opacity=".32"/><circle ${common} cx="22" cy="43" r="5"/><circle ${common} cx="42" cy="43" r="5"/><path ${common} d="M19 33h26"/>`; break;
    case 'boat': content=`<path ${common} d="M14 37h36l-7 13H21L14 37Z" fill="${accent}" opacity=".4"/><path ${common} d="M32 37V16M32 18h11l-11 10"/>`; break;
    default: content=`<circle ${common} cx="32" cy="32" r="20"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${content}</svg>`;
}

async function ensureSupabaseClient(){
  if (supabase || !SUPABASE_URL || !SUPABASE_KEY) return supabase;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    createClient = mod.createClient;
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    return supabase;
  } catch (error) {
    console.warn('Supabase client load failed:', error);
    return null;
  }
}

function renderShell(){
  app.innerHTML=`
    <main class="app-shell">
      <header class="topbar">
        <div class="brand-lockup"><div class="brand-mark" aria-hidden="true"><span></span><i></i></div><div><div class="brand-cn">一隅</div><div class="brand-en">IN DAYS</div></div></div>
        <div class="top-actions"><button class="today-button" id="todayBtn">回到今天</button><span id="accountArea"></span></div>
      </header>
      <section class="hero">
        <div class="month-nav"><button class="nav-button" id="prevMonth" aria-label="上个月">←</button><div class="month-heading"><p class="eyebrow" id="yearLabel"></p><h1 id="monthLabel"></h1></div><button class="nav-button" id="nextMonth" aria-label="下个月">→</button></div>
        <p class="subtitle">给每天留一隅。</p>
      </section>
      <section class="calendar-card"><div class="weekday-row">${weekdayLabels.map(label=>`<div>${label}</div>`).join('')}</div><div class="calendar-grid" id="calendarGrid"></div></section>
      <section class="selected-summary"><div><p class="section-kicker">TODAY'S CORNER</p><h2 id="selectedDate"></h2><p id="selectedPreview"></p></div><button class="open-editor" id="openEditor">进入这一隅 <span>↗</span></button></section>
      <footer>一隅 · IN DAYS</footer>
    </main>
    <div id="drawerRoot"></div><div id="authRoot"></div><div id="profileRoot"></div><div class="toast" id="toast"></div>
  `;
  document.getElementById('prevMonth').addEventListener('click',()=>moveMonth(-1));
  document.getElementById('nextMonth').addEventListener('click',()=>moveMonth(1));
  document.getElementById('todayBtn').addEventListener('click',goToday);
  document.getElementById('openEditor').addEventListener('click',()=>openDrawer());
  renderAccount();
}

function renderAccount(){
  const area=document.getElementById('accountArea');
  if(!supabase){ area.innerHTML=`<span class="local-badge">本地模式</span>`; return; }
  if(state.user){
    const name=sanitizeText(getDisplayName(state.user));
    area.innerHTML=`<button class="account-button" id="profileBtn" aria-label="打开个人设置"><span class="account-avatar">${getInitial(getDisplayName(state.user))}</span><span class="account-name">${name}</span><span class="account-chevron">⌄</span></button>`;
    document.getElementById('profileBtn').addEventListener('click',openProfile);
  }else{
    area.innerHTML=`<button class="account-button primary-outline" id="loginBtn">登录 / 注册</button>`;
    document.getElementById('loginBtn').addEventListener('click',openAuth);
  }
}

function openProfile(){
  if(!state.user) return openAuth();
  state.profileOpen=true;
  const displayName=getDisplayName(state.user), email=String(state.user.email||'');
  const maskedEmail=email?(email.length>18?`${email.slice(0,6)}…${email.slice(-10)}`:email):'已登录账号';
  document.getElementById('profileRoot').innerHTML=`<button class="profile-backdrop" id="profileBackdrop"></button><section class="profile-modal" role="dialog" aria-modal="true"><button class="close-button" id="closeProfile">×</button><div class="section-kicker">IN DAYS ACCOUNT</div><h2>我的一隅</h2><p class="profile-email">${sanitizeText(maskedEmail)}</p><label class="field-label profile-field">显示名称<input id="displayNameInput" maxlength="20" value="${sanitizeText(displayName==='我的一隅'?'':displayName)}" placeholder="例如 Zoe、Momo…" /></label><p class="profile-hint">顶部只显示这个名称，不会直接暴露邮箱前缀。最多 20 个字符。</p><div class="profile-actions"><button class="danger-button profile-logout" id="profileLogout">退出登录</button><button class="save-button" id="saveProfile">保存昵称</button></div><div class="auth-status" id="profileStatus"></div></section>`;
  document.getElementById('profileBackdrop').addEventListener('click',closeProfile); document.getElementById('closeProfile').addEventListener('click',closeProfile); document.getElementById('saveProfile').addEventListener('click',saveProfile); document.getElementById('profileLogout').addEventListener('click',async()=>{await supabase.auth.signOut();closeProfile();});
  document.getElementById('displayNameInput')?.focus();
}
function closeProfile(){state.profileOpen=false;const root=document.getElementById('profileRoot');if(root)root.innerHTML='';}
async function saveProfile(){
  if(!state.user)return;
  const input=document.getElementById('displayNameInput'), status=document.getElementById('profileStatus'), name=String(input?.value||'').trim();
  if(!name){status.textContent='请先输入一个显示名称。';input?.focus();return;}
  status.textContent='保存中…';
  const {data,error}=await supabase.auth.updateUser({data:{display_name:name}});
  if(error){status.textContent=error.message||'保存失败，请稍后再试。';return;}
  state.user=data.user||state.user; renderAccount(); closeProfile(); toast('昵称已更新');
}

function commitDraftBeforeNavigation(){ endTextEdit(); if(state.drawerOpen && state.entry) saveDraft(state.entry); }
function moveMonth(delta){
  commitDraftBeforeNavigation();
  const current=state.year*12+state.month, min=2026*12, next=current+delta;
  if(next<min)return;
  state.year=Math.floor(next/12); state.month=next%12; state.selectedDay=state.year===currentYear&&state.month===currentMonth?currentDay:1; state.selectedCanvas.clear();
  renderCalendar(); loadCurrentMonth(); loadSelectedEntry();
}
function goToday(){ commitDraftBeforeNavigation(); state.year=currentYear; state.month=currentMonth; state.selectedDay=currentDay; state.drawerOpen=false; closeDrawer(); renderCalendar(); loadCurrentMonth(); loadSelectedEntry(); }

function previewFontSize(text, base, min, maxChars, factor=1){
  const len=[...String(text||'')].length;
  if(!len)return base;
  return clamp(base - Math.max(0, len-maxChars)*factor, min, base);
}
function calendarDayHtml(entry, key, day, active, today){
  const e=entry || emptyEntry(key);
  const stickers=(e.stickers||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).slice(0,14).map(p=>{
    const st=STICKERS.find(x=>x.id===p.stickerId); if(!st)return '';
    const x=clamp(Number(p.x)||.5,.06,.94)*100, y=clamp(Number(p.y)||.5,.18,.94)*100;
    const scale=clamp(Number(p.scale)||1,.65,1.55)*.30;
    const rot=clamp(Number(p.rotation)||0,-180,180);
    return `<div class="thumb-object thumb-sticker" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${rot}deg) scale(${scale})">${svgSticker(st,64)}</div>`;
  }).join('');
  const title=String(e.title||'').trim();
  const content=String(e.content||'').trim();
  const titleLen=[...title].length;
  const contentLen=[...content].length;
  const titleSize=title?clamp(15.5-Math.max(0,titleLen-10)*.28,8.2,15.5):0;
  const contentSize=content?clamp(10.2-Math.max(0,contentLen-26)*.035,6.2,10.2):0;
  const titleHtml=title?`<div class="thumb-object thumb-title" style="left:${clamp(e.titlePos?.x??.10,.04,.74)*100}%;top:${clamp(e.titlePos?.y??.18,.12,.72)*100}%;font-size:${titleSize}px;text-align:${e.titleStyle?.align||'left'}" title="${sanitizeText(title)}">${sanitizeText(title)}</div>`:'';
  const contentHtml=content?`<div class="thumb-object thumb-content" style="left:${clamp(e.contentPos?.x??.10,.04,.72)*100}%;top:${clamp(e.contentPos?.y??.36,.18,.78)*100}%;font-size:${contentSize}px;text-align:${e.contentStyle?.align||'left'}" title="${sanitizeText(content)}">${sanitizeText(content)}</div>`:'';
  const empty=!title&&!content&&!(e.stickers||[]).length;
  return `<button class="day-card ${active?'active':''} ${today?'today':''} ${entry?'has-entry':''}" data-day="${day}" aria-label="${state.year}年${state.month+1}月${day}日" style="--day-bg:${e.background||'#fffdf7'}">
    <div class="day-thumbnail" style="background:${e.background||'#fffdf7'}">${titleHtml}${contentHtml}${stickers}${empty?'<span class="thumb-empty"></span>':''}</div>
    <span class="day-number">${String(day).padStart(2,'0')}</span>
    ${today?'<span class="today-mark">TODAY</span>':''}
  </button>`;
}
function renderCalendar(){
  document.getElementById('yearLabel').textContent=state.year;
  document.getElementById('monthLabel').textContent=monthNames[state.month];
  document.getElementById('selectedDate').textContent=currentDateKey();
  const currentEntry=state.monthEntries[currentDateKey()]||state.entry;
  const hasEntry=currentEntry&&(currentEntry.title||currentEntry.content||(currentEntry.stickers||[]).length);
  const previewText=(currentEntry?.title||currentEntry?.content||'').replace(/\s+/g,' ').trim();
  document.getElementById('selectedPreview').textContent=hasEntry?(previewText||'这一天已经留下了一些东西。'):'点击任意日期，写下一点今天的心情，再放几枚贴纸。';
  const grid=document.getElementById('calendarGrid');
  const firstWeekday=new Date(state.year,state.month,1).getDay();
  const mondayOffset=(firstWeekday+6)%7;
  const totalDays=new Date(state.year,state.month+1,0).getDate();
  const cells=[];
  for(let i=0;i<mondayOffset;i++)cells.push('<div class="day-card empty" aria-hidden="true"></div>');
  for(let day=1;day<=totalDays;day++){
    const key=dateKey(state.year,state.month,day), entry=state.monthEntries[key], active=day===state.selectedDay, today=isToday(state.year,state.month,day);
    cells.push(calendarDayHtml(entry,key,day,active,today));
  }
  grid.innerHTML=cells.join('');
  grid.querySelectorAll('.day-card[data-day]').forEach(btn=>btn.addEventListener('click',()=>{
    endTextEdit(); commitDraftBeforeNavigation(); state.selectedDay=Number(btn.dataset.day); state.selectedCanvas.clear(); renderCalendar(); loadSelectedEntry(); openDrawer();
  }));
  document.getElementById('prevMonth').disabled=state.year*12+state.month<=2026*12;
}

async function loadCurrentMonth(){
  const totalDays=new Date(state.year,state.month+1,0).getDate();
  const start=dateKey(state.year,state.month,1), end=dateKey(state.year,state.month,totalDays);
  state.monthEntries=await loadEntriesInRange(start,end); renderCalendar();
}

function getLocal(key){const raw=localStorage.getItem(LOCAL_PREFIX+key);return raw?JSON.parse(raw):null;}
function setLocal(entry){localStorage.setItem(LOCAL_PREFIX+entry.entry_date,JSON.stringify({...entry,updated_at:new Date().toISOString()}));}
function getDraft(key){const raw=localStorage.getItem(DRAFT_PREFIX+key);if(!raw)return null;try{return JSON.parse(raw);}catch{return null;}}
function saveDraft(entry){
  if(!entry?.entry_date)return;
  const design=normalizeDesign(entry,entry.entry_date);
  const payload={entry_date:entry.entry_date,title:entry.title||'',content:entry.content||'',background:entry.background||'#fffdf7',design,drafted_at:new Date().toISOString()};
  try{ localStorage.setItem(DRAFT_PREFIX+entry.entry_date,JSON.stringify(payload)); state.autosaveStatus='草稿已自动保存'; }
  catch(err){ console.warn('Draft save failed:',err); state.autosaveStatus='草稿保存失败'; }
}
function queueDraftSave(entry){
  clearTimeout(state.draftTimer);
  state.autosaveStatus='正在保存草稿…';
  state.draftTimer=setTimeout(()=>saveDraft(entry),180);
}
function queueRecommendationUpdate(){
  clearTimeout(state.recoTimer);
  state.recoTimer=setTimeout(()=>{ if(state.drawerOpen) updateStickerPanelResults(); },180);
}
function clearDraft(date){localStorage.removeItem(DRAFT_PREFIX+date);}
function entryFromRow(row){
  if(!row)return null;
  const design=normalizeDesign(row.stickers,row.entry_date);
  return {...row,stickers:design.stickers,titlePos:design.titlePos,contentPos:design.contentPos,titleStyle:design.titleStyle,contentStyle:design.contentStyle};
}
function chooseWithDraft(entry,date){
  const draft=getDraft(date); if(!draft)return entry;
  const draftTime=Date.parse(draft.drafted_at||''); const savedTime=Date.parse(entry?.updated_at||'1970-01-01T00:00:00Z');
  if(Number.isFinite(draftTime)&&draftTime>savedTime){
    const design=normalizeDesign(draft.design,date);
    return {id:entry?.id,user_id:entry?.user_id,entry_date:date,title:draft.title||'',content:draft.content||'',background:draft.background||'#fffdf7',stickers:design.stickers,titlePos:design.titlePos,contentPos:design.contentPos,titleStyle:design.titleStyle,contentStyle:design.contentStyle,updated_at:entry?.updated_at||null,_draft:true};
  }
  return entry;
}

async function loadEntry(date){
  let row=null;
  if(!supabase) row=getLocal(date);
  else if(state.user){
    const {data,error}=await supabase.from('journal_entries').select('id,user_id,entry_date,title,content,background,stickers,updated_at').eq('entry_date',date).eq('user_id',state.user.id).maybeSingle();
    if(error){console.warn(error);toast('读取记录失败：'+error.message);}
    row=data||null;
  }
  return chooseWithDraft(entryFromRow(row),date);
}
async function loadEntriesInRange(startDate,endDate){
  if(supabase){
    if(!state.user)return {};
    const {data,error}=await supabase.from('journal_entries').select('id,user_id,entry_date,title,content,background,stickers,updated_at').eq('user_id',state.user.id).gte('entry_date',startDate).lte('entry_date',endDate).order('entry_date',{ascending:true});
    if(error){console.warn(error);toast('读取月份失败：'+error.message);return {};}
    return Object.fromEntries((data||[]).map(row=>[row.entry_date,entryFromRow(row)]));
  }
  const result={};let cursor=new Date(`${startDate}T00:00:00`),end=new Date(`${endDate}T00:00:00`);
  while(cursor<=end){const k=cursor.toISOString().slice(0,10);const item=chooseWithDraft(getLocal(k),k);if(item)result[k]=item;cursor.setDate(cursor.getDate()+1);}return result;
}

async function loadSelectedEntry(){
  const key=currentDateKey(); state.status='读取中…';
  state.entry=await loadEntry(key)||emptyEntry(key);
  resetHistory();
  state.selectedCanvas.clear(); state.selectedText=null;
  state.status=state.entry._draft?'有未保存草稿':(state.entry.id?'已保存':(supabase&&!state.user?'请登录后保存':'新的一天'));
  renderCalendar(); if(state.drawerOpen)renderDrawer();
}

async function currentUserId(){if(!supabase)return null;const {data}=await supabase.auth.getUser();return data?.user?.id||null;}

async function saveEntry(){
  if(supabase&&!state.user){openAuth();return;}
  try{
    const date=currentDateKey();
    const payloadEntry={entry_date:date,title:state.entry.title||'',content:state.entry.content||'',background:state.entry.background||'#fffdf7',design:normalizeDesign(state.entry, date)};
    if(supabase){
      const userId=await currentUserId();if(!userId)throw new Error('请先登录后再保存记录。');
      const payload={user_id:userId,entry_date:date,title:payloadEntry.title,content:payloadEntry.content,background:payloadEntry.background,stickers:payloadEntry.design,updated_at:new Date().toISOString()};
      const {data,error}=await supabase.from('journal_entries').upsert(payload,{onConflict:'user_id,entry_date'}).select('id,user_id,entry_date,title,content,background,stickers,updated_at').single();
      if(error)throw error; state.entry=entryFromRow(data);
    }else{setLocal({...payloadEntry,stickers:payloadEntry.design});state.entry={...payloadEntry,stickers:payloadEntry.design.stickers,titlePos:payloadEntry.design.titlePos,contentPos:payloadEntry.design.contentPos,updated_at:new Date().toISOString()};}
    clearDraft(date); state.entry._draft=false; state.monthEntries[date]=state.entry; state.status='已保存'; renderCalendar(); renderDrawer(); toast('已保存到云端');
  }catch(e){state.status=e.message||'保存失败';renderDrawer();toast(state.status);}
}
async function deleteEntry(){
  const date=currentDateKey();
  try{
    if(supabase){if(!state.user)throw new Error('请先登录。');const {error}=await supabase.from('journal_entries').delete().eq('entry_date',date).eq('user_id',state.user.id);if(error)throw error;}else localStorage.removeItem(LOCAL_PREFIX+date);
    clearDraft(date);delete state.monthEntries[date];state.entry=emptyEntry(date);resetHistory();state.status='已清空';renderCalendar();renderDrawer();toast('已清空');
  }catch(e){state.status=e.message||'清空失败';renderDrawer();toast(state.status);}
}

function getTextForRecommendations(){return `${state.entry?.title||''} ${state.entry?.content||''}`.trim();}
function recommendationIds(){
  const text=getTextForRecommendations().toLowerCase(); if(!text)return [];
  const scores=new Map();
  for(const [pattern,ids] of RECOMMENDATION_RULES){if(pattern.test(text))ids.forEach(id=>scores.set(id,(scores.get(id)||0)+3));}
  for(const sticker of STICKERS){
    for(const rawTag of (sticker.tags||[])){
      const tag=String(rawTag||'').trim().toLowerCase();
      if(tag.length>=2 && text.includes(tag)) scores.set(sticker.id,(scores.get(sticker.id)||0)+2);
    }
  }
  return [...scores.entries()].sort((a,b)=>b[1]-a[1]).filter(([id])=>STICKERS.some(st=>st.id===id)).slice(0,12).map(([id])=>id);
}
function filteredStickers(){
  const q=state.stickerSearch.trim().toLowerCase();
  let list=STICKERS;
  if(state.stickerCategory==='recommended')list=state.recommendedIds.map(id=>STICKERS.find(s=>s.id===id)).filter(Boolean);
  else if(state.stickerCategory!=='all')list=list.filter(s=>s.category===state.stickerCategory);
  if(q)list=list.filter(s=>s.tags.join(' ').toLowerCase().includes(q)||s.id.toLowerCase().includes(q));
  return list;
}

function addStickerAt(sticker,x,y){
  const placed={id:uid(sticker.id),stickerId:sticker.id,x:clamp(x,.08,.92),y:clamp(y,.24,.90),scale:1,rotation:Math.round(Math.random()*8-4),z:Date.now()};
  state.entry.stickers=[...(state.entry.stickers||[]),placed]; return placed;
}
function positionsAreClose(a,b){return Math.hypot((a.x-b.x)*560,(a.y-b.y)*420)<84*(a.scale||1);}
function findOpenPosition(offset=0){
  const occupied=state.entry.stickers||[], cols=6, rows=5, candidates=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)candidates.push({x:.16+c*.14,y:.38+r*.105});
  const rotated=[...candidates.slice(offset),...candidates.slice(0,offset)];
  for(const p of rotated){if(!occupied.some(o=>positionsAreClose(p,o)))return p;}
  return {x:.22+((occupied.length*.13)%0.56),y:.40+((occupied.length*.09)%0.40)};
}
function addSticker(sticker){ const before=cloneEntry(state.entry); const p=findOpenPosition((state.entry.stickers||[]).length%30); addStickerAt(sticker,p.x,p.y); pushHistory(before); saveDraft(state.entry); renderDrawer(); }
function addSelectedStickers(){
  const selected=STICKERS.filter(x=>state.selectedLibrary.has(x.id)); if(!selected.length)return;
  const before=cloneEntry(state.entry); selected.forEach((sticker,idx)=>{const p=findOpenPosition(((state.entry.stickers||[]).length+idx)%30);addStickerAt(sticker,p.x,p.y);});
  pushHistory(before); state.selectedLibrary.clear(); state.multiSelectMode=false; saveDraft(state.entry); toast(`已加入 ${selected.length} 枚贴纸`); renderDrawer();
}
function autoArrangeStickers(){
  const list=state.entry.stickers||[]; if(!list.length)return; const before=cloneEntry(state.entry);
  const anchors=[], cols=5, rows=5; for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)anchors.push({x:.18+c*.16,y:.44+r*.095});
  list.forEach((item,i)=>{const a=anchors[i%anchors.length];item.x=a.x;item.y=a.y;item.rotation=(i%5-2)*3;item.z=i+1;});
  pushHistory(before); saveDraft(state.entry); renderCanvasOnly(); toast('贴纸已自动排版');
}
function toggleLibrarySticker(id){if(state.selectedLibrary.has(id))state.selectedLibrary.delete(id);else state.selectedLibrary.add(id);updateStickerPanelResults();}
function toggleCanvasStickerSelection(id){if(state.selectedCanvas.has(id))state.selectedCanvas.delete(id);else state.selectedCanvas.add(id);state.selectedText=null;renderCanvasSelectionState();}
function clearCanvasSelection(){state.selectedCanvas.clear();state.selectedText=null;renderCanvasSelectionState();}
function bringToFront(id){const max=Math.max(0,...(state.entry.stickers||[]).map(s=>s.z||0));state.entry.stickers=state.entry.stickers.map(s=>s.id===id?{...s,z:max+1}:s);}
function sendToBack(id){const min=Math.min(0,...(state.entry.stickers||[]).map(s=>s.z||0));state.entry.stickers=state.entry.stickers.map(s=>s.id===id?{...s,z:min-1}:s);}
function duplicateSticker(id){ const src=(state.entry.stickers||[]).find(x=>x.id===id); if(!src)return; mutateEntry(()=>state.entry.stickers=[...(state.entry.stickers||[]),{...src,id:uid(src.stickerId),x:clamp(src.x+.08,.08,.92),y:clamp(src.y+.06,.24,.90),z:Date.now()}]); state.selectedCanvas=new Set([state.entry.stickers[state.entry.stickers.length-1].id]); renderDrawer(); }
function removeSticker(id){mutateEntry(()=>{state.entry.stickers=(state.entry.stickers||[]).filter(item=>item.id!==id);state.selectedCanvas.delete(id);});renderDrawer();}
function removeSelectedCanvas(){if(!state.selectedCanvas.size)return;const ids=new Set(state.selectedCanvas);mutateEntry(()=>{state.entry.stickers=(state.entry.stickers||[]).filter(item=>!ids.has(item.id));});state.selectedCanvas.clear();renderDrawer();}
function adjustSelectedScale(delta){updateSelectedSticker(item=>item.scale=clamp((item.scale||1)+delta,.65,1.55));}
function rotateSelected(delta){updateSelectedSticker(item=>item.rotation=clamp((item.rotation||0)+delta,-180,180));}
function layerSelected(dir){
  const ids=[...state.selectedCanvas]; if(!ids.length)return;
  const before=cloneEntry(state.entry); const items=state.entry.stickers||[];
  const sorted=[...items].sort((a,b)=>(a.z||0)-(b.z||0));
  if(dir==='front'){let z=Math.max(0,...sorted.map(x=>Number(x.z)||0))+1;ids.forEach(id=>{const item=items.find(x=>x.id===id);if(item)item.z=z++;});}
  else {let z=Math.min(0,...sorted.map(x=>Number(x.z)||0))-ids.length;ids.forEach(id=>{const item=items.find(x=>x.id===id);if(item)item.z=z++;});}
  pushHistory(before);saveDraft(state.entry);renderCanvasOnly();
}
function setTextSize(kind,delta){const before=cloneEntry(state.entry);state.entry[`${kind}Style`]=state.entry[`${kind}Style`]||{};state.entry[`${kind}Style`].fontSize=clamp(Number(state.entry[`${kind}Style`].fontSize|| (kind==='title'?25:12))+delta,kind==='title'?18:10,kind==='title'?40:22);pushHistory(before);saveDraft(state.entry);renderCanvasOnly();renderTextTools();}
function toggleTextAlign(kind){const before=cloneEntry(state.entry);state.entry[`${kind}Style`]=state.entry[`${kind}Style`]||{};const v=state.entry[`${kind}Style`].align||'left';state.entry[`${kind}Style`].align=v==='left'?'center':v==='center'?'right':'left';pushHistory(before);saveDraft(state.entry);renderCanvasOnly();renderTextTools();}
function moveSelectionByKeyboard(dx,dy){
  const hasText=state.selectedText==='title'||state.selectedText==='content';
  if(!hasText && !state.selectedCanvas.size)return;
  const before=cloneEntry(state.entry);
  if(hasText){
    const key=`${state.selectedText}Pos`;
    const pos=state.entry[key]||{x:.1,y:.36};
    state.entry[key]={x:clamp(pos.x+dx,.04,.84),y:clamp(pos.y+dy,.12,.88)};
  }else{
    (state.entry.stickers||[]).forEach(item=>{
      if(state.selectedCanvas.has(item.id)){
        item.x=clamp(item.x+dx,.06,.94);
        item.y=clamp(item.y+dy,.24,.92);
      }
    });
  }
  pushHistory(before); saveDraft(state.entry); renderCanvasOnly();
}

function bindCanvasInteractions(canvas){
  if(!canvas)return;
  const startDrag=(kind,id,event)=>{
    if(event.button!==undefined&&event.button!==0)return; event.preventDefault(); const rect=canvas.getBoundingClientRect(); const nx=(event.clientX-rect.left)/rect.width, ny=(event.clientY-rect.top)/rect.height;
    if(kind==='sticker'){
      const item=(state.entry.stickers||[]).find(s=>s.id===id); if(!item)return;
      if(state.canvasMultiSelect){
        if(!state.selectedCanvas.has(id)){ toggleCanvasStickerSelection(id); return; }
      }else{
        state.selectedCanvas.clear();state.selectedText=null;state.selectedCanvas.add(id);renderCanvasSelectionState();
      }
      const before=cloneEntry(state.entry);
      const ids=[...state.selectedCanvas], starts=Object.fromEntries(ids.map(i=>{const it=state.entry.stickers.find(x=>x.id===i);return [i,{x:it.x,y:it.y}]}));
      state.drag={kind,id,rect,startX:nx,startY:ny,ids,starts,before};
      bringToFront(id);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }else{
      state.selectedCanvas.clear();state.selectedText=kind;renderCanvasSelectionState(); const pos=kind==='title'?state.entry.titlePos:state.entry.contentPos; state.drag={kind,id:null,rect,startX:nx,startY:ny,starts:{[kind]:{x:pos.x,y:pos.y}},before:cloneEntry(state.entry)};event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  };
  canvas.querySelectorAll('[data-drag-kind="sticker"]').forEach(el=>{const id=el.dataset.id;el.addEventListener('pointerdown',e=>startDrag('sticker',id,e));el.addEventListener('click',e=>{e.stopPropagation();if(state.canvasMultiSelect)return;state.selectedCanvas.clear();state.selectedCanvas.add(id);state.selectedText=null;renderCanvasSelectionState();});el.addEventListener('dblclick',()=>removeSticker(id));});
  canvas.querySelector('[data-drag-kind="title"]')?.addEventListener('pointerdown',e=>startDrag('title',null,e));
  canvas.querySelector('[data-drag-kind="content"]')?.addEventListener('pointerdown',e=>startDrag('content',null,e));
  const onMove=e=>{if(!state.drag)return;const d=state.drag,rect=canvas.getBoundingClientRect(),nx=(e.clientX-rect.left)/rect.width,ny=(e.clientY-rect.top)/rect.height,dx=nx-d.startX,dy=ny-d.startY;
    if(d.kind==='sticker'){d.ids.forEach(id=>{const st=d.starts[id],item=state.entry.stickers.find(x=>x.id===id);if(!item)return;item.x=clamp(st.x+dx,.06,.94);item.y=clamp(st.y+dy,.24,.90);const el=canvas.querySelector(`[data-id="${CSS.escape(id)}"]`);if(el){el.style.left=`${item.x*100}%`;el.style.top=`${item.y*100}%`;}});}
    else {const base=d.starts[d.kind],pos={x:clamp(base.x+dx,.05,.84),y:clamp(base.y+dy,.12,.84)};if(d.kind==='title')state.entry.titlePos=pos;else state.entry.contentPos=pos;const el=canvas.querySelector(`[data-drag-kind="${d.kind}"]`);if(el){el.style.left=`${pos.x*100}%`;el.style.top=`${pos.y*100}%`;}} state.autosaveStatus='草稿已自动保存';
  };
  const end=()=>{if(state.drag){if(JSON.stringify(state.drag.before)!==JSON.stringify(state.entry))pushHistory(state.drag.before);saveDraft(state.entry);}state.drag=null;renderCanvasSelectionState();renderTextTools();};
  canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('click',e=>{if(e.target===canvas)clearCanvasSelection();});
}

function renderCanvasSelectionState(){
  document.querySelectorAll('.placed-sticker').forEach(el=>el.classList.toggle('selected',state.selectedCanvas.has(el.dataset.id)));
  document.querySelectorAll('.canvas-text').forEach(el=>el.classList.toggle('text-selected',state.selectedText===el.dataset.dragKind));
  const count=state.selectedCanvas.size; const info=document.getElementById('canvasSelectionInfo'); if(info)info.textContent=state.selectedText?`已选${state.selectedText==='title'?'标题':'正文'}`:(count?`已选 ${count} 张`:'未选择');
  renderTextTools();
}
function renderTextTools(){
  const wrap=document.getElementById('textTools'); if(!wrap)return;
  const kind=state.selectedText; if(!kind){wrap.innerHTML='<span class="tool-muted">点击标题或正文可选中并调整样式</span>';return;}
  const style=state.entry?.[`${kind}Style`]||{}; const size=style.fontSize|| (kind==='title'?25:12),align=style.align||'left';
  wrap.innerHTML=`<span class="tool-label">${kind==='title'?'标题':'正文'} ${size}px</span><button class="ghost-mini" id="textSmaller">A−</button><button class="ghost-mini" id="textLarger">A＋</button><button class="ghost-mini" id="textAlign">对齐：${align==='left'?'左':align==='center'?'中':'右'}</button>`;
  document.getElementById('textSmaller').onclick=()=>setTextSize(kind,-2);document.getElementById('textLarger').onclick=()=>setTextSize(kind,2);document.getElementById('textAlign').onclick=()=>toggleTextAlign(kind);
}
function renderCanvasOnly(){
  const canvas=document.getElementById('journalCanvas');if(!canvas)return;canvas.style.background=state.entry.background||'#fffdf7';
  const title=canvas.querySelector('[data-drag-kind="title"]'),content=canvas.querySelector('[data-drag-kind="content"]');
  const titleStyle=state.entry.titleStyle||{},contentStyle=state.entry.contentStyle||{};
  if(title){title.textContent=state.entry.title||'标题';title.classList.toggle('placeholder',!state.entry.title);title.style.left=`${state.entry.titlePos.x*100}%`;title.style.top=`${state.entry.titlePos.y*100}%`;title.style.fontSize=`${titleStyle.fontSize||25}px`;title.style.textAlign=titleStyle.align||'left';}
  if(content){content.textContent=state.entry.content||'写下一点，再放几枚贴纸。';content.classList.toggle('placeholder',!state.entry.content);content.style.left=`${state.entry.contentPos.x*100}%`;content.style.top=`${state.entry.contentPos.y*100}%`;content.style.fontSize=`${contentStyle.fontSize||12}px`;content.style.textAlign=contentStyle.align||'left';}
  state.entry.stickers?.forEach(item=>{const el=canvas.querySelector(`[data-id="${CSS.escape(item.id)}"]`);if(el){el.style.left=`${item.x*100}%`;el.style.top=`${item.y*100}%`;el.style.transform=`translate(-50%,-50%) rotate(${item.rotation||0}deg) scale(${item.scale||1})`;el.style.zIndex=item.z||1;}});
  renderCanvasSelectionState();
}

function renderStickerPanel(){
  const panel=document.getElementById('stickerPanel');if(!panel)return;
  panel.innerHTML=`
    <div class="sticker-search-row"><div class="search-wrap"><span>⌕</span><input id="stickerSearch" value="${sanitizeText(state.stickerSearch)}" placeholder="搜索贴纸 / 例如：咖啡、旅行、下雨" autocomplete="off" /></div><button class="ghost-mini ${state.multiSelectMode?'active':''}" id="toggleMulti">${state.multiSelectMode?'结束多选':'多选'}</button></div>
    <div id="stickerRecommendRoot"></div>
    <div class="category-tabs sticker-cats">${STICKER_CATEGORIES.map(c=>`<button class="${state.stickerCategory===c.key?'selected':''}" data-cat="${c.key}">${c.label}</button>`).join('')}</div>
    <div class="sticker-count-row"><span id="stickerCount"></span><span id="stickerSelectedCount"></span></div>
    <div class="sticker-library" id="stickerResults"></div>
    <div id="multiSelectBarRoot"></div>`;
  const input=document.getElementById('stickerSearch');
  input?.addEventListener('compositionstart',()=>{state.stickerSearchComposing=true;});
  input?.addEventListener('compositionend',e=>{state.stickerSearchComposing=false;state.stickerSearch=e.target.value;updateStickerPanelResults();});
  input?.addEventListener('input',e=>{state.stickerSearch=e.target.value;if(!state.stickerSearchComposing)updateStickerPanelResults();});
  input?.addEventListener('search',e=>{state.stickerSearch=e.target.value;updateStickerPanelResults();});
  document.getElementById('toggleMulti')?.addEventListener('click',()=>{state.multiSelectMode=!state.multiSelectMode;if(!state.multiSelectMode)state.selectedLibrary.clear();renderStickerPanel();});
  document.querySelectorAll('[data-cat]').forEach(btn=>btn.addEventListener('click',()=>{state.stickerCategory=btn.dataset.cat;document.querySelectorAll('[data-cat]').forEach(x=>x.classList.toggle('selected',x===btn));updateStickerPanelResults();}));
  updateStickerPanelResults();
}
function updateStickerPanelResults(){
  const panel=document.getElementById('stickerPanel'); if(!panel)return;
  state.recommendedIds=recommendationIds();
  const filtered=filteredStickers();
  const showRec=state.stickerCategory==='recommended';
  const count=document.getElementById('stickerCount'); if(count)count.textContent=showRec?`相关推荐 · ${filtered.length} 枚`:`${filtered.length} 枚贴纸`;
  const selectedCount=document.getElementById('stickerSelectedCount'); if(selectedCount)selectedCount.textContent=state.multiSelectMode&&state.selectedLibrary.size?`已选 ${state.selectedLibrary.size} 枚`:'';
  const recommendRoot=document.getElementById('stickerRecommendRoot');
  if(recommendRoot){
    const html=(state.recommendedIds.length&&!showRec&&!state.stickerSearch.trim())?`<div class="recommend-strip"><div class="recommend-title"><span>根据这一天的文字推荐</span><button id="showRecommendations">查看全部 ${state.recommendedIds.length}</button></div><div class="recommend-row">${state.recommendedIds.slice(0,8).map(id=>stickerTileHtml(STICKERS.find(s=>s.id===id))).join('')}</div></div>`:'';
    if(recommendRoot.innerHTML!==html)recommendRoot.innerHTML=html;
  }
  const results=document.getElementById('stickerResults');
  const resultHtml=filtered.length?filtered.map(stickerTileHtml).join(''):`<div class="empty-stickers">没有找到相关贴纸。试试“海边 / 工作 / 开心 / 早餐”。</div>`;
  if(results && results.innerHTML!==resultHtml)results.innerHTML=resultHtml;
  const bar=document.getElementById('multiSelectBarRoot');
  const barHtml=state.multiSelectMode?`<div class="multi-select-bar"><span>可多选后一次加入，系统会自动错开放置；加入后可在画布中整体移动。</span><button class="save-button mini" id="addSelected" ${state.selectedLibrary.size?'':'disabled'}>加入所选 ${state.selectedLibrary.size||''}</button></div>`:'';
  if(bar && bar.innerHTML!==barHtml)bar.innerHTML=barHtml;
  if(recommendRoot){
    document.getElementById('showRecommendations')?.addEventListener('click',()=>{state.stickerCategory='recommended';renderStickerPanel();});
  }
  if(results && !results.dataset.bound){
    results.dataset.bound='1';
    results.addEventListener('click',e=>{
      const btn=e.target.closest('[data-sticker]'); if(!btn)return;
      const sticker=STICKERS.find(x=>x.id===btn.dataset.sticker); if(!sticker)return;
      if(state.multiSelectMode)toggleLibrarySticker(sticker.id);else addSticker(sticker);
    });
  }
  document.getElementById('addSelected')?.addEventListener('click',addSelectedStickers);
  document.querySelectorAll('#stickerRecommendRoot [data-sticker]:not([data-bound])').forEach(btn=>{btn.dataset.bound='1';btn.addEventListener('click',()=>{const sticker=STICKERS.find(x=>x.id===btn.dataset.sticker);if(sticker){if(state.multiSelectMode)toggleLibrarySticker(sticker.id);else addSticker(sticker);}});});
}
function stickerTileHtml(sticker){
  const selected=state.selectedLibrary.has(sticker.id);
  return `<button class="sticker-tile ${selected?'selected':''}" data-sticker="${sticker.id}" aria-label="${sticker.name}">${svgSticker(sticker,46)}<span>${sticker.name}</span>${selected?'<b class="sticker-check">✓</b>':''}</button>`;
}

function renderDrawer(){
  if(!state.drawerOpen)return closeDrawer();
  const entry=state.entry||emptyEntry(currentDateKey()), bg=entry.background||'#fffdf7';
  const canvasStickers=(entry.stickers||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).map(p=>{const st=STICKERS.find(x=>x.id===p.stickerId);return st?`<div class="placed-sticker ${state.selectedCanvas.has(p.id)?'selected':''}" data-drag-kind="sticker" data-id="${p.id}" style="left:${p.x*100}%;top:${p.y*100}%;z-index:${p.z||1};transform:translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1})">${svgSticker(st,64)}</div>`:''}).join('');
  document.getElementById('drawerRoot').innerHTML=`
    <button class="drawer-backdrop" id="drawerBackdrop" aria-label="关闭编辑"></button>
    <aside class="editor-drawer">
      <div class="drawer-head"><div><div class="section-kicker">A CORNER FOR</div><h2>${currentDateKey()}</h2><span class="draft-label ${entry._draft?'show':''}">${entry._draft?'未保存草稿':' '}</span></div><button class="close-button" id="closeDrawer">×</button></div>
      <div class="editor-body">
        ${supabase&&!state.user?`<div class="login-hint"><strong>云端记录</strong><span>登录后这一天会同步到你的账号。当前输入会先自动保留为草稿。</span><button id="loginFromEditor">登录</button></div>`:''}
        <div class="canvas-toolbar">
          <div><strong>一日画布</strong><span id="canvasSelectionInfo">${state.selectedText?`已选${state.selectedText==='title'?'标题':'正文'}`:(state.selectedCanvas.size?`已选 ${state.selectedCanvas.size} 张`:'未选择')}</span></div>
          <div class="canvas-actions">
            <button class="ghost-mini" id="undoBtn" ${state.historyPast.length?'':'disabled'}>撤销</button>
            <button class="ghost-mini" id="redoBtn" ${state.historyFuture.length?'':'disabled'}>恢复</button>
            <button class="ghost-mini ${state.canvasMultiSelect?'active':''}" id="toggleCanvasMulti">${state.canvasMultiSelect?'结束多选':'多选移动'}</button>
            <button class="ghost-mini" id="autoArrange">自动排版</button>
          </div>
        </div>
        <div class="journal-canvas" id="journalCanvas" style="background:${bg}">
          <div class="canvas-date">${currentDateKey()}</div>
          <div class="canvas-text title-canvas ${entry.title?'':'placeholder'} ${state.selectedText==='title'?'text-selected':''}" data-drag-kind="title" style="left:${entry.titlePos.x*100}%;top:${entry.titlePos.y*100}%;font-size:${entry.titleStyle?.fontSize||25}px;text-align:${entry.titleStyle?.align||'left'}">${sanitizeText(entry.title||'标题')}</div>
          <div class="canvas-text content-canvas ${entry.content?'':'placeholder'} ${state.selectedText==='content'?'text-selected':''}" data-drag-kind="content" style="left:${entry.contentPos.x*100}%;top:${entry.contentPos.y*100}%;font-size:${entry.contentStyle?.fontSize||12}px;text-align:${entry.contentStyle?.align||'left'}">${sanitizeText(entry.content||'写下一点，再放几枚贴纸。')}</div>
          ${canvasStickers}
          <div class="canvas-grid-hint" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>
        <div class="canvas-hint">拖动标题、正文和贴纸。双击贴纸删除。可撤销/恢复，并用多选移动一次调整多枚贴纸。</div>
        <div class="selection-tools" id="selectionTools">
          ${state.selectedCanvas.size?`<div class="tool-group"><span class="tool-label">贴纸</span><button class="ghost-mini" id="scaleDown">缩小</button><button class="ghost-mini" id="scaleUp">放大</button><button class="ghost-mini" id="rotateLeft">↺ ${'旋转'}</button><button class="ghost-mini" id="rotateRight">↻ ${'旋转'}</button><button class="ghost-mini" id="sendBack">后置</button><button class="ghost-mini" id="bringFront">前置</button><button class="ghost-mini" id="duplicateSticker">复制</button><button class="ghost-mini danger-mini" id="deleteSelected">删除</button></div>`:''}
          <div class="tool-group" id="textTools"></div>
        </div>
        <div class="field-block"><label class="field-label">标题<input id="entryTitle" value="${sanitizeText(entry.title)}" maxlength="80" placeholder="给这一天一个名字" /></label><label class="field-label">今天发生了什么？<textarea id="entryContent" rows="4" placeholder="写下一点点就好。">${sanitizeText(entry.content)}</textarea></label><div class="autosave-note">${sanitizeText(state.autosaveStatus||'输入会自动保留草稿，切换网页或重新打开也不会丢失。')}</div></div>
        <div class="editor-section sticker-section"><div class="section-title-row"><div><span>贴纸库</span><small>支持搜索、智能推荐、多选加入；加入后会自动错开放置</small></div><span>${(entry.stickers||[]).length} 枚已在画布</span></div><div id="stickerPanel"></div></div>
        <div class="editor-section"><div class="section-title-row"><div><span>背景</span><small>给这一天一个轻轻的底色</small></div></div><div class="color-row">${backgroundOptions.map(c=>`<button class="color-choice ${bg===c?'selected':''}" data-color="${c}" style="background:${c}" aria-label="选择背景 ${c}"></button>`).join('')}</div></div>
      </div>
      <div class="drawer-footer"><button class="danger-button" id="deleteEntry">清空这一天</button><span class="save-status">${sanitizeText(state.status)}</span><button class="save-button" id="saveEntry">保存这一隅</button></div>
    </aside>`;
  document.getElementById('drawerBackdrop').addEventListener('click',closeDrawer);document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
  const titleInput=document.getElementById('entryTitle'),contentInput=document.getElementById('entryContent');
  titleInput.addEventListener('focus',()=>beginTextEdit('title'));contentInput.addEventListener('focus',()=>beginTextEdit('content'));
  titleInput.addEventListener('compositionstart',()=>{state.inputComposing=true;});
  contentInput.addEventListener('compositionstart',()=>{state.inputComposing=true;});
  const handleTextInput=(kind,value)=>{state.entry[kind]=value;queueDraftSave(state.entry);renderCanvasOnly();if(!state.inputComposing)queueRecommendationUpdate();};
  titleInput.addEventListener('compositionend',e=>{state.inputComposing=false;handleTextInput('title',e.target.value);});
  contentInput.addEventListener('compositionend',e=>{state.inputComposing=false;handleTextInput('content',e.target.value);});
  titleInput.addEventListener('input',e=>handleTextInput('title',e.target.value));
  contentInput.addEventListener('input',e=>handleTextInput('content',e.target.value));
  titleInput.addEventListener('blur',endTextEdit);contentInput.addEventListener('blur',endTextEdit);
  document.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>mutateEntry(()=>{state.entry.background=btn.dataset.color;})));
  document.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>renderDrawer()));
  document.getElementById('saveEntry').addEventListener('click',saveEntry);document.getElementById('deleteEntry').addEventListener('click',deleteEntry);document.getElementById('loginFromEditor')?.addEventListener('click',openAuth);
  document.getElementById('undoBtn').addEventListener('click',undoChange);document.getElementById('redoBtn').addEventListener('click',redoChange);
  document.getElementById('toggleCanvasMulti').addEventListener('click',()=>{state.canvasMultiSelect=!state.canvasMultiSelect;state.selectedCanvas.clear();state.selectedText=null;renderDrawer();});
  document.getElementById('autoArrange').addEventListener('click',autoArrangeStickers);
  document.getElementById('scaleDown')?.addEventListener('click',()=>adjustSelectedScale(-.08));document.getElementById('scaleUp')?.addEventListener('click',()=>adjustSelectedScale(.08));document.getElementById('rotateLeft')?.addEventListener('click',()=>rotateSelected(-8));document.getElementById('rotateRight')?.addEventListener('click',()=>rotateSelected(8));
  document.getElementById('sendBack')?.addEventListener('click',()=>layerSelected('back'));document.getElementById('bringFront')?.addEventListener('click',()=>layerSelected('front'));document.getElementById('duplicateSticker')?.addEventListener('click',()=>duplicateSticker([...state.selectedCanvas][0]));document.getElementById('deleteSelected')?.addEventListener('click',removeSelectedCanvas);
  bindCanvasInteractions(document.getElementById('journalCanvas'));renderStickerPanel();renderTextTools();
}

function openDrawer(){state.drawerOpen=true;state.autosaveStatus='';state.selectedText=null;state.selectedCanvas.clear();renderDrawer();}
function closeDrawer(){state.drawerOpen=false;state.drag=null;state.selectedText=null;state.selectedCanvas.clear();const root=document.getElementById('drawerRoot');if(root)root.innerHTML='';}

async function openAuth(){
  await ensureSupabaseClient();
  if(!supabase){toast('暂时无法连接云端服务，请稍后刷新页面。');return;}
  state.authOpen=true;state.authStatus='';
  document.getElementById('authRoot').innerHTML=`<button class="auth-backdrop" id="authBackdrop"></button><section class="auth-modal"><button class="close-button" id="closeAuth">×</button><div class="section-kicker">IN DAYS ACCOUNT</div><h2>把你的一隅<br/>留在云端</h2><p>输入邮箱，我们会发送一封一次性登录链接。无需设置密码。</p><input class="auth-input" id="authEmail" type="email" autocomplete="email" placeholder="name@example.com" value="${sanitizeText(state.email)}"/><button class="save-button full" id="sendMagic">发送登录链接</button><div class="auth-status" id="authStatus"></div></section>`;
  document.getElementById('authBackdrop').addEventListener('click',closeAuth);document.getElementById('closeAuth').addEventListener('click',closeAuth);document.getElementById('sendMagic').addEventListener('click',sendMagicLink);
}
function closeAuth(){state.authOpen=false;document.getElementById('authRoot').innerHTML='';}
async function sendMagicLink(){
  const email=document.getElementById('authEmail').value.trim();if(!email)return;state.email=email;state.authStatus='发送中…';document.getElementById('authStatus').textContent=state.authStatus;
  const path=window.location.pathname.endsWith('/')?window.location.pathname:`${window.location.pathname}/`;const redirectTo=`${window.location.origin}${path}`;
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});
  state.authStatus=error?( /Invalid path specified in request URL/i.test(error.message)?'Supabase 连接地址仍有问题，请检查 Project URL。':error.message):'登录链接已发送到邮箱，请打开邮件完成登录。';
  document.getElementById('authStatus').textContent=state.authStatus;
}

async function initAuth(){
  await ensureSupabaseClient();
  renderAccount();
  if(!supabase)return;
  const {data}=await supabase.auth.getSession();state.user=data.session?.user||null;renderAccount();await refreshAfterAuth();
  supabase.auth.onAuthStateChange(async(_event,session)=>{state.user=session?.user||null;renderAccount();await refreshAfterAuth();if(state.user)closeAuth();});
}
async function refreshAfterAuth(){state.monthEntries={};await loadCurrentMonth();await loadSelectedEntry();}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2300);}

window.addEventListener('pagehide',()=>commitDraftBeforeNavigation());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')commitDraftBeforeNavigation();});
document.addEventListener('keydown',e=>{
  if(!state.drawerOpen)return;
  const tag=document.activeElement?.tagName||'';
  const typing=['INPUT','TEXTAREA'].includes(tag);
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();endTextEdit();saveEntry();return;}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();endTextEdit();e.shiftKey?redoChange():undoChange();return;}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='y'){e.preventDefault();endTextEdit();redoChange();return;}
  if(typing||e.metaKey||e.ctrlKey||e.altKey)return;
  const step=e.shiftKey?.02:.008;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();
    const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
    const dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
    moveSelectionByKeyboard(dx,dy);
  }
});

function injectStyle(){const link=document.createElement('link');link.rel='stylesheet';link.href='./styles.css?v=final-release';document.head.appendChild(link);}
injectStyle();
renderShell();
state.entry=emptyEntry(currentDateKey());
renderCalendar();
loadCurrentMonth();
loadSelectedEntry();
initAuth();
