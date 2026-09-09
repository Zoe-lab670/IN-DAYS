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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2213%22%20y%3D%2219%22%20width%3D%2238%22%20height%3D%2229%22%20rx%3D%225%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M13%2024h39M39%2034h14v10H39a5%205%200%200%201%200-10Z%22%20%2F%3E%3Ccircle%20cx%3D%2244%22%20cy%3D%2239%22%20r%3D%221.5%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M25%2011h14v9l3%206v27H22V26l3-6Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.24%22%20%2F%3E%3Cpath%20d%3D%22M28%2011h8v6h-8M22%2034h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2222%22%20y%3D%2214%22%20width%3D%2220%22%20height%3D%2239%22%20rx%3D%225%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.24%22%20%2F%3E%3Cpath%20d%3D%22M27%2010h10v5H27M22%2025h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2215%22%20y%3D%2222%22%20width%3D%2234%22%20height%3D%2224%22%20rx%3D%224%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M20%2028h24M25%2022c1-4%207-6%2011-2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2016h20l4%207-4%209v18H22V32l-4-9Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M27%2016v-5h10v5M22%2039h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2223%22%20y%3D%2213%22%20width%3D%2218%22%20height%3D%2224%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M28%2037v8M36%2037v8M29%2045h7M32%2024v7M32%2027h-4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2220%22%20y%3D%2212%22%20width%3D%2224%22%20height%3D%2240%22%20rx%3D%225%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M27%2020h10M28%2027h8M29%2034h6%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2220%22%20y%3D%2210%22%20width%3D%2224%22%20height%3D%2245%22%20rx%3D%226%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2220%22%20r%3D%224%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.4%22%20%2F%3E%3Cpath%20d%3D%22M27%2033h10M27%2040h10M32%2047v2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M27%2010v43M37%2018v35M24%2016h16M30%2022h4%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M27%2010c7%202%2013%207%2014%2014%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2041c7%200%2011-6%2014-13l7%203c0%207%204%2011%2013%2013v7H15Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M20%2044h28M23%2039l8%201%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M21%2014c10%208%2017%208%2022%200M21%2014v24c0%206%205%2011%2011%2011s11-5%2011-11V14%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M24%2038l-6%2013M40%2038l6%2013%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2038c0-12%206-22%2014-22s14%2010%2014%2022%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M14%2038h36v7H14z%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2040c8%208%2025%208%2033-8%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M17%2039c9%202%2023-1%2028-11M47%2031l2-3%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2229%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2229%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Ccircle%20cx%3D%2231%22%20cy%3D%2237%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2237%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2245%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2245%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Cpath%20d%3D%22M31%2023c3-5%208-6%2012-3M36%2020c-2-4-6-5-9-3%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2235%22%20r%3D%2216%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M32%2020c2%206%202%2013%200%2017M32%2020c5-4%209-4%2013%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2237%22%20r%3D%228%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.26%22%20%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2237%22%20r%3D%228%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.26%22%20%2F%3E%3Cpath%20d%3D%22M24%2030c0-10%206-15%208-18M40%2030c0-8-4-13-8-18M28%2015c5-3%209-2%2012%202%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M25%2020c-4%207-5%2017%200%2030h14c5-13%204-23%200-30Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M27%2020l5-9%205%209M23%2031h18M25%2038h14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2221%22%20y%3D%2218%22%20width%3D%2222%22%20height%3D%2231%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M23%2024h18M25%2031h14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2220%22%20y%3D%2216%22%20width%3D%2224%22%20height%3D%2235%22%20rx%3D%223%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M20%2022h24M27%2016l4-5h6l7%205%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2220%22%20y%3D%2224%22%20width%3D%2224%22%20height%3D%2227%22%20rx%3D%225%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M27%2024l3-12h7l4%2012M27%2017h12M25%2033h14M29%2052v4M35%2052v4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2037c6-15%2022-19%2028-8%203%205%201%2010-2%2012H22c-3-1-5-2-4-4Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.24%22%20%2F%3E%3Cpath%20d%3D%22M22%2035c6-4%2014-4%2020%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2027h32v17c0%207-7%2012-16%2012s-16-5-16-12V27Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M21%2020c-3-5%204-6%202-11M31%2020c-3-5%204-6%202-11M41%2020c-3-5%204-6%202-11%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2039c0-8%207-15%2015-14%208-1%2016%205%2015%2014-1%208-9%2013-16%2011-8%202-14-3-14-11Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2238%22%20r%3D%226%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.45%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2029h30l-3%2020H20Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M22%2029c2-8%208-9%2011-3%202-6%208-5%2010%203M25%2036h14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2019h32v34H16Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M21%2024c4%203%207-3%2011%200s7-3%2011%200M21%2032c4%203%207-3%2011%200s7-3%2011%200M21%2040c4%203%207-3%2011%200s7-3%2011%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2211%22%20width%3D%2230%22%20height%3D%2243%22%20rx%3D%223%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M32%2011v43M25%2029h2M37%2029h2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2215%22%20y%3D%2214%22%20width%3D%2234%22%20height%3D%2240%22%20rx%3D%222%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M15%2024h34M15%2036h34M23%2017v7M32%2024v12M41%2036v18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2223%22%20width%3D%2228%22%20height%3D%2229%22%20rx%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M18%2029h28M25%2023c0-5%203-8%207-8s7%203%207%208M25%2043h14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M30%2012h8v24h-8z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M34%2036c-5%200-8%205-8%2010v7M38%2019l8-4v20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M42%2011L26%2044M18%2048c6-1%2012%201%2016%205H16Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2020h26v33H19Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M16%2020h32M26%2015h12M25%2027v18M32%2027v18M39%2027v18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2028h32v12c0%209-7%2014-16%2014s-16-5-16-14V28Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M20%2022h8v6M23%2022v-5h6%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2030c0-10%208-17%2018-17%205%200%208%202%2010%205M43%2017v14M38%2031h10M40%2035v10M46%2035v10M35%2035v10%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2218%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.15%22%20%2F%3E%3Cpath%20d%3D%22M23%2050h18M29%2050v4M35%2050v4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2212%22%20y%3D%2215%22%20width%3D%2240%22%20height%3D%2227%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M25%2042v7M18%2050h28%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2210%22%20width%3D%2228%22%20height%3D%2244%22%20rx%3D%224%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M27%2015h10M31%2050h2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2011h22l7%207v35H19Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.12%22%20%2F%3E%3Cpath%20d%3D%22M41%2011v9h7M25%2029h17M25%2036h17M25%2043h12%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M25%2027l11-11c5-5%2014%202%209%208L31%2038c-5%205-13-1-8-6l13-13%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2219%22%20y%3D%2218%22%20width%3D%2226%22%20height%3D%2226%22%20rx%3D%222%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.25%22%20%2F%3E%3Cpath%20d%3D%22M39%2044h6V38%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2021h30v10H17Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M22%2021v10M27%2021v6M32%2021v10M37%2021v6M42%2021v10%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2212%22%20width%3D%2230%22%20height%3D%2242%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2217%22%20width%3D%2220%22%20height%3D%229%22%20rx%3D%222%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M23%2033h3M31%2033h3M39%2033h3M23%2040h3M31%2040h3M39%2040h3M23%2047h3M31%2047h3M39%2047h3%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2217%22%20width%3D%2236%22%20height%3D%2223%22%20rx%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M25%2040v9M32%2040v9M20%2050h24M21%2031h9l5-5%206%204%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%2225%22%20r%3D%226%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2222%22%20r%3D%227%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2243%22%20cy%3D%2225%22%20r%3D%226%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M14%2048c1-7%205-10%208-10s7%203%208%2010M24%2048c1-8%205-12%208-12s7%204%208%2012M36%2048c1-7%205-10%208-10s7%203%208%2010%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2025l17-9%2017%209-17%209-17-9Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M22%2029v11c6%205%2014%205%2020%200V29M49%2026v14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2220%22%20y%3D%2211%22%20width%3D%2224%22%20height%3D%2242%22%20rx%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M20%2036h24M27%2018h10M25%2045h14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2216%22%20width%3D%2230%22%20height%3D%2235%22%20rx%3D%225%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M17%2034h30M27%2016v-6M37%2016v-6M24%2047l-5%205M40%2047l5%205%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2042v-9l6-7h26l6%207v9Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M22%2026l4-8h12l4%208M20%2042h4M40%2042h4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2042a8%208%200%201%200%200%2016%208%208%200%200%200%200-16ZM44%2042a8%208%200%201%200%200%2016%208%208%200%200%200%200-16Z%22%20%2F%3E%3Cpath%20d%3D%22M18%2050l10-15h8l8%2015M28%2035l-4-6h7l5%206M37%2035h6%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2213%22%20width%3D%2230%22%20height%3D%2240%22%20rx%3D%223%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M27%2045V21h8c10%200%2010%2014%200%2014h-8%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2053V29h24v24M17%2029h30M24%2029V21h16v8M28%2021v-7h8v7%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2222%22%20width%3D%2236%22%20height%3D%2220%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M24%2022v20M34%2022v20M28%2028h4M28%2034h4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2219%22%20width%3D%2228%22%20height%3D%2230%22%20rx%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M24%2019v-5h12v5M25%2028h14M25%2034h10%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M31%2017c-4%200-6%203-6%207%200%203%202%204%202%207%200%202-2%205-5%207-5%203-5%209%200%2011%204%202%207-1%207-5%200-4%202-5%204-5%203%200%206%203%208%200%202-3%200-8-4-10-2-1-2-4%200-6%202-4-1-6-6-6Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.17%22%20%2F%3E%3Cpath%20d%3D%22M31%2018v34%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2042c7-11%2020-11%2027%200M22%2042c5%205%2015%205%2020%200M24%2028c6-4%2012-4%2016%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2024l28%2028M46%2024L18%2052M26%2016l20%2036M38%2016L18%2036%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14%2017c10-4%2016-2%2018%201v37c-3-3-9-5-18-3V17ZM50%2017c-10-4-16-2-18%201v37c3-3%209-5%2018-3V17Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M21%2026h7M21%2033h7M36%2026h7M36%2033h7%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2018h13c-2%205%201%208%205%208%204%200%206-3%204-8h6v13c-5-2%208%201-8%205s3%206%208%204v12H34c2-5-1-8-5-8-4%200-6%203-4%208H18Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2039c4%205%2010%207%2015%207s11-2%2015-7%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.2%22%20%2F%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%2247%22%20r%3D%223%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.25%22%20%2F%3E%3Ccircle%20cx%3D%2242%22%20cy%3D%2247%22%20r%3D%223%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.25%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2036c-8%200-14-5-14-12%200-6%205-10%2010-10%206%200%2010%205%2010%2011%200%206-3%2010-6%2011ZM37%2037l10%2010M47%2047l4-4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2018h10v18M28%2018h12M40%2018v22M38%2040c0%207%205%208%209%209M47%2049c4%201%204%205%201%207-3%202-7%200-7-3%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2034h30v18H17Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M24%2034c0-7%204-11%208-11s8%204%208%2011M21%2041h22%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2050V30M32%2037c-8%200-14-4-14-10%208-1%2014%203%2014%2010ZM32%2041c8%200%2014-4%2014-10-8-1-14%203-14%2010Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M22%2053h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2035c6%200%206%206%2012%206s6-6%2012-6%206%206%2012%206M15%2045c6%200%206%206%2012%206s6-6%2012-6%206%206%2012%206%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2218%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M14%2032h36M32%2014v36M19%2019c8%207%2018%207%2026%200M19%2045c8-7%2018-7%2026%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2027l8-8%2012%204%208%209-6%2010-13%202-7-9Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M26%2027l12%208M31%2032l2-6M33%2040l-2-8%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2217%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M21%2020c8%206%209%2015%202%2024M43%2020c-8%206-9%2015-2%2024%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2021c7%205%2023%205%2030%200M18%2021v12M46%2021v12M18%2033l8%2015M46%2033l-8%2015M26%2048l12-1%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2219%22%20y%3D%2220%22%20width%3D%2226%22%20height%3D%2228%22%20rx%3D%223%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M23%2027h18M23%2034h18M23%2041h18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2026v12M22%2022v20M42%2022v20M47%2026v12M22%2032h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2050l10-17%205%205%207-12M32%2033l-4-8M40%2026l4%204M17%2053h30%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2027h27c5%200%206-7%201-8M12%2035h35c4%200%205-6%201-8M12%2043h22c5%200%206%207%201%208%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2027h34M12%2035h40M15%2043h34%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2042c6-4%2012-4%2019%200s13%204%2019%200M13%2050c6-4%2012-4%2019%200s13%204%2019%200%22%20%2F%3E%3Cpath%20d%3D%22M21%2027c3-6%209-9%2015-7%204%201%207%204%208%207%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2015l5%209%2010-3-6%2011%208%206-11%201%202%2011-8-7-8%207%202-11-11-1%208-6-6-11%2010%203Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2048V25M32%2027c-7-2-12-7-12-13M32%2031c7-2%2012-7%2012-13M22%2014c-2-5-8-3-8%201s5%206%208%202M42%2014c2-5%208-3%208%201s-5%206-8%202%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2050c3-12%206-18%208-23M24%2050c2-11%205-20%208-26M32%2050c2-11%206-18%2010-24M40%2050c1-8%204-15%208-21M14%2052h36%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2018h12v23l5%208c2%204-1%207-6%207H19c-4%200-6-4-4-7l5-8V18Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M20%2026h12%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2013l17%2018-17%2018-17-18Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M32%2013v36M15%2031h34M20%2050l-5%207M42%2050l5%207%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2233%22%20r%3D%2216%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2223%22%20cy%3D%2227%22%20r%3D%225%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.16%22%20%2F%3E%3Ccircle%20cx%3D%2241%22%20cy%3D%2227%22%20r%3D%225%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.16%22%20%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2233%22%20r%3D%221.5%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Ccircle%20cx%3D%2238%22%20cy%3D%2233%22%20r%3D%221.5%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Cpath%20d%3D%22M29%2039c2%202%204%202%206%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2045c-7-5-7-15%201-18%202-6%2010-8%2014-2%2010-4%2016%203%2013%2010-2%205-6%208-13%2010Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M42%2035c-3-6-8-7-11-4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2039c0-10%206-17%2014-17s14%207%2014%2017c0%208-6%2012-14%2012s-14-4-14-12Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2235%22%20r%3D%221.5%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2235%22%20r%3D%221.5%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Cpath%20d%3D%22M29%2041h6%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M24%2025l-6-8M40%2025l6-8%22%20%2F%3E%3Cpath%20d%3D%22M25%2024c-6%204-7%2013-3%2020%203%206%2017%206%2020%200%204-7%203-16-3-20%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.16%22%20%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2232%22%20r%3D%221.2%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2232%22%20r%3D%221.2%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Cpath%20d%3D%22M29%2041h6%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M23%2050c-2-12-2-24%204-31%203-4%208-5%2012-2%204%203%204%208%201%2012l-5%206%202%2015Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.15%22%20%2F%3E%3Cpath%20d%3D%22M31%2020c-5-5-9-6-13-2M28%2037h9%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2233%22%20r%3D%2216%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M20%2023l-3-7%208%204M44%2023l3-7-8%204%22%20%2F%3E%3Crect%20x%3D%2226%22%20y%3D%2234%22%20width%3D%2212%22%20height%3D%228%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2238%22%20r%3D%221.2%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Ccircle%20cx%3D%2234%22%20cy%3D%2238%22%20r%3D%221.2%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M21%2026c-2-5-1-10%203-12%204-2%208%200%208%205%200-5%204-7%208-5%204%202%205%207%203%2012%202%205%200%2013-3%2017-4%205-12%205-16%200-3-4-5-12-3-17Z%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.14%22%20%2F%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2233%22%20r%3D%221.2%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%2233%22%20r%3D%221.2%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2035c0-9%208-15%2017-13%205%201%207%206%207%2010%207%200%208%208%202%2011-3%202-7%202-10%202H25c-4%200-7-4-7-10Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M41%2035h8l-6%204%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2035c7-10%2018-14%2030-7%204%202%205%207%208%209-5%203-10%202-14-1-4%207-13%209-24%204Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M44%2028l4-9M31%2029l-4-6%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2035c8-9%2014-9%2020%200%206-9%2012-9%2020%200%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2031c-8-15-20-11-17-2%202%206%208%2010%2017%2012%209-2%2015-6%2017-12%203-9-9-13-17%202Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.17%22%20%2F%3E%3Cpath%20d%3D%22M32%2031v23%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2216%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M27%2032h10M25%2038c4%203%2010%203%2014%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2217%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M34%2016l-8%2017h8l-4%2015%2010-19h-8Z%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2217%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%226%22%20%2F%3E%3Cpath%20d%3D%22M32%2015v8M32%2041v8M15%2032h8M41%2032h8%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2031c3-6%208-9%2010-9s7%203%2010%209c-3%208-7%2012-10%2012s-7-4-10-12Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M27%2033h10%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2217%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.14%22%20%2F%3E%3Cpath%20d%3D%22M25%2026l4%204M39%2026l-4%204M27%2040c3-2%207-2%2010%200%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2217%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2236%22%20r%3D%223%22%20%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2227%22%20r%3D%221.3%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3Ccircle%20cx%3D%2238%22%20cy%3D%2227%22%20r%3D%221.3%22%20fill%3D%22%233f3f3b%22%20opacity%3D%221%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2220%22%20width%3D%2228%22%20height%3D%2225%22%20rx%3D%223%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M25%2013v7M39%2013v7M25%2029h14M32%2023v14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2031V12M32%2031l13-13M32%2031h20M32%2031l13%2013M32%2031V50M32%2031L19%2044M32%2031H12M32%2031L19%2018%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2231%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2222%22%20y%3D%2216%22%20width%3D%2220%22%20height%3D%2230%22%20rx%3D%228%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M27%2011c3-3%207-3%2010%200M27%2046v7M37%2046v7M19%2029h26%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M16%2019h32v31H16Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M16%2028l16%208%2016-8M32%2036v14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2214%22%20width%3D%2211%22%20height%3D%2238%22%20rx%3D%221%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.16%22%20%2F%3E%3Crect%20x%3D%2235%22%20y%3D%2214%22%20width%3D%2211%22%20height%3D%2238%22%20rx%3D%221%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M23%2020v26M40%2020v26%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2014l14%2017-14%2017-14-17Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.15%22%20%2F%3E%3Cpath%20d%3D%22M32%2014v34M18%2031h28M31%2048c2%206%207%207%209%2011%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2051V17M32%2026c-8-4-13-10-14-15M32%2034c8-4%2013-10%2014-15M32%2042c-7-3-10-7-12-12M32%2045c7-3%2010-7%2012-12%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2045l28-28M39%2014l8%208M17%2051h18%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M20%2045l6%206%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2222%22%20y%3D%2218%22%20width%3D%2220%22%20height%3D%2234%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M27%2018v-6h10v6M22%2030h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2042c8-7%2017-7%2027-1%206%204%2010%203%2013-2-8%200-14-3-20-8-8%205-13%208-20%2011Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M32%2025l4-9%204%209%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2013l18%2022-18%2017-18-17Z%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M21%2035h22M26%2029l12%2015%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2050V22M32%2032c-8-3-13-8-14-14%208%200%2013%205%2014%2014M32%2040c8-3%2013-8%2014-14-8%200-13%205-14%2014%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2233%22%20r%3D%2216%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.22%22%20%2F%3E%3Cpath%20d%3D%22M25%2027h14M24%2034h16M27%2041h10%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2219%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.3%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2222%22%20y%3D%2217%22%20width%3D%2220%22%20height%3D%2228%22%20rx%3D%228%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.2%22%20%2F%3E%3Cpath%20d%3D%22M26%2011h12M26%2045v6M38%2045v6M18%2031h28%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2236%22%20r%3D%2212%22%20fill%3D%22%23b3ada2%22%20opacity%3D%220.12%22%20%2F%3E%3Cpath%20d%3D%22M26%2022l-3-10%208%207M38%2022l3-10-8%207M28%2038h2M36%2038h2M30%2043h4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M19%2013v41M19%2016h27v16H19Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Ccircle%20cx%3D%2225%22%20cy%3D%2222%22%20r%3D%223%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.45%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2031V12M32%2031l12-12M32%2031h18M32%2031l12%2012M32%2031v18M32%2031L20%2043M32%2031H14M32%2031L20%2019%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2231%22%20r%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.2%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2021c7%206%2014%206%2021%200%204-3%207-3%209%200M16%2037c8%206%2014%206%2021%200%204-3%208-3%2011%200M22%2049c7-8%2013-8%2020%200%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2214%22%20width%3D%2230%22%20height%3D%2238%22%20rx%3D%223%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M24%2011v7M40%2011v7M22%2028h20M26%2035h4M34%2035h4M26%2042h4M34%2042h4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2218%22%20y%3D%2218%22%20width%3D%2228%22%20height%3D%2228%22%20rx%3D%225%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M32%2024v16M24%2032h16%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2220%22%20width%3D%2230%22%20height%3D%2226%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M27%2020v-5h10v5M32%2025v16M24%2033h16%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M21%2016c-4%204-4%2010-1%2016%204%208%2010%2014%2018%2018%206%203%2012%203%2016-1l-5-7c-2-3-4-4-6-2l-3%202c-4-2-8-6-10-10l2-3c2-2%201-4-2-6Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2219%22%20width%3D%2236%22%20height%3D%2228%22%20rx%3D%224%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M14%2021l18%2015%2018-15%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2220%22%20width%3D%2236%22%20height%3D%2227%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M22%2020l4-6h12l4%206%22%20%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2233%22%20r%3D%228%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.28%22%20%2F%3E%3Ccircle%20cx%3D%2242%22%20cy%3D%2225%22%20r%3D%222%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.4%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M18%2028h28v19H18Z%22%20fill%3D%22%23d6a47f%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M24%2028v-7c0-4%203-7%208-7s8%203%208%207v7M25%2037h14%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M38%2015v25c0%207-6%2011-11%208-4-2-4-7%200-9%203-2%207-1%208%201V19l17-4v19c0%207-6%2011-11%208-4-2-4-7%200-9%203-2%207-1%208%201V15Z%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M32%2050V27M32%2035c-8-2-13-7-14-13%208%200%2013%205%2014%2013M32%2041c8-2%2013-7%2014-13-8%200-13%205-14%2013%22%20fill%3D%22%239fb29b%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M22%2052h20%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M17%2039c6-7%2014-9%2022-6%205%202%208%206%208%2011H17Z%22%20fill%3D%22%23a7b8c0%22%20opacity%3D%220.16%22%20%2F%3E%3Cpath%20d%3D%22M27%2025c0-5%203-8%207-8s7%203%207%208%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2018h24l5%2014-7%204v18H22V36l-7-4Z%22%20fill%3D%22%23d7b86e%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M32%2018v12M26%2044h12%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
    "inlineSvg": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%233f3f3b%22%20stroke-width%3D%222.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2217%22%20y%3D%2210%22%20width%3D%2231%22%20height%3D%2245%22%20rx%3D%224%22%20fill%3D%22%23c89e9c%22%20opacity%3D%220.18%22%20%2F%3E%3Cpath%20d%3D%22M24%2010v45M29%2022h13M29%2031h13M29%2040h10%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
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
const MIN_MONTH_INDEX = 2026 * 12;
const VIEW_MODES = [
  {key:'month', label:'月历'},
  {key:'mosaic', label:'画册'},
  {key:'timeline', label:'时间轴'}
];
const MOODS = [
  {key:'happy',label:'开心'}, {key:'calm',label:'平静'}, {key:'full',label:'充实'},
  {key:'tired',label:'疲惫'}, {key:'sad',label:'难过'}, {key:'anxious',label:'焦虑'}
];
const EXTRA_RECOMMENDATION_RULES = [
  [/生日|纪念日/, ['cake','gift','candle','love']],
  [/春节|新年|过年/, ['spring_lantern','red_envelope','dumpling','newyear']],
  [/清明/, ['qingming_kite','qingming_willow']],
  [/劳动节|五一/, ['mayday_tools','mayday_luggage','coffee']],
  [/端午/, ['dragonboat','zongzi','mugwort']],
  [/中秋/, ['mooncake','moon','midautumn_lantern','moonrabbit']],
  [/国庆/, ['nationalflag','nationalfirework','suitcase','camera']],
  [/国庆节/, ['nationalflag','nationalfirework','suitcase','camera']],
  [/元旦/, ['newyear','newyear_firework','cake']],
  [/下班|办公室|上班/, ['laptop','coffee','clock','bag']],
  [/散步|走路/, ['tree','bird','sun','dog']],
  [/海边|沙滩/, ['ocean','seashell','sun','whale']],
  [/机场|登机|高铁/, ['plane','suitcase','passport','train']],
  [/购物|逛街|买东西/, ['shopping','bag','wallet','gift']],
  [/做饭|下厨|厨房/, ['cooking','bread','hotpot']],
  [/烘焙|烤蛋糕/, ['cake','croissant','cooking']],
  [/运动|健身|跑步|瑜伽/, ['running','yoga','bicycle','ball']],
  [/看电影|影院/, ['movie','popcorn','ticket']],
  [/音乐会|演唱会|演出/, ['music','musicnote','ticket']],
  [/考试|毕业|上课|课程/, ['book','pen','notebook','graduation']],
  [/下雨|雨天|雨伞/, ['rain','umbrella','raincoat','cloud']],
  [/秋天|落叶/, ['leaf','maple','pear','moon']],
  [/夏天|炎热/, ['watermelon','icecream','sun','ocean']],
  [/冬天|下雪/, ['snow','penguin','moon','sleep']],
  [/猫|猫咪/, ['cat','love']], [/狗|狗狗/, ['dog','love']],
  [/焦虑|压力|紧张/, ['anxious','calm','coffee','leaf']],
  [/放松|治愈|舒服/, ['calm','leaf','tea','sleep']]
];

// Some supplement packs use inline SVGs and some of the original library uses render names.
// Keep the existing library untouched and add only aliases/semantic tags needed by search/recommendation.
const STICKER_SYNONYMS = {
  '咖啡':['拿铁','美式','咖啡店','下午茶','coffe'],
  '茶':['下午茶','喝茶','饮料'],
  '旅行':['旅游','出游','出差','假期'],
  '工作':['上班','办公','办公室'],
  '学习':['上课','课程','考试','读书'],
  '开心':['快乐','高兴','幸福'],
  '平静':['放松','治愈','舒服'],
  '疲惫':['累','困','熬夜'],
  '海边':['海','沙滩','大海'],
  '生日':['庆祝','蛋糕','礼物'],
  '中秋':['月饼','月亮','团圆'],
  '春节':['过年','新年','灯笼','红包'],
  '端午':['粽子','龙舟'],
  '国庆':['五星红旗','假期','旅行']
};

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function uid(prefix='x'){ return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
function clone(value){ return JSON.parse(JSON.stringify(value)); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function dateKey(year,month,day){ return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
function currentDateKey(){ return dateKey(state.year,state.month,state.selectedDay); }
function parseKey(key){ const [y,m,d]=String(key).split('-').map(Number); return {y,m:m-1,d}; }
function isTodayKey(key){ const d=parseKey(key); return d.y===now.getFullYear() && d.m===now.getMonth() && d.d===now.getDate(); }
function hasEntryContent(e){ return !!(e && (String(e.title||'').trim() || String(e.content||'').trim() || (e.stickers||[]).length || (e.photos||[]).length || e.mood || e.timeCapsule)); }
function emptyEntry(date){
  return {entry_date:date,title:'',content:'',background:'#fffdf7',stickers:[],photos:[],mood:null,
    timeCapsule:null,titlePos:{x:.10,y:.18},contentPos:{x:.10,y:.36},
    titleStyle:{fontSize:25,align:'left',weight:500},contentStyle:{fontSize:12,align:'left',weight:400}};
}
function normalizePos(pos,fallback){
  if(!pos || typeof pos!=='object')return {...fallback};
  const x=Number(pos.x),y=Number(pos.y);
  if(!Number.isFinite(x)||!Number.isFinite(y))return {...fallback};
  return {x:x>1?clamp(x/CANVAS_W,.02,.94):clamp(x,.02,.94),y:y>1?clamp(y/CANVAS_H,.06,.94):clamp(y,.06,.94)};
}
function normalizeTextStyle(style,fallback){
  if(!style||typeof style!=='object')return {...fallback};
  return {fontSize:clamp(Number(style.fontSize)||fallback.fontSize,8,48),align:['left','center','right'].includes(style.align)?style.align:fallback.align,weight:Number(style.weight)||fallback.weight};
}
function normalizePhotoItems(items){
  if(!Array.isArray(items))return [];
  return items.map((p,i)=>({id:String(p?.id||uid('photo')),src:String(p?.src||''),x:clamp(Number(p?.x)||(.48+(i%3)*.12),.08,.92),y:clamp(Number(p?.y)||(.46+(i%3)*.10),.20,.90),scale:clamp(Number(p?.scale)||1,.35,1.8),rotation:clamp(Number(p?.rotation)||0,-180,180),z:Number.isFinite(Number(p?.z))?Number(p.z):i+1,locked:!!p?.locked})).filter(p=>p.src);
}
function normalizeStickerItems(items){
  if(!Array.isArray(items))return [];
  return items.map((item,idx)=>({
    id:String(item?.id||uid('st')),
    stickerId:String(item?.stickerId||''),
    x:Number.isFinite(Number(item?.x))?(Number(item.x)>1?clamp(Number(item.x)/CANVAS_W,.04,.96):clamp(Number(item.x),.04,.96)):.5,
    y:Number.isFinite(Number(item?.y))?(Number(item.y)>1?clamp(Number(item.y)/CANVAS_H,.12,.94):clamp(Number(item.y),.12,.94)):.5,
    scale:clamp(Number(item?.scale)||1,.35,2.15),rotation:clamp(Number(item?.rotation)||0,-180,180),
    z:Number.isFinite(Number(item?.z))?Number(item.z):idx+1,locked:!!item?.locked
  })).filter(x=>STICKERS.some(s=>s.id===x.stickerId));
}
function normalizeDesign(raw,date){
  const base=emptyEntry(date);
  if(Array.isArray(raw))return {...base,stickers:normalizeStickerItems(raw)};
  if(!raw||typeof raw!=='object')return base;
  return {...base,
    title:String(raw.title??''),
    content:String(raw.content??''),
    background:String(raw.background||base.background),
    stickers:normalizeStickerItems(raw.stickers||[]),
    photos:normalizePhotoItems(raw.photos||[]),
    mood:MOODS.some(m=>m.key===raw.mood)?raw.mood:null,
    timeCapsule:raw.timeCapsule&&raw.timeCapsule.date&&raw.timeCapsule.note?{date:String(raw.timeCapsule.date),note:String(raw.timeCapsule.note)}:null,
    titlePos:normalizePos(raw.titlePos||raw.title_position,base.titlePos),contentPos:normalizePos(raw.contentPos||raw.content_position,base.contentPos),
    titleStyle:normalizeTextStyle(raw.titleStyle||raw.title_style,base.titleStyle),contentStyle:normalizeTextStyle(raw.contentStyle||raw.content_style,base.contentStyle)
  };
}
function mergeRow(row){
  if(!row)return null; const design=normalizeDesign(row.stickers,row.entry_date);
  return {...row,...design,stickers:design.stickers,photos:design.photos};
}
function designPayload(e,date){ return normalizeDesign(e,date); }
function serializeForStorage(e){ return designPayload(e,e.entry_date); }
function getDisplayName(user){ const md=user?.user_metadata||{}; return String(md.display_name||md.nickname||'我的一隅').trim()||'我的一隅'; }
function getInitial(name){ return escapeHtml(String(name||'一').trim().slice(0,1).toUpperCase()); }

const state={
  year:currentYear,month:currentMonth,selectedDay:currentDay,selectedKey:null,drawerOpen:false,
  viewMode:localStorage.getItem('in-days:view')||'month',
  stickerCategory:'all',stickerSearch:'',recommendedIds:[],multiSelectMode:false,selectedLibrary:new Set(),
  canvasMultiSelect:false,selectedCanvas:new Set(),selectedPhoto:new Set(),selectedText:null,monthEntries:{},entry:null,
  user:null,authOpen:false,profileOpen:false,email:'',authStatus:'',status:'',autosaveStatus:'',drag:null,
  historyPast:[],historyFuture:[],historyBusy:false,textEdit:null,draftTimer:null,recoTimer:null,cloudTimer:null,
  inputComposing:false,stickerSearchComposing:false,favorites:new Set(),recent:[],pendingCapsule:null
};
try{ state.favorites=new Set(JSON.parse(localStorage.getItem('in-days:favorites')||'[]')); state.recent=JSON.parse(localStorage.getItem('in-days:recent')||'[]'); }catch{}

function persistPrefs(){localStorage.setItem('in-days:favorites',JSON.stringify([...state.favorites]));localStorage.setItem('in-days:recent',JSON.stringify(state.recent.slice(0,24)));}
function resetHistory(){state.historyPast=[];state.historyFuture=[];state.textEdit=null;}
function pushHistory(before){if(state.historyBusy)return;state.historyPast.push(clone(before));if(state.historyPast.length>80)state.historyPast.shift();state.historyFuture=[];}
function recordChange(before,message=''){if(JSON.stringify(before)===JSON.stringify(state.entry))return;pushHistory(before);saveDraft(state.entry);scheduleCloudSave();if(message)state.status=message;}
function saveDraft(entry){
  if(!entry?.entry_date)return; const payload={...designPayload(entry,entry.entry_date),drafted_at:new Date().toISOString()};
  try{localStorage.setItem(DRAFT_PREFIX+entry.entry_date,JSON.stringify(payload));state.autosaveStatus='草稿已自动保存';}
  catch{state.autosaveStatus='草稿保存失败';}
}
function getDraft(key){try{const raw=localStorage.getItem(DRAFT_PREFIX+key);return raw?JSON.parse(raw):null;}catch{return null;}}
function clearDraft(key){localStorage.removeItem(DRAFT_PREFIX+key);}
function chooseWithDraft(entry,date){
  const draft=getDraft(date);if(!draft)return entry;const dt=Date.parse(draft.drafted_at||''),st=Date.parse(entry?.updated_at||'1970-01-01T00:00:00Z');
  if(Number.isFinite(dt)&&dt>st){const d=normalizeDesign(draft,date);return {...(entry||{}),...d,entry_date:date,_draft:true,updated_at:entry?.updated_at||null};}
  return entry;
}
async function loadEntry(date){
  let row=null;
  if(supabase){if(!state.user)return chooseWithDraft(null,date);const {data,error}=await supabase.from('journal_entries').select('id,user_id,entry_date,title,content,background,stickers,updated_at').eq('entry_date',date).eq('user_id',state.user.id).maybeSingle();if(error)toast('读取记录失败：'+error.message);row=mergeRow(data);}
  else row=mergeRow(getLocal(date));
  return chooseWithDraft(row,date);
}
async function loadEntriesInRange(startDate,endDate){
  if(supabase){if(!state.user)return {};const {data,error}=await supabase.from('journal_entries').select('id,user_id,entry_date,title,content,background,stickers,updated_at').eq('user_id',state.user.id).gte('entry_date',startDate).lte('entry_date',endDate).order('entry_date',{ascending:true});if(error){toast('读取月份失败：'+error.message);return {};}return Object.fromEntries((data||[]).map(r=>[r.entry_date,chooseWithDraft(mergeRow(r),r.entry_date)]));}
  const out={};let cur=new Date(`${startDate}T00:00:00`),end=new Date(`${endDate}T00:00:00`);while(cur<=end){const k=cur.toISOString().slice(0,10),e=chooseWithDraft(mergeRow(getLocal(k)),k);if(e)out[k]=e;cur.setDate(cur.getDate()+1);}return out;
}
async function loadSelectedEntry(){
  const key=currentDateKey();state.entry=await loadEntry(key)||emptyEntry(key);resetHistory();state.selectedCanvas.clear();state.selectedPhoto.clear();state.selectedText=null;
  state.status=state.entry._draft?'有未保存草稿':(state.entry.id?'已保存':(supabase&&!state.user?'登录后可云端保存':'还没有记录'));
  renderCalendar();if(state.drawerOpen)renderDrawer();checkCapsule();
}
async function loadCurrentMonth(){
  const days=new Date(state.year,state.month+1,0).getDate();state.monthEntries=await loadEntriesInRange(dateKey(state.year,state.month,1),dateKey(state.year,state.month,days));renderCalendar();
}
function getLocal(key){try{const raw=localStorage.getItem(LOCAL_PREFIX+key);return raw?JSON.parse(raw):null;}catch{return null;}}
function setLocal(entry){localStorage.setItem(LOCAL_PREFIX+entry.entry_date,JSON.stringify({...entry,updated_at:new Date().toISOString()}));}
async function currentUserId(){if(!supabase)return null;const {data}=await supabase.auth.getUser();return data?.user?.id||null;}
async function saveEntry({quiet=false}={}){
  clearTimeout(state.cloudTimer);
  if(state.textEdit) finishInlineTextEdit();
  if(supabase&&!state.user){openAuth();return false;}
  const date=currentDateKey();const design=designPayload(state.entry,date);
  try{
    if(supabase){const userId=await currentUserId();if(!userId)throw new Error('请先登录后再保存。');const payload={user_id:userId,entry_date:date,title:design.title||'',content:design.content||'',background:design.background||'#fffdf7',stickers:design,updated_at:new Date().toISOString()};const {data,error}=await supabase.from('journal_entries').upsert(payload,{onConflict:'user_id,entry_date'}).select('id,user_id,entry_date,title,content,background,stickers,updated_at').single();if(error)throw error;state.entry=mergeRow(data);}
    else{setLocal({...design,entry_date:date});state.entry={...design,updated_at:new Date().toISOString(),_draft:false};}
    clearDraft(date);state.entry._draft=false;state.monthEntries[date]=state.entry;state.status='已保存';state.autosaveStatus='';
    if(!quiet){toast('这一隅已保存');renderCalendar();if(state.drawerOpen)renderDrawer();}
    return true;
  }catch(e){state.status=e.message||'保存失败';if(!quiet)toast(state.status);return false;}
}
function scheduleCloudSave(){
  if(!supabase||!state.user)return;
  clearTimeout(state.cloudTimer);
  state.cloudTimer=setTimeout(async()=>{
    if(!state.drawerOpen)return;
    state.status='自动保存中…';
    const ok=await saveEntry({quiet:true});
    if(ok)state.status='已自动保存';
    updateDrawerFooter();
  },1200);
}
async function deleteEntry(){
  const date=currentDateKey();try{if(supabase){if(!state.user)throw new Error('请先登录。');const {error}=await supabase.from('journal_entries').delete().eq('entry_date',date).eq('user_id',state.user.id);if(error)throw error;}else localStorage.removeItem(LOCAL_PREFIX+date);clearDraft(date);delete state.monthEntries[date];state.entry=emptyEntry(date);resetHistory();state.status='已清空';renderCalendar();renderDrawer();toast('已清空');}catch(e){toast(e.message||'清空失败');}
}

function miniScale(){
  const grid=document.getElementById('calendarGrid');
  if(!grid)return .18;
  const cs=getComputedStyle(grid),gap=parseFloat(cs.columnGap)||10;
  const cardW=(grid.clientWidth-gap*6)/7;
  return clamp(cardW/CANVAS_W,.08,.4);
}
function miniObjectHtml(e,scale){
  const parts=[];
  const title=String(e.title||'').trim(),content=String(e.content||'').trim();
  const date=String(e.entry_date||'').slice(8,10);
  if(date)parts.push(`<div class="mini-object mini-date" style="left:24px;top:21px;font-size:9px">${escapeHtml(date)}</div>`);
  if(title){parts.push(`<div class="mini-object mini-title" style="left:${clamp(e.titlePos?.x??.10,.02,.90)*100}%;top:${clamp(e.titlePos?.y??.18,.08,.92)*100}%;font-size:${Number(e.titleStyle?.fontSize||25).toFixed(2)}px;text-align:${e.titleStyle?.align||'left'};font-weight:${e.titleStyle?.weight||500}">${escapeHtml(title)}</div>`);}
  if(content){parts.push(`<div class="mini-object mini-content" style="left:${clamp(e.contentPos?.x??.10,.02,.90)*100}%;top:${clamp(e.contentPos?.y??.36,.12,.94)*100}%;font-size:${Number(e.contentStyle?.fontSize||12).toFixed(2)}px;text-align:${e.contentStyle?.align||'left'};font-weight:${e.contentStyle?.weight||400}">${escapeHtml(content)}</div>`);}
  (e.photos||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>parts.push(`<img class="mini-object mini-photo" src="${escapeHtml(p.src)}" alt="照片" style="left:${p.x*100}%;top:${p.y*100}%;transform:translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1})" />`));
  (e.stickers||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>{
    const st=STICKERS.find(x=>x.id===p.stickerId); if(!st)return;
    parts.push(`<div class="mini-object mini-sticker" style="left:${clamp(p.x,.02,.98)*100}%;top:${clamp(p.y,.02,.98)*100}%;transform:translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1});z-index:${p.z||2}">${svgSticker(st,64)}</div>`);
  });
  return parts.join('');
}
function calendarDayHtml(entry,key,day,active,today){
  const e=entry||emptyEntry(key),has=hasEntryContent(entry),scale=miniScale();
  return `<button class="day-card ${active?'active':''} ${today?'today':''} ${has?'has-entry':''}" data-day="${day}" aria-label="${state.year}年${state.month+1}月${day}日" style="--day-bg:${escapeHtml(e.background||'#fffdf7')}">
    <div class="day-thumbnail">${has?`<div class="mini-canvas" style="background:${escapeHtml(e.background||'#fffdf7')};--mini-scale:${scale}">${miniObjectHtml(e,scale)}</div>`:''}</div>
    ${!has?`<span class="day-number">${String(day).padStart(2,'0')}</span>`:''}
    ${today?'<span class="today-mark">TODAY</span>':''}
  </button>`;
}
function renderCalendar(){
  document.getElementById('yearLabel').textContent=state.year;document.getElementById('monthLabel').textContent=monthNames[state.month];document.getElementById('selectedDate').textContent=currentDateKey();
  const cur=state.monthEntries[currentDateKey()]||state.entry;const has=hasEntryContent(cur),preview=String(cur?.title||cur?.content||'').replace(/\s+/g,' ').trim();
  document.getElementById('selectedPreview').textContent=has?(preview||'这一天已经留下了一些东西。'):'点击任意日期，写下一点今天的心情。';
  const grid=document.getElementById('calendarGrid'),first=new Date(state.year,state.month,1).getDay(),offset=(first+6)%7,total=new Date(state.year,state.month+1,0).getDate(),cells=[];
  document.getElementById('weekdayRow').style.display=state.viewMode==='month'?'grid':'none';
  if(state.viewMode==='month'){
    for(let i=0;i<offset;i++)cells.push('<div class="day-card empty" aria-hidden="true"></div>');
    for(let d=1;d<=total;d++){const k=dateKey(state.year,state.month,d);cells.push(calendarDayHtml(state.monthEntries[k],k,d,d===state.selectedDay,isTodayKey(k)));}
    grid.className='calendar-grid month-grid';
  }else if(state.viewMode==='mosaic'){
    for(let d=1;d<=total;d++){const k=dateKey(state.year,state.month,d);cells.push(calendarDayHtml(state.monthEntries[k],k,d,d===state.selectedDay,isTodayKey(k)));}
    grid.className='calendar-grid mosaic-grid';
  }else{
    for(let d=1;d<=total;d++){const k=dateKey(state.year,state.month,d);const e=state.monthEntries[k];if(!hasEntryContent(e))continue;cells.push(timelineDayHtml(e,k,d,d===state.selectedDay,isTodayKey(k)));}
    grid.className='calendar-grid timeline-grid';
  }
  grid.innerHTML=cells.join('');
  grid.querySelectorAll('[data-day]').forEach(btn=>btn.addEventListener('click',()=>{commitBeforeNavigation();state.selectedDay=Number(btn.dataset.day);state.selectedKey=currentDateKey();loadSelectedEntry();openDrawer();}));
  document.querySelectorAll('.view-mode-btn').forEach(b=>b.classList.toggle('selected',b.dataset.view===state.viewMode));
  document.getElementById('prevMonth').disabled=state.year*12+state.month<=MIN_MONTH_INDEX;
}
function timelineDayHtml(e,key,day,active,today){const scale=.24;return `<button class="timeline-card ${active?'active':''}" data-day="${day}"><div class="timeline-date"><b>${String(day).padStart(2,'0')}</b><span>${today?'TODAY':''}</span></div><div class="timeline-thumb" style="--day-bg:${e.background||'#fffdf7'}"><div class="mini-canvas" style="background:${e.background||'#fffdf7'};--mini-scale:${scale}">${miniObjectHtml(e,scale)}</div></div><div class="timeline-text"><strong>${escapeHtml(e.title||'这一天')}</strong><p>${escapeHtml(e.content||'')}</p></div></button>`;}
function commitBeforeNavigation(){if(state.textEdit)finishInlineTextEdit();if(state.drawerOpen&&state.entry)saveDraft(state.entry);}
function moveMonth(delta){commitBeforeNavigation();const current=state.year*12+state.month,next=current+delta;if(next<MIN_MONTH_INDEX)return;state.year=Math.floor(next/12);state.month=next%12;state.selectedDay=1;renderCalendar();loadCurrentMonth();loadSelectedEntry();}
function goToday(){commitBeforeNavigation();state.year=currentYear;state.month=currentMonth;state.selectedDay=currentDay;state.viewMode='month';localStorage.setItem('in-days:view','month');state.drawerOpen=false;closeDrawer();renderCalendar();loadCurrentMonth();loadSelectedEntry();}

function stickerInlineMarkup(sticker,size=54){
  const src=String(sticker?.inlineSvg||'');
  const comma=src.indexOf(',');
  if(comma<0)return '';
  try{
    const raw=decodeURIComponent(src.slice(comma+1));
    const trimmed=raw.trim();
    if(!/^<svg\b/i.test(trimmed))return '';
    const open=trimmed.match(/^<svg\b[^>]*>/i);
    if(!open)return '';
    let tag=open[0];
    if(/\bwidth\s*=\s*['"][^'"]*['"]/i.test(tag))tag=tag.replace(/\bwidth\s*=\s*(['"]).*?\1/i,`width="${size}"`);else tag=tag.replace(/<svg\b/i,`<svg width="${size}"`);
    if(/\bheight\s*=\s*['"][^'"]*['"]/i.test(tag))tag=tag.replace(/\bheight\s*=\s*(['"]).*?\1/i,`height="${size}"`);else tag=tag.replace(/<svg\b/i,`<svg height="${size}"`);
    return tag+trimmed.slice(open[0].length);
  }catch{return ''; }
}
function svgSticker(sticker,size=54){
  if (sticker?.inlineSvg) {
    const markup=stickerInlineMarkup(sticker,size);
    if(markup)return markup;
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
  app.innerHTML=`<main class="app-shell"><header class="topbar"><div class="brand-lockup"><div class="brand-mark" aria-hidden="true"><span></span><i></i></div><div><div class="brand-cn">一隅</div><div class="brand-en">IN DAYS</div></div></div><div class="top-actions"><button class="today-button" id="todayBtn">回到今天</button><span id="accountArea"></span></div></header>
  <section class="hero"><div class="month-nav"><button class="nav-button" id="prevMonth" aria-label="上个月">←</button><div class="month-heading"><p class="eyebrow" id="yearLabel"></p><h1 id="monthLabel"></h1></div><button class="nav-button" id="nextMonth" aria-label="下个月">→</button></div><p class="subtitle">给每天留一隅。</p><div class="hero-tools"><div class="view-switcher">${VIEW_MODES.map(v=>`<button class="view-mode-btn ${state.viewMode===v.key?'selected':''}" data-view="${v.key}">${v.label}</button>`).join('')}</div><button class="subtle-action" id="reviewBtn">本月回顾</button><button class="subtle-action" id="exportMonthBtn">导出本月</button></div></section>
  <section class="calendar-card"><div class="weekday-row" id="weekdayRow">${weekdayLabels.map(label=>`<div>${label}</div>`).join('')}</div><div class="calendar-grid" id="calendarGrid"></div></section>
  <section class="selected-summary"><div><p class="section-kicker">TODAY'S CORNER</p><h2 id="selectedDate"></h2><p id="selectedPreview"></p></div><div class="summary-actions"><button class="open-editor" id="openEditor">进入这一隅 <span>↗</span></button><button class="open-editor light" id="capsuleBtn">写给未来</button></div></section><footer>一隅 · IN DAYS</footer></main><div id="drawerRoot"></div><div id="authRoot"></div><div id="profileRoot"></div><div id="reviewRoot"></div><div id="capsuleRoot"></div><div id="exportMonthRoot"></div><div class="toast" id="toast"></div>`;
  document.getElementById('prevMonth').addEventListener('click',()=>moveMonth(-1));
  document.getElementById('nextMonth').addEventListener('click',()=>moveMonth(1));
  document.getElementById('todayBtn').addEventListener('click',goToday);
  document.getElementById('openEditor').addEventListener('click',openDrawer);
  document.getElementById('reviewBtn').addEventListener('click',openReview);
  document.getElementById('exportMonthBtn').addEventListener('click',openMonthExport);
  document.getElementById('capsuleBtn').addEventListener('click',openCapsule);
  document.querySelectorAll('.view-mode-btn').forEach(b=>b.addEventListener('click',()=>{state.viewMode=b.dataset.view;localStorage.setItem('in-days:view',state.viewMode);renderCalendar();}));
  renderAccount();
}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2300);}
function renderAccount(){const area=document.getElementById('accountArea');if(!area)return;if(state.user){const name=escapeHtml(getDisplayName(state.user));area.innerHTML=`<button class="account-button" id="profileBtn"><span class="account-avatar">${getInitial(getDisplayName(state.user))}</span><span class="account-name" title="${name}">${name}</span><span class="account-chevron">⌄</span></button>`;document.getElementById('profileBtn').addEventListener('click',openProfile);return;}if(SUPABASE_URL&&SUPABASE_KEY){area.innerHTML='<button class="account-button primary-outline" id="loginBtn">登录 / 注册</button>';document.getElementById('loginBtn').addEventListener('click',openAuth);}else{area.innerHTML='<span class="local-badge">未配置账号</span>';}}
function openProfile(){if(!state.user)return openAuth();const display=getDisplayName(state.user),email=String(state.user.email||''),masked=email.length>18?`${email.slice(0,6)}…${email.slice(-10)}`:email;document.getElementById('profileRoot').innerHTML=`<button class="profile-backdrop" id="profileBackdrop"></button><section class="profile-modal"><button class="close-button" id="closeProfile">×</button><div class="section-kicker">IN DAYS ACCOUNT</div><h2>我的一隅</h2><p class="profile-email">${escapeHtml(masked)}</p><label class="field-label">显示名称<input id="displayNameInput" maxlength="20" value="${escapeHtml(display==='我的一隅'?'':display)}" placeholder="例如 Zoe、Momo…" /></label><p class="profile-hint">顶部只显示昵称，不直接展示邮箱前缀。</p><div class="profile-actions"><button class="danger-button" id="profileLogout">退出登录</button><button class="save-button" id="saveProfile">保存昵称</button></div><div class="auth-status" id="profileStatus"></div></section>`;document.getElementById('profileBackdrop').addEventListener('click',closeProfile);document.getElementById('closeProfile').addEventListener('click',closeProfile);document.getElementById('profileLogout').addEventListener('click',async()=>{await supabase.auth.signOut();closeProfile();});document.getElementById('saveProfile').addEventListener('click',saveProfile);}
function closeProfile(){state.profileOpen=false;document.getElementById('profileRoot').innerHTML='';}
async function saveProfile(){const input=document.getElementById('displayNameInput'),st=document.getElementById('profileStatus'),name=String(input?.value||'').trim();if(!name){st.textContent='请输入显示名称。';return;}st.textContent='保存中…';const {data,error}=await supabase.auth.updateUser({data:{display_name:name}});if(error){st.textContent=error.message;return;}state.user=data.user;renderAccount();closeProfile();toast('昵称已更新');}
async function openAuth(){if(!supabase){await ensureSupabaseClient();renderAccount();}if(!supabase){toast('账号服务暂时不可用，请稍后重试。');return;}state.authOpen=true;document.getElementById('authRoot').innerHTML=`<button class="auth-backdrop" id="authBackdrop"></button><section class="auth-modal"><button class="close-button" id="closeAuth">×</button><div class="section-kicker">IN DAYS ACCOUNT</div><h2>把你的一隅<br/>留在云端</h2><p>输入邮箱，我们会发送一次性登录链接。</p><input class="auth-input" id="authEmail" type="email" autocomplete="email" placeholder="name@example.com" value="${escapeHtml(state.email)}"/><button class="save-button full" id="sendMagic">发送登录链接</button><div class="auth-status" id="authStatus"></div></section>`;document.getElementById('authBackdrop').addEventListener('click',closeAuth);document.getElementById('closeAuth').addEventListener('click',closeAuth);document.getElementById('sendMagic').addEventListener('click',sendMagicLink);}
function closeAuth(){state.authOpen=false;document.getElementById('authRoot').innerHTML='';}
async function sendMagicLink(){const email=document.getElementById('authEmail').value.trim(),st=document.getElementById('authStatus');if(!email)return;state.email=email;st.textContent='发送中…';const redirectTo=`${window.location.origin}${window.location.pathname.endsWith('/')?window.location.pathname:window.location.pathname+'/'}`;const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});st.textContent=error?error.message:'登录链接已发送，请查看邮箱。';}
async function initAuth(){await ensureSupabaseClient();renderAccount();if(!supabase)return;const {data}=await supabase.auth.getSession();state.user=data.session?.user||null;renderAccount();await refreshAfterAuth();supabase.auth.onAuthStateChange(async(_e,session)=>{state.user=session?.user||null;renderAccount();await refreshAfterAuth();if(state.user)closeAuth();});}
async function refreshAfterAuth(){await loadCurrentMonth();await loadSelectedEntry();}

function getTextForRecommendations(){return `${state.entry?.title||''} ${state.entry?.content||''}`.trim();}
function getLunarMonthDay(key){
  try{
    const d=new Date(`${key}T12:00:00`);
    const parts=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{month:'numeric',day:'numeric'}).formatToParts(d);
    const out={};
    for(const part of parts)if(part.type==='month'||part.type==='day')out[part.type]=Number.parseInt(part.value,10);
    return Number.isFinite(out.month)&&Number.isFinite(out.day)?out:null;
  }catch{return null;}
}
function festivalForDate(key){
  const {m,d}=parseKey(key); const mm=m+1;
  const fixed={
    '1-1':['元旦',['newyear','newyear_firework']],
    '5-1':['劳动节',['mayday_tools','mayday_luggage']],
    '10-1':['国庆节',['nationalflag','nationalfirework','nationalribbon']]
  };
  const f=fixed[`${mm}-${d}`]; if(f)return {name:f[0],ids:f[1]};
  if(mm===10 && d>=1 && d<=7)return {name:'国庆节',ids:['nationalflag','nationalfirework','nationalribbon']};
  if(mm===4 && d>=4 && d<=6)return {name:'清明',ids:['qingming_kite','qingming_willow']};
  const lunar=getLunarMonthDay(key);
  if(lunar){
    if(lunar.month===1 && lunar.day>=1 && lunar.day<=7)return {name:'春节',ids:['spring_lantern','red_envelope','dumpling']};
    if(lunar.month===5 && lunar.day===5)return {name:'端午节',ids:['dragonboat','zongzi','mugwort']};
    if(lunar.month===8 && lunar.day===15)return {name:'中秋节',ids:['mooncake','fullmoon','midautumn_lantern','moonrabbit']};
  }
  return null;
}
function recommendationIds(){
  const text=getTextForRecommendations().toLowerCase();const scores=new Map();if(!text)return [];
  for(const [pattern,ids] of (typeof RECOMMENDATION_RULES!=='undefined'?RECOMMENDATION_RULES:[]))if(pattern.test(text))ids.forEach(id=>scores.set(id,(scores.get(id)||0)+4));
  for(const [pattern,ids] of EXTRA_RECOMMENDATION_RULES)if(pattern.test(text))ids.forEach(id=>scores.set(id,(scores.get(id)||0)+4));
  const festival=festivalForDate(currentDateKey());festival?.ids.forEach(id=>scores.set(id,(scores.get(id)||0)+5));
  for(const sticker of STICKERS){const words=[...(sticker.tags||[]),...(STICKER_SYNONYMS[sticker.name]||[])];for(const raw of words){const tag=String(raw||'').toLowerCase();if(tag.length>=1&&text.includes(tag))scores.set(sticker.id,(scores.get(sticker.id)||0)+2);}}
  return [...scores.entries()].sort((a,b)=>b[1]-a[1]).filter(([id])=>STICKERS.some(s=>s.id===id)).slice(0,14).map(([id])=>id);
}
function searchScore(sticker,q){if(!q)return 0;const n=String(sticker.name||'').toLowerCase(),tags=(sticker.tags||[]).join(' ').toLowerCase();let score=0;if(n===q)score+=100;if(n.includes(q))score+=40;if(tags.includes(q))score+=25;const chars=[...q];if(chars.length>1&&chars.every(c=>(n+tags).includes(c)))score+=6;return score;}
function filteredStickers(){
  const q=state.stickerSearch.trim().toLowerCase();let list=STICKERS;
  if(state.stickerCategory==='recommended')list=state.recommendedIds.map(id=>STICKERS.find(s=>s.id===id)).filter(Boolean);
  else if(state.stickerCategory==='recent')list=state.recent.map(id=>STICKERS.find(s=>s.id===id)).filter(Boolean);
  else if(state.stickerCategory==='favorite')list=STICKERS.filter(s=>state.favorites.has(s.id));
  else if(state.stickerCategory!=='all')list=list.filter(s=>s.category===state.stickerCategory);
  if(q)list=list.map(s=>({s,score:searchScore(s,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.s);
  return list;
}
function stickerTileHtml(st){const fav=state.favorites.has(st.id),selected=state.selectedLibrary.has(st.id);return `<button class="sticker-tile ${selected?'selected':''}" data-sticker="${escapeHtml(st.id)}" aria-label="${escapeHtml(st.name)}">${svgSticker(st,48)}<span>${escapeHtml(st.name)}</span><span class="fav-toggle ${fav?'on':''}" data-fav="${escapeHtml(st.id)}" title="${fav?'取消收藏':'收藏'}">${fav?'♥':'♡'}</span>${selected?'<b class="sticker-check">✓</b>':''}</button>`;}
function markRecent(id){state.recent=[id,...state.recent.filter(x=>x!==id)].slice(0,24);persistPrefs();}
function toggleFavorite(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);persistPrefs();updateStickerPanelResults();}
function toggleLibrarySticker(id){if(state.selectedLibrary.has(id))state.selectedLibrary.delete(id);else state.selectedLibrary.add(id);updateStickerPanelResults();}

function findOpenPosition(offset=0){
  const existing=[...(state.entry.stickers||[]),(state.entry.photos||[])];const candidates=[];for(let r=0;r<5;r++)for(let c=0;c<7;c++)candidates.push({x:.14+c*.12,y:.32+r*.12});const rotated=[...candidates.slice(offset),...candidates.slice(0,offset)];for(const p of rotated){if(!existing.some(o=>Math.hypot((o.x-p.x)*CANVAS_W,(o.y-p.y)*CANVAS_H)<70))return p;}return {x:.5,y:.52};
}
function addSticker(sticker){const before=clone(state.entry),p=findOpenPosition((state.entry.stickers||[]).length);const item={id:uid(sticker.id),stickerId:sticker.id,x:p.x,y:p.y,scale:1,rotation:0,z:Date.now(),locked:false};state.entry.stickers=[...(state.entry.stickers||[]),item];state.selectedCanvas=new Set([item.id]);state.selectedText=null;markRecent(sticker.id);recordChange(before,'已加入贴纸');renderCanvasOnly();}
function addSelectedStickers(){const chosen=STICKERS.filter(s=>state.selectedLibrary.has(s.id));if(!chosen.length)return;const before=clone(state.entry);chosen.forEach(s=>{const p=findOpenPosition((state.entry.stickers||[]).length);state.entry.stickers.push({id:uid(s.id),stickerId:s.id,x:p.x,y:p.y,scale:1,rotation:0,z:Date.now(),locked:false});markRecent(s.id);});state.selectedLibrary.clear();state.multiSelectMode=false;recordChange(before,`已加入 ${chosen.length} 枚贴纸`);renderDrawer();toast(`已加入 ${chosen.length} 枚贴纸`);}
function removeSelected(){const ids=new Set([...state.selectedCanvas,...state.selectedPhoto]),before=clone(state.entry);if(!ids.size)return;state.entry.stickers=(state.entry.stickers||[]).filter(x=>!ids.has(x.id));state.entry.photos=(state.entry.photos||[]).filter(x=>!ids.has(x.id));state.selectedCanvas.clear();state.selectedPhoto.clear();state.selectedText=null;recordChange(before,'已删除');renderCanvasOnly();renderTools();}
function duplicateSelected(){const ids=[...state.selectedCanvas],photos=[...state.selectedPhoto];if(!ids.length&&!photos.length)return;const before=clone(state.entry),newIds=[];ids.forEach(id=>{const src=state.entry.stickers.find(x=>x.id===id);if(src){const n={...src,id:uid(src.stickerId),x:clamp(src.x+.06,.06,.94),y:clamp(src.y+.06,.18,.92),z:Date.now()};state.entry.stickers.push(n);newIds.push(n.id);}});photos.forEach(id=>{const src=state.entry.photos.find(x=>x.id===id);if(src){const n={...src,id:uid('photo'),x:clamp(src.x+.06,.06,.94),y:clamp(src.y+.06,.18,.92),z:Date.now()};state.entry.photos.push(n);newIds.push(n.id);}});state.selectedCanvas=new Set(newIds);state.selectedPhoto=new Set();recordChange(before,'已复制');renderCanvasOnly();renderTools();}
function adjustSelectedScale(delta){const before=clone(state.entry);state.entry.stickers.forEach(x=>{if(state.selectedCanvas.has(x.id)&&!x.locked)x.scale=clamp((x.scale||1)+delta,.35,2.15);});state.entry.photos.forEach(x=>{if(state.selectedPhoto.has(x.id)&&!x.locked)x.scale=clamp((x.scale||1)+delta,.35,1.8);});recordChange(before);renderCanvasOnly();}
function rotateSelected(delta){const before=clone(state.entry);state.entry.stickers.forEach(x=>{if(state.selectedCanvas.has(x.id)&&!x.locked)x.rotation=clamp((x.rotation||0)+delta,-180,180);});state.entry.photos.forEach(x=>{if(state.selectedPhoto.has(x.id)&&!x.locked)x.rotation=clamp((x.rotation||0)+delta,-180,180);});recordChange(before);renderCanvasOnly();}
function layerSelected(dir){const ids=new Set(state.selectedCanvas);if(!ids.size)return;const before=clone(state.entry),list=state.entry.stickers||[];if(dir==='front'){let max=Math.max(0,...list.map(x=>Number(x.z)||0));for(const it of list){if(ids.has(it.id))it.z=++max;}}else{let min=Math.min(0,...list.map(x=>Number(x.z)||0));for(const it of list){if(ids.has(it.id))it.z=--min;}}recordChange(before);renderCanvasOnly();renderTools();}
function toggleLockSelected(){const ids=new Set(state.selectedCanvas),before=clone(state.entry);state.entry.stickers.forEach(x=>{if(ids.has(x.id))x.locked=!x.locked;});recordChange(before);renderCanvasOnly();renderTools();}
function autoArrangeStickers(){const list=state.entry.stickers||[];if(!list.length)return;const before=clone(state.entry),anchors=[];for(let r=0;r<4;r++)for(let c=0;c<6;c++)anchors.push({x:.16+c*.14,y:.44+r*.11});list.forEach((it,i)=>{if(it.locked)return;const a=anchors[i%anchors.length];it.x=a.x;it.y=a.y;it.rotation=(i%5-2)*3;it.z=i+1;});recordChange(before,'已自动排版');renderCanvasOnly();}
function toggleCanvasSelection(id){if(state.canvasMultiSelect){if(state.selectedCanvas.has(id))state.selectedCanvas.delete(id);else state.selectedCanvas.add(id);}else{state.selectedCanvas=new Set([id]);state.selectedPhoto.clear();}state.selectedText=null;renderTools();renderCanvasSelectionState();}
function clearSelection(){state.selectedCanvas.clear();state.selectedPhoto.clear();state.selectedText=null;renderCanvasSelectionState();renderTools();}

async function fileToDataUrl(file){return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
async function compressImage(file){const src=await fileToDataUrl(file);return await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.72));};img.onerror=reject;img.src=src;});}
async function addPhoto(file){try{const src=await compressImage(file),before=clone(state.entry),p=findOpenPosition((state.entry.photos||[]).length);const photo={id:uid('photo'),src,x:p.x,y:p.y,scale:1,rotation:0,z:Date.now(),locked:false};state.entry.photos=[...(state.entry.photos||[]),photo];state.selectedPhoto=new Set([photo.id]);state.selectedCanvas.clear();recordChange(before,'已加入照片');renderCanvasOnly();renderTools();}catch{toast('照片读取失败。');}}

function renderDrawer(){
  if(!state.drawerOpen){closeDrawer();return;}const e=state.entry||emptyEntry(currentDateKey());
  const canvasObjects=[];
  (e.photos||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>canvasObjects.push(`<img class="placed-photo ${state.selectedPhoto.has(p.id)?'selected':''}" data-drag-kind="photo" data-id="${p.id}" src="${escapeHtml(p.src)}" alt="照片" style="left:${p.x*100}%;top:${p.y*100}%;transform:translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1});z-index:${p.z||2}" />`));
  (e.stickers||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>{const st=STICKERS.find(x=>x.id===p.stickerId);if(!st)return;canvasObjects.push(`<div class="placed-sticker ${state.selectedCanvas.has(p.id)?'selected':''} ${p.locked?'locked':''}" data-drag-kind="sticker" data-id="${p.id}" style="left:${p.x*100}%;top:${p.y*100}%;transform:translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1});z-index:${p.z||2}">${svgSticker(st,64)}</div>`);});
  const title=e.title||'',content=e.content||'';document.getElementById('drawerRoot').innerHTML=`<button class="drawer-backdrop" id="drawerBackdrop"></button><aside class="editor-drawer"><div class="drawer-head"><div><div class="section-kicker">A CORNER FOR</div><h2>${currentDateKey()}</h2><span class="draft-label ${e._draft?'show':''}">${e._draft?'未保存草稿':''}</span></div><button class="close-button" id="closeDrawer">×</button></div><div class="editor-body">
    ${supabase&&!state.user?'<div class="login-hint"><strong>云端记录</strong><span>当前输入会自动保留在本机，登录后再保存到云端。</span><button id="loginFromEditor">登录</button></div>':''}
    <div class="canvas-toolbar"><div><strong>一日画布</strong><span id="canvasSelectionInfo"></span></div><div class="canvas-actions"><button class="ghost-mini" id="undoBtn" ${state.historyPast.length?'':'disabled'}>撤销</button><button class="ghost-mini" id="redoBtn" ${state.historyFuture.length?'':'disabled'}>恢复</button><button class="ghost-mini ${state.canvasMultiSelect?'active':''}" id="toggleCanvasMulti">${state.canvasMultiSelect?'结束多选':'多选移动'}</button><button class="ghost-mini" id="autoArrange">自动排版</button></div></div>
    ${state.pendingCapsule?`<div class="capsule-alert"><strong>时间胶囊</strong><span>${escapeHtml(state.pendingCapsule.note)}</span></div>`:''}
    <div class="journal-canvas" id="journalCanvas" style="background:${escapeHtml(e.background)}"><div class="canvas-date">${currentDateKey()}</div>
      <div class="canvas-text title-canvas ${title?'':'placeholder'} ${state.selectedText==='title'?'text-selected':''}" data-drag-kind="title" style="left:${e.titlePos.x*100}%;top:${e.titlePos.y*100}%;font-size:${e.titleStyle.fontSize}px;text-align:${e.titleStyle.align};font-weight:${e.titleStyle.weight||500}">${escapeHtml(title||'双击这里写标题')}</div>
      <div class="canvas-text content-canvas ${content?'':'placeholder'} ${state.selectedText==='content'?'text-selected':''}" data-drag-kind="content" style="left:${e.contentPos.x*100}%;top:${e.contentPos.y*100}%;font-size:${e.contentStyle.fontSize}px;text-align:${e.contentStyle.align};font-weight:${e.contentStyle.weight||400}">${escapeHtml(content||'双击这里写下今天发生了什么…')}</div>${canvasObjects}</div>
    <div class="canvas-hint">点击文字后可直接编辑；拖动元素调整位置。滚轮缩放选中的贴纸，Shift + 滚轮旋转。双击贴纸删除。</div>
    <div class="selection-tools" id="selectionTools"><div id="objectTools"></div><div id="textTools"></div></div>
    <div class="field-block"><label class="field-label">标题<input id="entryTitle" maxlength="80" value="${escapeHtml(title)}" placeholder="给这一天一个名字" /></label><label class="field-label">今天发生了什么？<textarea id="entryContent" rows="4" placeholder="写下一点点就好。">${escapeHtml(content)}</textarea></label><div class="autosave-note" id="autosaveNote">${escapeHtml(state.autosaveStatus||'输入会自动保留；登录后会自动同步到云端。')}</div></div>
    <div class="editor-section"><div class="section-title-row"><div><span>贴纸库</span><small>搜索 / 推荐 / 收藏 / 最近使用；支持多选加入。</small></div><span>${(e.stickers||[]).length} 枚已在画布</span></div><div id="stickerPanel"></div></div>
    <div class="editor-section"><div class="section-title-row"><div><span>心情</span><small>给这一天一个轻轻的标记。</small></div></div><div class="mood-row">${MOODS.map(m=>`<button class="mood-choice ${e.mood===m.key?'selected':''}" data-mood="${m.key}">${m.label}</button>`).join('')}</div></div>
    <div class="editor-section"><div class="section-title-row"><div><span>照片</span><small>可放入几张生活照片，自动压缩保存。</small></div></div><input type="file" id="photoInput" accept="image/*" multiple hidden><button class="subtle-upload" id="addPhotoBtn">＋ 添加照片</button><div class="photo-note">${(e.photos||[]).length?`已添加 ${(e.photos||[]).length} 张`:'暂未添加照片'}</div></div>
    <div class="editor-section"><div class="section-title-row"><div><span>背景</span><small>给这一天一个轻轻的底色。</small></div></div><div class="color-row">${backgroundOptions.map(c=>`<button class="color-choice ${e.background===c?'selected':''}" data-color="${c}" style="background:${c}" aria-label="选择背景"></button>`).join('')}</div></div>
    <div class="editor-section capsule-section"><div class="section-title-row"><div><span>写给未来</span><small>给未来某一天留一句话。</small></div></div><button class="subtle-upload" id="editCapsule">${e.timeCapsule?'编辑时间胶囊':'＋ 设置时间胶囊'}</button>${e.timeCapsule?`<button class="text-button" id="clearCapsule">清除时间胶囊 · ${escapeHtml(e.timeCapsule.date)}</button>`:''}</div>
    <div class="editor-section export-section"><div class="section-title-row"><div><span>分享与导出</span><small>把这一隅保存成图片。</small></div></div><div class="export-row"><button class="subtle-upload" id="exportDayBtn">导出这一日 PNG</button><button class="subtle-upload" id="shareDayBtn">分享这一日</button></div></div>
  </div><div class="drawer-footer"><button class="danger-button" id="deleteEntry">清空这一天</button><span class="save-status" id="saveStatus">${escapeHtml(state.status)}</span><button class="save-button" id="saveEntry">保存这一隅</button></div></aside>`;
  bindDrawerEvents();renderStickerPanel();renderTools();renderCanvasSelectionState();bindCanvasInteractions(document.getElementById('journalCanvas'));checkCapsule();
}
function openDrawer(){state.drawerOpen=true;state.autosaveStatus='';state.selectedText=null;state.selectedCanvas.clear();state.selectedPhoto.clear();renderDrawer();}
function closeDrawer(){if(state.textEdit)finishInlineTextEdit();state.drawerOpen=false;state.drag=null;state.textEdit=null;const root=document.getElementById('drawerRoot');if(root)root.innerHTML='';}
function updateDrawerFooter(){const s=document.getElementById('saveStatus');if(s)s.textContent=state.status;const a=document.getElementById('autosaveNote');if(a)a.textContent=state.autosaveStatus||'输入会自动保留；登录后会自动同步到云端。';}
function bindDrawerEvents(){
  document.getElementById('drawerBackdrop').addEventListener('click',closeDrawer);document.getElementById('closeDrawer').addEventListener('click',closeDrawer);document.getElementById('saveEntry').addEventListener('click',()=>saveEntry());document.getElementById('deleteEntry').addEventListener('click',deleteEntry);document.getElementById('loginFromEditor')?.addEventListener('click',openAuth);
  const t=document.getElementById('entryTitle'),c=document.getElementById('entryContent');
  const onInput=(kind,el)=>{state.entry[kind]=el.value;queueDraftSaveAndRecommend();renderCanvasOnly();};
  const queueDraftSaveAndRecommend=()=>{saveDraft(state.entry);state.autosaveStatus='正在保存草稿…';clearTimeout(state.recoTimer);state.recoTimer=setTimeout(()=>{updateStickerPanelResults();},120);scheduleCloudSave();updateDrawerFooter();};
  t.addEventListener('focus',()=>{if(state.textEdit)finishInlineTextEdit();});
  c.addEventListener('focus',()=>{if(state.textEdit)finishInlineTextEdit();});
  t.addEventListener('compositionstart',()=>state.inputComposing=true);
  c.addEventListener('compositionstart',()=>state.inputComposing=true);
  t.addEventListener('compositionend',()=>{state.inputComposing=false;onInput('title',t);});
  c.addEventListener('compositionend',()=>{state.inputComposing=false;onInput('content',c);});
  t.addEventListener('input',()=>{if(!state.inputComposing)onInput('title',t);});
  c.addEventListener('input',()=>{if(!state.inputComposing)onInput('content',c);});
  document.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>{const before=clone(state.entry);state.entry.background=btn.dataset.color;recordChange(before);renderDrawer();}));
  document.querySelectorAll('[data-mood]').forEach(btn=>btn.addEventListener('click',()=>{const before=clone(state.entry);state.entry.mood=state.entry.mood===btn.dataset.mood?null:btn.dataset.mood;recordChange(before);renderDrawer();}));
  document.getElementById('undoBtn').addEventListener('click',undo);document.getElementById('redoBtn').addEventListener('click',redo);document.getElementById('toggleCanvasMulti').addEventListener('click',()=>{state.canvasMultiSelect=!state.canvasMultiSelect;state.selectedCanvas.clear();state.selectedPhoto.clear();renderDrawer();});document.getElementById('autoArrange').addEventListener('click',autoArrangeStickers);
  document.getElementById('addPhotoBtn').addEventListener('click',()=>document.getElementById('photoInput').click());document.getElementById('photoInput').addEventListener('change',async e=>{for(const f of [...e.target.files])await addPhoto(f);});
  document.getElementById('editCapsule').addEventListener('click',openCapsule);document.getElementById('clearCapsule')?.addEventListener('click',()=>{const before=clone(state.entry);state.entry.timeCapsule=null;recordChange(before);renderDrawer();});document.getElementById('exportDayBtn').addEventListener('click',()=>exportDayPng());document.getElementById('shareDayBtn').addEventListener('click',shareDay);
}
function queueMicroDraft(){saveDraft(state.entry);scheduleCloudSave();}
function renderTools(){const wrap=document.getElementById('objectTools');if(!wrap)return;let html='';const n=state.selectedCanvas.size+state.selectedPhoto.size;if(n){const locked=state.selectedCanvas.size&&[...state.selectedCanvas].some(id=>state.entry.stickers.find(x=>x.id===id)?.locked);html+=`<div class="tool-group"><span class="tool-label">选中 ${n} 个</span><button class="ghost-mini" id="scaleDown">缩小</button><button class="ghost-mini" id="scaleUp">放大</button><button class="ghost-mini" id="rotateLeft">↺</button><button class="ghost-mini" id="rotateRight">↻</button><button class="ghost-mini" id="sendBack">后置</button><button class="ghost-mini" id="bringFront">前置</button><button class="ghost-mini" id="duplicateSelected">复制</button><button class="ghost-mini" id="lockSelected">${locked?'解锁':'锁定'}</button><button class="ghost-mini danger-mini" id="deleteSelected">删除</button></div>`;}
  wrap.innerHTML=html;document.getElementById('scaleDown')?.addEventListener('click',()=>adjustSelectedScale(-.08));document.getElementById('scaleUp')?.addEventListener('click',()=>adjustSelectedScale(.08));document.getElementById('rotateLeft')?.addEventListener('click',()=>rotateSelected(-8));document.getElementById('rotateRight')?.addEventListener('click',()=>rotateSelected(8));document.getElementById('sendBack')?.addEventListener('click',()=>layerSelected('back'));document.getElementById('bringFront')?.addEventListener('click',()=>layerSelected('front'));document.getElementById('duplicateSelected')?.addEventListener('click',duplicateSelected);document.getElementById('lockSelected')?.addEventListener('click',toggleLockSelected);document.getElementById('deleteSelected')?.addEventListener('click',removeSelected);
  const text=document.getElementById('textTools');if(text){if(state.selectedText){const style=state.entry[`${state.selectedText}Style`]||{};text.innerHTML=`<div class="tool-group"><span class="tool-label">${state.selectedText==='title'?'标题':'正文'} · ${style.fontSize}px</span><button class="ghost-mini" id="textSmaller">A−</button><button class="ghost-mini" id="textLarger">A＋</button><button class="ghost-mini" id="textAlign">对齐：${style.align==='left'?'左':style.align==='center'?'中':'右'}</button></div>`;document.getElementById('textSmaller').onclick=()=>setTextSize(state.selectedText,-2);document.getElementById('textLarger').onclick=()=>setTextSize(state.selectedText,2);document.getElementById('textAlign').onclick=()=>toggleTextAlign(state.selectedText);}else text.innerHTML='<div class="tool-group"><span class="tool-muted">点击文字可编辑；拖动可调整位置</span></div>';}}
function renderCanvasSelectionState(){document.querySelectorAll('.placed-sticker').forEach(el=>el.classList.toggle('selected',state.selectedCanvas.has(el.dataset.id)));document.querySelectorAll('.placed-photo').forEach(el=>el.classList.toggle('selected',state.selectedPhoto.has(el.dataset.id)));document.querySelectorAll('.canvas-text').forEach(el=>el.classList.toggle('text-selected',state.selectedText===el.dataset.dragKind));const info=document.getElementById('canvasSelectionInfo');if(info)info.textContent=state.selectedText?`已选${state.selectedText==='title'?'标题':'正文'}`:(state.selectedCanvas.size+state.selectedPhoto.size?`已选 ${state.selectedCanvas.size+state.selectedPhoto.size} 个`:'未选择');}
function renderCanvasOnly(){const c=document.getElementById('journalCanvas');if(!c)return;c.style.background=state.entry.background||'#fffdf7';const t=c.querySelector('[data-drag-kind="title"]'),ct=c.querySelector('[data-drag-kind="content"]');if(t&&!state.textEdit){t.textContent=state.entry.title||'双击这里写标题';t.classList.toggle('placeholder',!state.entry.title);t.style.left=`${state.entry.titlePos.x*100}%`;t.style.top=`${state.entry.titlePos.y*100}%`;t.style.fontSize=`${state.entry.titleStyle.fontSize}px`;t.style.textAlign=state.entry.titleStyle.align;t.style.fontWeight=state.entry.titleStyle.weight||500;}if(ct&&!state.textEdit){ct.textContent=state.entry.content||'双击这里写下今天发生了什么…';ct.classList.toggle('placeholder',!state.entry.content);ct.style.left=`${state.entry.contentPos.x*100}%`;ct.style.top=`${state.entry.contentPos.y*100}%`;ct.style.fontSize=`${state.entry.contentStyle.fontSize}px`;ct.style.textAlign=state.entry.contentStyle.align;ct.style.fontWeight=state.entry.contentStyle.weight||400;}state.entry.stickers?.forEach(p=>{const el=c.querySelector(`[data-id="${CSS.escape(p.id)}"]`);if(el){el.style.left=`${p.x*100}%`;el.style.top=`${p.y*100}%`;el.style.transform=`translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1})`;el.style.zIndex=p.z||2;}});state.entry.photos?.forEach(p=>{const el=c.querySelector(`[data-id="${CSS.escape(p.id)}"]`);if(el){el.style.left=`${p.x*100}%`;el.style.top=`${p.y*100}%`;el.style.transform=`translate(-50%,-50%) rotate(${p.rotation||0}deg) scale(${p.scale||1})`;el.style.zIndex=p.z||2;}});renderCanvasSelectionState();renderTools();}

function bindCanvasInteractions(canvas){
  if(!canvas)return;
  let candidate=null;
  const down=(kind,id,e)=>{
    if(e.button!==undefined&&e.button!==0)return;
    if((kind==='title'||kind==='content') && state.textEdit){
      if(state.textEdit.kind===kind)return;
      finishInlineTextEdit();
    }
    const rect=canvas.getBoundingClientRect(),sx=(e.clientX-rect.left)/rect.width,sy=(e.clientY-rect.top)/rect.height;
    if(kind==='title'||kind==='content'){
      // Do not cancel the browser's native pointer behavior here.
      // A click enters inline editing on pointerup; a drag moves the text.
      state.selectedText=kind;state.selectedCanvas.clear();state.selectedPhoto.clear();
      candidate={kind,rect,startX:sx,startY:sy,moved:false,before:clone(state.entry)};
      renderCanvasSelectionState();return;
    }
    e.preventDefault();e.stopPropagation();
    if(kind==='sticker'){
      const item=state.entry.stickers.find(x=>x.id===id);if(!item)return;
      if(item.locked&&!state.canvasMultiSelect){toggleCanvasSelection(id);return;}
      toggleCanvasSelection(id);
      candidate={kind,id,rect,startX:sx,startY:sy,starts:Object.fromEntries([...state.selectedCanvas].map(i=>{const it=state.entry.stickers.find(x=>x.id===i);return[it?i:null,it?{x:it.x,y:it.y}:null]}).filter(x=>x[0])),before:clone(state.entry),moved:false};
      e.currentTarget.setPointerCapture?.(e.pointerId);return;
    }
    if(kind==='photo'){
      const item=state.entry.photos.find(x=>x.id===id);if(!item||item.locked)return;
      state.selectedPhoto=state.canvasMultiSelect?new Set([...state.selectedPhoto,id]):new Set([id]);state.selectedCanvas.clear();state.selectedText=null;
      renderCanvasSelectionState();candidate={kind,id,rect,startX:sx,startY:sy,starts:{[id]:{x:item.x,y:item.y}},before:clone(state.entry),moved:false};e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };
  canvas.querySelectorAll('[data-drag-kind="sticker"]').forEach(el=>{
    el.addEventListener('pointerdown',e=>down('sticker',el.dataset.id,e));
    el.addEventListener('dblclick',()=>{if(el.classList.contains('locked'))return;const before=clone(state.entry);state.entry.stickers=state.entry.stickers.filter(x=>x.id!==el.dataset.id);state.selectedCanvas.delete(el.dataset.id);recordChange(before,'已删除贴纸');renderDrawer();});
  });
  canvas.querySelectorAll('[data-drag-kind="photo"]').forEach(el=>el.addEventListener('pointerdown',e=>down('photo',el.dataset.id,e)));
  canvas.querySelector('[data-drag-kind="title"]')?.addEventListener('pointerdown',e=>down('title',null,e));
  canvas.querySelector('[data-drag-kind="content"]')?.addEventListener('pointerdown',e=>down('content',null,e));
  canvas.addEventListener('wheel',e=>{if(!state.selectedCanvas.size&&!state.selectedPhoto.size)return;e.preventDefault();if(e.shiftKey)rotateSelected(e.deltaY>0?5:-5);else adjustSelectedScale(e.deltaY>0?-.05:.05);},{passive:false});
  const move=e=>{
    if(!candidate)return;
    const rect=canvas.getBoundingClientRect(),nx=(e.clientX-rect.left)/rect.width,ny=(e.clientY-rect.top)/rect.height,dx=nx-candidate.startX,dy=ny-candidate.startY;
    if(Math.hypot(dx,dy)>.008)candidate.moved=true;
    if(candidate.kind==='sticker'){
      for(const id of state.selectedCanvas){const it=state.entry.stickers.find(x=>x.id===id),st=candidate.starts[id];if(!it||it.locked||!st)continue;it.x=clamp(st.x+dx,.04,.96);it.y=clamp(st.y+dy,.14,.94);const el=canvas.querySelector(`[data-id="${CSS.escape(id)}"]`);if(el){el.style.left=`${it.x*100}%`;el.style.top=`${it.y*100}%`;}}
    }else if(candidate.kind==='photo'){
      for(const id of state.selectedPhoto){const it=state.entry.photos.find(x=>x.id===id),st=candidate.starts[id];if(!it||it.locked||!st)continue;it.x=clamp(st.x+dx,.04,.96);it.y=clamp(st.y+dy,.18,.94);const el=canvas.querySelector(`[data-id="${CSS.escape(id)}"]`);if(el){el.style.left=`${it.x*100}%`;el.style.top=`${it.y*100}%`;}}
    }else{
      const posKey=candidate.kind==='title'?'titlePos':'contentPos',base=candidate.before[posKey]||state.entry[posKey];state.entry[posKey]={x:clamp(base.x+dx,.04,.86),y:clamp(base.y+dy,.10,.90)};const el=canvas.querySelector(`[data-drag-kind="${candidate.kind}"]`);if(el){el.style.left=`${state.entry[posKey].x*100}%`;el.style.top=`${state.entry[posKey].y*100}%`;}
    }
    state.autosaveStatus='正在保存草稿…';updateDrawerFooter();
  };
  const up=()=>{
    if(!candidate)return;
    const c=candidate;candidate=null;
    if((c.kind==='title'||c.kind==='content')&&!c.moved){
      startInlineTextEdit(c.kind);
      requestAnimationFrame(()=>document.querySelector(`.canvas-text[data-drag-kind="${c.kind}"]`)?.focus());
      return;
    }
    recordChange(c.before);
  };
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('click',e=>{if(e.target===canvas)clearSelection();});
}
function startInlineTextEdit(kind){
  if(kind!=='title'&&kind!=='content')return;
  if(state.textEdit){
    if(state.textEdit.kind===kind){document.querySelector(`.canvas-text[data-drag-kind="${kind}"]`)?.focus();return;}
    finishInlineTextEdit();
  }
  const el=document.querySelector(`.canvas-text[data-drag-kind="${kind}"]`);if(!el)return;
  state.textEdit={kind,beforeText:state.entry[kind]||'',beforeEntry:clone(state.entry)};
  state.selectedText=kind;state.selectedCanvas.clear();state.selectedPhoto.clear();
  el.contentEditable='true';el.classList.add('editing');el.dataset.editing='true';
  if(!state.entry[kind])el.textContent='';
  el.focus();
  const range=document.createRange();range.selectNodeContents(el);range.collapse(false);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
  if(!el.dataset.inlineBound){
    el.dataset.inlineBound='1';
    el.addEventListener('input',()=>{
      if(!state.textEdit||state.textEdit.kind!==el.dataset.dragKind)return;
      const kind=el.dataset.dragKind;
      state.entry[kind]=el.innerText.replace(/\u00a0/g,' ').replace(/\r/g,'');
      updateSidebarInput(kind);
      queueDraftSaveAndCloud();
    });
    el.addEventListener('compositionstart',()=>{state.inputComposing=true;});
    el.addEventListener('compositionend',()=>{state.inputComposing=false;});
  }
  renderCanvasSelectionState();
}
function queueDraftSaveAndCloud(){
  saveDraft(state.entry);state.autosaveStatus='正在保存草稿…';updateDrawerFooter();
  clearTimeout(state.recoTimer);state.recoTimer=setTimeout(()=>{if(state.drawerOpen&&!state.textEdit)updateStickerPanelResults();},180);
  scheduleCloudSave();
}
function updateSidebarInput(kind){
  const id=kind==='title'?'entryTitle':'entryContent';
  const el=document.getElementById(id);
  if(el && document.activeElement!==el){ el.value=String(state.entry?.[kind]||''); }
}

function finishInlineTextEdit(cancel=false){
  const edit=state.textEdit;if(!edit)return;
  const el=document.querySelector(`.canvas-text[data-drag-kind=\"${edit.kind}\"]`);
  if(cancel){state.entry=clone(edit.beforeEntry);}else if(el){state.entry[edit.kind]=el.innerText.replace(/\u00a0/g,' ').replace(/\r/g,'').trimEnd();}
  state.textEdit=null;
  if(el){el.contentEditable='false';el.classList.remove('editing');delete el.dataset.editing;}
  updateSidebarInput(edit.kind);
  if(JSON.stringify(edit.beforeEntry)!==JSON.stringify(state.entry))pushHistory(edit.beforeEntry);
  saveDraft(state.entry);
  scheduleCloudSave();
  updateStickerPanelResults();
  renderCanvasOnly();
  renderTools();
}
function setTextSize(kind,delta){const before=clone(state.entry),style=state.entry[`${kind}Style`]||{};style.fontSize=clamp((style.fontSize|| (kind==='title'?25:12))+delta,kind==='title'?16:9,kind==='title'?46:22);state.entry[`${kind}Style`]=style;recordChange(before);renderCanvasOnly();renderTools();}
function toggleTextAlign(kind){const before=clone(state.entry),style=state.entry[`${kind}Style`]||{};style.align=style.align==='left'?'center':style.align==='center'?'right':'left';state.entry[`${kind}Style`]=style;recordChange(before);renderCanvasOnly();renderTools();}
function moveSelectionByKeyboard(dx,dy){const before=clone(state.entry);if(state.selectedText){const k=state.selectedText+'Pos',p=state.entry[k];state.entry[k]={x:clamp(p.x+dx,.04,.86),y:clamp(p.y+dy,.10,.90)};}else{state.entry.stickers.forEach(it=>{if(state.selectedCanvas.has(it.id)&&!it.locked){it.x=clamp(it.x+dx,.04,.96);it.y=clamp(it.y+dy,.14,.94);}});state.entry.photos.forEach(it=>{if(state.selectedPhoto.has(it.id)&&!it.locked){it.x=clamp(it.x+dx,.04,.96);it.y=clamp(it.y+dy,.18,.94);}});}recordChange(before);renderCanvasOnly();}
function undo(){if(!state.historyPast.length)return;const current=clone(state.entry);state.historyFuture.push(current);state.entry=state.historyPast.pop();saveDraft(state.entry);renderDrawer();toast('已撤销');}
function redo(){if(!state.historyFuture.length)return;const current=clone(state.entry);state.historyPast.push(current);state.entry=state.historyFuture.pop();saveDraft(state.entry);renderDrawer();toast('已恢复');}

function renderStickerPanel(){const panel=document.getElementById('stickerPanel');if(!panel)return;panel.innerHTML=`<div class="sticker-search-row"><div class="search-wrap"><span>⌕</span><input id="stickerSearch" value="${escapeHtml(state.stickerSearch)}" placeholder="搜索贴纸 / 例如：咖啡、海边、下雨" autocomplete="off" /></div><button class="ghost-mini ${state.multiSelectMode?'active':''}" id="toggleMulti">${state.multiSelectMode?'结束多选':'多选'}</button></div><div class="quick-sticker-tabs"><button class="quick-tab ${state.stickerCategory==='all'?'selected':''}" data-cat="all">全部</button><button class="quick-tab ${state.stickerCategory==='favorite'?'selected':''}" data-cat="favorite">收藏</button><button class="quick-tab ${state.stickerCategory==='recent'?'selected':''}" data-cat="recent">最近</button><button class="quick-tab ${state.stickerCategory==='recommended'?'selected':''}" data-cat="recommended">推荐</button></div><div class="category-tabs">${STICKER_CATEGORIES.filter(c=>!['all','recommended'].includes(c.key)).map(c=>`<button class="category-tab ${state.stickerCategory===c.key?'selected':''}" data-cat="${c.key}">${c.label}</button>`).join('')}</div><div class="sticker-count-row"><span id="stickerCount"></span><span id="stickerSelectedCount"></span></div><div id="recommendRoot"></div><div class="sticker-library" id="stickerResults"></div><div id="multiSelectBarRoot"></div>`;
  const input=document.getElementById('stickerSearch');input.addEventListener('compositionstart',()=>state.stickerSearchComposing=true);input.addEventListener('compositionend',e=>{state.stickerSearchComposing=false;state.stickerSearch=e.target.value;updateStickerPanelResults();});input.addEventListener('input',e=>{state.stickerSearch=e.target.value;if(!state.stickerSearchComposing)updateStickerPanelResults();});
  document.getElementById('toggleMulti').addEventListener('click',()=>{state.multiSelectMode=!state.multiSelectMode;if(!state.multiSelectMode)state.selectedLibrary.clear();updateStickerPanelResults();});
  panel.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{state.stickerCategory=b.dataset.cat;updateStickerPanelResults();}));updateStickerPanelResults();
}
function updateStickerPanelResults(){const panel=document.getElementById('stickerPanel');if(!panel)return;state.recommendedIds=recommendationIds();const list=filteredStickers(),results=document.getElementById('stickerResults');document.getElementById('stickerCount').textContent=`${list.length} 枚贴纸`;document.getElementById('stickerSelectedCount').textContent=state.multiSelectMode&&state.selectedLibrary.size?`已选 ${state.selectedLibrary.size} 枚`:'';const rec=document.getElementById('recommendRoot');const f=festivalForDate(currentDateKey());rec.innerHTML=(!state.stickerSearch.trim()&&state.recommendedIds.length)?`<div class="recommend-strip"><div class="recommend-title"><span>${f?`今天附近：${escapeHtml(f.name)} · `:''}根据文字推荐</span><button id="showRecommendations">查看 ${state.recommendedIds.length} 枚</button></div><div class="recommend-row">${state.recommendedIds.slice(0,8).map(id=>stickerTileHtml(STICKERS.find(s=>s.id===id))).join('')}</div></div>`:'';results.innerHTML=list.length?list.map(stickerTileHtml).join(''):`<div class="empty-stickers">没有找到相关贴纸。试试“海边 / 工作 / 开心 / 早餐”。</div>`;const bar=document.getElementById('multiSelectBarRoot');bar.innerHTML=state.multiSelectMode?`<div class="multi-select-bar"><span>可多选后一次加入，系统会自动错开放置。</span><button class="save-button mini" id="addSelected" ${state.selectedLibrary.size?'':'disabled'}>加入所选 ${state.selectedLibrary.size||''}</button></div>`:'';
  document.getElementById('showRecommendations')?.addEventListener('click',()=>{state.stickerCategory='recommended';updateStickerPanelResults();});document.getElementById('addSelected')?.addEventListener('click',addSelectedStickers);
  results.onclick=e=>{const fav=e.target.closest('[data-fav]');if(fav){e.preventDefault();e.stopPropagation();toggleFavorite(fav.dataset.fav);return;}const b=e.target.closest('[data-sticker]');if(!b)return;const s=STICKERS.find(x=>x.id===b.dataset.sticker);if(!s)return;if(e.shiftKey){toggleFavorite(s.id);return;}if(state.multiSelectMode)toggleLibrarySticker(s.id);else addSticker(s);};
  results.oncontextmenu=e=>{const b=e.target.closest('[data-sticker]');if(!b)return;e.preventDefault();toggleFavorite(b.dataset.sticker);};
}

function openCapsule(){const e=state.entry||emptyEntry(currentDateKey()), existing=e.timeCapsule||{date:'',note:''};document.getElementById('capsuleRoot').innerHTML=`<button class="auth-backdrop" id="capsuleBackdrop"></button><section class="small-modal"><button class="close-button" id="closeCapsule">×</button><div class="section-kicker">TIME CAPSULE</div><h2>写给未来的自己</h2><p>选一个未来日期，留一句话。</p><label class="field-label">打开日期<input type="date" id="capsuleDate" min="${currentDateKey()}" value="${escapeHtml(existing.date)}" /></label><label class="field-label">想说的话<textarea id="capsuleNote" rows="5" placeholder="希望那天的你看到什么？">${escapeHtml(existing.note)}</textarea></label><div class="profile-actions"><button class="save-button full" id="saveCapsule">保存时间胶囊</button></div></section>`;document.getElementById('capsuleBackdrop').addEventListener('click',closeCapsule);document.getElementById('closeCapsule').addEventListener('click',closeCapsule);document.getElementById('saveCapsule').addEventListener('click',()=>{const d=document.getElementById('capsuleDate').value,n=document.getElementById('capsuleNote').value.trim();if(!d||!n){toast('请填写日期和内容。');return;}const before=clone(state.entry);state.entry.timeCapsule={date:d,note:n};recordChange(before);closeCapsule();renderDrawer();toast('时间胶囊已保存');});}
function closeCapsule(){document.getElementById('capsuleRoot').innerHTML='';}
function checkCapsule(){const tc=state.entry?.timeCapsule;if(tc&&tc.date<=currentDateKey()){state.pendingCapsule=tc;}else state.pendingCapsule=null;}

function openReview(){const days=Object.values(state.monthEntries).filter(hasEntryContent),counts={};let moodCounts={};days.forEach(e=>(e.stickers||[]).forEach(s=>counts[s.stickerId]=(counts[s.stickerId]||0)+1));days.forEach(e=>{if(e.mood)moodCounts[e.mood]=(moodCounts[e.mood]||0)+1;});const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,n])=>{const s=STICKERS.find(x=>x.id===id);return s?`<span class="review-sticker">${svgSticker(s,32)} ${escapeHtml(s.name)} · ${n}</span>`:''}).join('');document.getElementById('reviewRoot').innerHTML=`<button class="auth-backdrop" id="reviewBackdrop"></button><section class="review-modal"><button class="close-button" id="closeReview">×</button><div class="section-kicker">MONTH REVIEW</div><h2>${state.year} · ${monthCN[state.month]}</h2><p class="review-sub">这个月，你留下了 ${days.length} 个小片刻。</p><div class="review-stat-grid"><div><strong>${days.length}</strong><span>有记录的日子</span></div><div><strong>${days.reduce((n,e)=>n+(e.stickers||[]).length,0)}</strong><span>枚贴纸</span></div><div><strong>${days.filter(e=>e.photos?.length).length}</strong><span>有照片的日子</span></div></div><div class="review-section"><h3>常出现的贴纸</h3><div class="review-stickers">${top||'<span class="tool-muted">还没有足够的数据。</span>'}</div></div><div class="review-section"><h3>这个月的心情</h3><div class="mood-summary">${MOODS.map(m=>`<span>${m.label} ${moodCounts[m.key]||0}</span>`).join('')}</div></div></section>`;document.getElementById('reviewBackdrop').addEventListener('click',()=>document.getElementById('reviewRoot').innerHTML='');document.getElementById('closeReview').addEventListener('click',()=>document.getElementById('reviewRoot').innerHTML='');}

function exportSvgForSticker(sticker,x,y,size,scale=1,rot=0){if(!sticker)return '';if(sticker.inlineSvg)return `<image href="${escapeHtml(sticker.inlineSvg)}" x="${x-size/2}" y="${y-size/2}" width="${size*scale}" height="${size*scale}" transform="rotate(${rot} ${x} ${y})"/>`;const raw=svgSticker(sticker,size),m=raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/);return m?`<g transform="translate(${x-size/2} ${y-size/2}) rotate(${rot} ${size/2} ${size/2}) scale(${scale})">${m[1]}</g>`:'';}
function textLinesSvg(text,maxChars){const out=[];for(let i=0;i<text.length;i+=maxChars)out.push(text.slice(i,i+maxChars));return out;}
async function svgToPng(svg,w,h,filename){return await new Promise((resolve,reject)=>{const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle='#fbfaf6';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);c.toBlob(b=>{if(!b)return reject(new Error('export failed'));const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);resolve();},'image/png');};img.onerror=reject;img.src=url;});}
function compositionSvg(e,w=1200,h=900){const sx=w/CANVAS_W,sy=h/CANVAS_H,tx=x=>x*CANVAS_W*sx,ty=y=>y*CANVAS_H*sy;let body='';if(e.title){body+=`<text x="${tx(e.titlePos.x)}" y="${ty(e.titlePos.y)}" font-size="${e.titleStyle.fontSize*sx}" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-weight="${e.titleStyle.weight||500}" fill="#3f403b" text-anchor="${e.titleStyle.align==='center'?'middle':e.titleStyle.align==='right'?'end':'start'}">${escapeHtml(e.title)}</text>`;}if(e.content){const lines=textLinesSvg(e.content,Math.max(14,Math.floor(38/(e.contentStyle.fontSize/12))));lines.forEach((line,i)=>body+=`<text x="${tx(e.contentPos.x)}" y="${ty(e.contentPos.y)+i*e.contentStyle.fontSize*1.45*sy}" font-size="${e.contentStyle.fontSize*sx}" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" fill="#66645c" text-anchor="${e.contentStyle.align==='center'?'middle':e.contentStyle.align==='right'?'end':'start'}">${escapeHtml(line)}</text>`);}for(const p of e.photos||[]){body+=`<image href="${escapeHtml(p.src)}" x="${tx(p.x)-80*p.scale*sx}" y="${ty(p.y)-60*p.scale*sy}" width="${160*p.scale*sx}" height="${120*p.scale*sy}" preserveAspectRatio="xMidYMid slice" transform="rotate(${p.rotation||0} ${tx(p.x)} ${ty(p.y)})"/>`;}for(const p of e.stickers||[]){const st=STICKERS.find(x=>x.id===p.stickerId);body+=exportSvgForSticker(st,tx(p.x),ty(p.y),64*sx,p.scale||1,p.rotation||0);}return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" rx="44" fill="${e.background||'#fffdf7'}"/><rect x="24" y="24" width="${w-48}" height="${h-48}" rx="34" fill="none" stroke="#ded9ce" stroke-dasharray="5 7"/><text x="48" y="55" font-size="18" fill="#9b9991" letter-spacing="3">${e.entry_date}</text>${body}</svg>`;}
async function exportDayPng(){await svgToPng(compositionSvg(state.entry,1200,900),1200,900,`in-days-${currentDateKey()}.png`);toast('这一日已导出。');}
async function shareDay(){const fileName=`in-days-${currentDateKey()}.png`;try{const svg=compositionSvg(state.entry,1200,900),blob=new Blob([svg],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url;});const c=document.createElement('canvas');c.width=1200;c.height=900;c.getContext('2d').drawImage(img,0,0);const png=await new Promise(r=>c.toBlob(r,'image/png'));URL.revokeObjectURL(url);const file=new File([png],fileName,{type:'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))await navigator.share({title:'一隅｜IN DAYS',files:[file]});else{const a=document.createElement('a');a.href=URL.createObjectURL(png);a.download=fileName;a.click();} }catch{toast('分享不可用，已改为导出图片。');await exportDayPng();}}
function downloadBlob(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function exportMonthJson(){
  const days=Object.entries(state.monthEntries).filter(([,e])=>hasEntryContent(e)).map(([k,e])=>({date:k,design:serializeForStorage(e)}));
  const payload={product:'IN DAYS',year:state.year,month:state.month+1,days};
  downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),`in-days-${state.year}-${String(state.month+1).padStart(2,'0')}.json`);toast('本月数据已导出。');
}
function buildMonthSvg({onlyRecorded=false}={}){
  const W=1680,H=1320,cols=7,cardW=210,cardH=168,gapX=24,gapY=24,left=64,top=220;
  const total=new Date(state.year,state.month+1,0).getDate(),first=(new Date(state.year,state.month,1).getDay()+6)%7,rows=Math.ceil((first+total)/7);
  let s=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,`<rect width="100%" height="100%" fill="#fbfaf6"/>`,`<text x="64" y="70" font-size="18" fill="#9b9991" letter-spacing="4">${state.year}</text>`,`<text x="64" y="148" font-size="72" fill="#3f403b" font-family="Arial, sans-serif">${escapeHtml(monthNames[state.month])}</text>`];
  for(let d=1;d<=total;d++){
    const key=dateKey(state.year,state.month,d),e=state.monthEntries[key],has=hasEntryContent(e);if(onlyRecorded&&!has)continue;
    const idx=first+d-1,col=idx%7,row=Math.floor(idx/7),x=left+col*(cardW+gapX),y=top+row*(cardH+gapY),bg=e?.background||'#fffdf7';
    s.push(`<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="22" fill="${escapeHtml(bg)}" stroke="#e8e4da"/>`);
    if(has){s.push(`<g transform="translate(${x} ${y}) scale(${cardW/CANVAS_W})">${miniObjectHtml(e,cardW/CANVAS_W)}</g>`);}else{s.push(`<text x="${x+16}" y="${y+24}" font-size="13" fill="#9b9991">${String(d).padStart(2,'0')}</text>`);}
  }
  s.push('</svg>');return s.join('');
}
async function exportMonthPng({onlyRecorded=false}={}){const W=1680,H=1320;await svgToPng(buildMonthSvg({onlyRecorded}),W,H,`in-days-${state.year}-${String(state.month+1).padStart(2,'0')}${onlyRecorded?'-records':''}.png`);toast(onlyRecorded?'有记录的日子已导出。':'本月完整月历已导出。');}
function openMonthExport(){
  const root=document.getElementById('exportMonthRoot');if(!root)return;
  root.innerHTML=`<button class="export-backdrop" id="exportBackdrop"></button><section class="export-modal" role="dialog" aria-modal="true"><button class="close-button" id="closeMonthExport">×</button><div class="section-kicker">EXPORT MONTH</div><h2>导出本月</h2><p>选择一种你想留下的格式，不会一次导出全部内容。</p><div class="export-choice-list"><button class="export-choice" id="exportMonthFull"><strong>完整月历 PNG</strong><span>保留整个${monthCN[state.month]}的日期布局与已记录内容。</span></button><button class="export-choice" id="exportMonthRecords"><strong>仅有记录的日子 PNG</strong><span>只整理本月真正留下内容的日期。</span></button><button class="export-choice" id="exportMonthData"><strong>本月数据 JSON</strong><span>导出文字、贴纸位置、样式等可恢复数据。</span></button></div></section>`;
  document.getElementById('exportBackdrop').addEventListener('click',closeMonthExport);document.getElementById('closeMonthExport').addEventListener('click',closeMonthExport);
  document.getElementById('exportMonthFull').addEventListener('click',async()=>{closeMonthExport();await exportMonthPng({onlyRecorded:false});});
  document.getElementById('exportMonthRecords').addEventListener('click',async()=>{closeMonthExport();await exportMonthPng({onlyRecorded:true});});
  document.getElementById('exportMonthData').addEventListener('click',()=>{closeMonthExport();exportMonthJson();});
}
function closeMonthExport(){document.getElementById('exportMonthRoot').innerHTML='';}

function injectStyle(){const link=document.createElement('link');link.rel='stylesheet';link.href='./styles.css?v=ultimate-final';document.head.appendChild(link);}
function boot(){
  try{
    renderShell();state.entry=emptyEntry(currentDateKey());renderCalendar();
    Promise.resolve(initAuth()).then(async()=>{if(!supabase){await loadCurrentMonth();await loadSelectedEntry();}}).catch(async()=>{await loadCurrentMonth();await loadSelectedEntry();});
  }catch(error){console.error(error);app.innerHTML='<main class="app-shell"><section class="selected-summary"><div><p class="section-kicker">IN DAYS</p><h2>页面加载失败</h2><p>请刷新页面重试。</p></div></section></main>';}
}
boot();

