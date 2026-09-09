import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const CONFIG = window.IN_DAYS_CONFIG || {};
function normalizeSupabaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try { return new URL(raw).origin; } catch { return ''; }
}
const SUPABASE_URL = normalizeSupabaseUrl(CONFIG.SUPABASE_URL);
const SUPABASE_KEY = String(CONFIG.SUPABASE_PUBLISHABLE_KEY || '').trim();
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
  {key:'mood',label:'心情'}, {key:'travel',label:'旅行'}, {key:'hobby',label:'兴趣'}, {key:'life',label:'生活'}
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
  [/猫|猫咪/, ['cat','heart']],
  [/狗|狗狗/, ['dog','heart']],
  [/花|花园|春天/, ['flower','butterfly','bee','sprout']],
  [/成长|开始|新的开始/, ['sprout','sun','star']],
  [/开心|快乐|高兴/, ['happy','heart','wow']],
  [/放松|治愈|舒服|平静/, ['calm','leaf','cloud']],
  [/累|疲惫|很困|熬夜/, ['tired','sleepy','coffee']],
  [/难过|失落|低落/, ['sad','cloud','rain']],
  [/生气|郁闷/, ['angry','cloud']],
  [/喜欢|心动|爱/, ['heart','flower','happy']],
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
  email:'', authStatus:'', status:'', autosaveStatus:'', drag:null, selectedText:null, historyPast:[], historyFuture:[], textEditStart:null, historyBusy:false
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

function renderCalendar(){
  document.getElementById('yearLabel').textContent=state.year;
  document.getElementById('monthLabel').textContent=monthNames[state.month];
  document.getElementById('selectedDate').textContent=currentDateKey();
  const currentEntry=state.monthEntries[currentDateKey()]||state.entry;
  const hasEntry=currentEntry&&(currentEntry.title||currentEntry.content||(currentEntry.stickers||[]).length);
  const previewText=(currentEntry?.title||currentEntry?.content||'').replace(/\s+/g,' ').trim();
  document.getElementById('selectedPreview').textContent=hasEntry?(previewText||'这一天已经留下了一些东西。'):'点击任意日期，写下一点今天的心情，再放几枚贴纸。';
  const grid=document.getElementById('calendarGrid'), firstWeekday=new Date(state.year,state.month,1).getDay(), mondayOffset=(firstWeekday+6)%7, totalDays=new Date(state.year,state.month+1,0).getDate();
  const cells=[];
  for(let i=0;i<mondayOffset;i++)cells.push('<div class="day-card empty" aria-hidden="true"></div>');
  for(let day=1;day<=totalDays;day++){
    const key=dateKey(state.year,state.month,day), entry=state.monthEntries[key], active=day===state.selectedDay, today=isToday(state.year,state.month,day);
    const stickers=(entry?.stickers||[]).slice(0,4).map(p=>{const sticker=STICKERS.find(x=>x.id===p.stickerId);return sticker?svgSticker(sticker,31):'';}).join('');
    const more=(entry?.stickers?.length||0)>4?`<span class="day-more">+${entry.stickers.length-4}</span>`:'';
    const text=(entry?.title||entry?.content||'').replace(/\s+/g,' ').trim();
    cells.push(`<button class="day-card ${active?'active':''} ${today?'today':''}" data-day="${day}" aria-label="${state.year}年${state.month+1}月${day}日">
      <span class="day-number">${String(day).padStart(2,'0')}</span>
      ${today?'<span class="today-mark">TODAY</span>':''}
      <div class="day-preview">
        <div class="day-art">${stickers}${more}</div>
        ${text?`<div class="day-text-preview">${sanitizeText(text.slice(0,46))}${text.length>46?'…':''}</div>`:'<div class="day-text-preview placeholder">留下一点什么</div>'}
      </div>
      ${entry?.content||entry?.title?'<span class="entry-dot"></span>':''}
    </button>`);
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
  const design=normalizeDesign(entry,entry.entry_date); const payload={entry_date:entry.entry_date,title:entry.title||'',content:entry.content||'',background:entry.background||'#fffdf7',design,drafted_at:new Date().toISOString()};
  localStorage.setItem(DRAFT_PREFIX+entry.entry_date,JSON.stringify(payload));
  state.autosaveStatus='草稿已自动保存';
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
  const text=getTextForRecommendations(); if(!text)return [];
  const scores=new Map();
  for(const [pattern,ids] of RECOMMENDATION_RULES){if(pattern.test(text))ids.forEach(id=>scores.set(id,(scores.get(id)||0)+1));}
  return [...scores.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id])=>id);
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
function toggleLibrarySticker(id){if(state.selectedLibrary.has(id))state.selectedLibrary.delete(id);else state.selectedLibrary.add(id);renderStickerPanel();}
function toggleCanvasStickerSelection(id){if(state.selectedCanvas.has(id))state.selectedCanvas.delete(id);else state.selectedCanvas.add(id);state.selectedText=null;renderCanvasSelectionState();}
function clearCanvasSelection(){state.selectedCanvas.clear();state.selectedText=null;renderCanvasSelectionState();}
function bringToFront(id){const max=Math.max(0,...(state.entry.stickers||[]).map(s=>s.z||0));state.entry.stickers=state.entry.stickers.map(s=>s.id===id?{...s,z:max+1}:s);}
function sendToBack(id){const min=Math.min(0,...(state.entry.stickers||[]).map(s=>s.z||0));state.entry.stickers=state.entry.stickers.map(s=>s.id===id?{...s,z:min-1}:s);}
function duplicateSticker(id){ const src=(state.entry.stickers||[]).find(x=>x.id===id); if(!src)return; mutateEntry(()=>state.entry.stickers=[...(state.entry.stickers||[]),{...src,id:uid(src.stickerId),x:clamp(src.x+.08,.08,.92),y:clamp(src.y+.06,.24,.90),z:Date.now()}]); state.selectedCanvas=new Set([state.entry.stickers[state.entry.stickers.length-1].id]); renderDrawer(); }
function removeSticker(id){mutateEntry(()=>{state.entry.stickers=(state.entry.stickers||[]).filter(item=>item.id!==id);state.selectedCanvas.delete(id);});renderDrawer();}
function removeSelectedCanvas(){if(!state.selectedCanvas.size)return;const ids=new Set(state.selectedCanvas);mutateEntry(()=>{state.entry.stickers=(state.entry.stickers||[]).filter(item=>!ids.has(item.id));});state.selectedCanvas.clear();renderDrawer();}
function adjustSelectedScale(delta){updateSelectedSticker(item=>item.scale=clamp((item.scale||1)+delta,.65,1.55));}
function rotateSelected(delta){updateSelectedSticker(item=>item.rotation=clamp((item.rotation||0)+delta,-180,180));}
function layerSelected(dir){ const before=cloneEntry(state.entry); const items=state.entry.stickers||[]; const id=[...state.selectedCanvas][0]; if(!id)return; const sorted=[...items].sort((a,b)=>(a.z||0)-(b.z||0)); const idx=sorted.findIndex(x=>x.id===id); const target=dir==='front'?sorted[sorted.length-1]?.z+1:sorted[0]?.z-1; const item=items.find(x=>x.id===id); if(item)item.z=Number.isFinite(target)?target:1; pushHistory(before);saveDraft(state.entry);renderCanvasOnly();}
function setTextSize(kind,delta){const before=cloneEntry(state.entry);state.entry[`${kind}Style`]=state.entry[`${kind}Style`]||{};state.entry[`${kind}Style`].fontSize=clamp(Number(state.entry[`${kind}Style`].fontSize|| (kind==='title'?25:12))+delta,kind==='title'?18:10,kind==='title'?40:22);pushHistory(before);saveDraft(state.entry);renderCanvasOnly();renderTextTools();}
function toggleTextAlign(kind){const before=cloneEntry(state.entry);state.entry[`${kind}Style`]=state.entry[`${kind}Style`]||{};const v=state.entry[`${kind}Style`].align||'left';state.entry[`${kind}Style`].align=v==='left'?'center':v==='center'?'right':'left';pushHistory(before);saveDraft(state.entry);renderCanvasOnly();renderTextTools();}
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
      const ids=[...state.selectedCanvas], starts=Object.fromEntries(ids.map(i=>{const it=state.entry.stickers.find(x=>x.id===i);return [i,{x:it.x,y:it.y}]}));
      state.drag={kind,id,rect,startX:nx,startY:ny,ids,starts,before:cloneEntry(state.entry)}; bringToFront(id); event.currentTarget.setPointerCapture?.(event.pointerId);
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
  state.recommendedIds=recommendationIds();
  const filtered=filteredStickers();
  const showRec=state.stickerCategory==='recommended';
  const multiCount=state.selectedLibrary.size;
  panel.innerHTML=`
    <div class="sticker-search-row"><div class="search-wrap"><span>⌕</span><input id="stickerSearch" value="${sanitizeText(state.stickerSearch)}" placeholder="搜索贴纸 / 例如：咖啡、旅行、下雨" /></div><button class="ghost-mini ${state.multiSelectMode?'active':''}" id="toggleMulti">${state.multiSelectMode?'取消多选':'多选'}</button></div>
    ${state.recommendedIds.length&&!showRec&&state.stickerSearch===''?`<div class="recommend-strip"><div class="recommend-title"><span>根据这一天的文字推荐</span><button id="showRecommendations">查看全部 ${state.recommendedIds.length}</button></div><div class="recommend-row">${state.recommendedIds.slice(0,6).map(id=>stickerTileHtml(STICKERS.find(s=>s.id===id))).join('')}</div></div>`:''}
    <div class="category-tabs sticker-cats">${STICKER_CATEGORIES.map(c=>`<button class="${state.stickerCategory===c.key?'selected':''}" data-cat="${c.key}">${c.label}</button>`).join('')}</div>
    <div class="sticker-count-row"><span>${showRec?'相关推荐':`${filtered.length} 枚贴纸`}</span><span>${state.multiSelectMode&&multiCount?`已选 ${multiCount} 枚`:''}</span></div>
    <div class="sticker-library">${filtered.length?filtered.map(stickerTileHtml).join(''):`<div class="empty-stickers">没有找到相关贴纸。试试“海边 / 工作 / 开心 / 早餐”。</div>`}</div>
    ${state.multiSelectMode?`<div class="multi-select-bar"><span>选择多枚贴纸后一次加入，系统会自动错开位置。</span><button class="save-button mini" id="addSelected" ${multiCount?'':'disabled'}>加入所选 ${multiCount||''}</button></div>`:''}
  `;
  document.getElementById('stickerSearch')?.addEventListener('input',e=>{state.stickerSearch=e.target.value;renderStickerPanel();const input=document.getElementById('stickerSearch');input?.focus();input?.setSelectionRange(input.value.length,input.value.length);});
  document.getElementById('toggleMulti')?.addEventListener('click',()=>{state.multiSelectMode=!state.multiSelectMode;if(!state.multiSelectMode)state.selectedLibrary.clear();renderStickerPanel();});
  document.getElementById('showRecommendations')?.addEventListener('click',()=>{state.stickerCategory='recommended';renderStickerPanel();});
  document.querySelectorAll('[data-cat]').forEach(btn=>btn.addEventListener('click',()=>{state.stickerCategory=btn.dataset.cat;renderStickerPanel();}));
  document.querySelectorAll('[data-sticker]').forEach(btn=>btn.addEventListener('click',()=>{const sticker=STICKERS.find(x=>x.id===btn.dataset.sticker);if(!sticker)return;state.multiSelectMode?toggleLibrarySticker(sticker.id):addSticker(sticker);}));
  document.getElementById('addSelected')?.addEventListener('click',addSelectedStickers);
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
  titleInput.addEventListener('input',e=>{state.entry.title=e.target.value;saveDraft(state.entry);renderCanvasOnly();renderStickerPanel();});
  contentInput.addEventListener('input',e=>{state.entry.content=e.target.value;saveDraft(state.entry);renderCanvasOnly();renderStickerPanel();});
  titleInput.addEventListener('blur',endTextEdit);contentInput.addEventListener('blur',endTextEdit);
  document.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>mutateEntry(()=>state.entry.background=btn.dataset.color));
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

function openAuth(){
  if(!supabase){toast('当前是本地模式，先配置 Supabase 才能登录。');return;}
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
  if(!supabase)return;
  const {data}=await supabase.auth.getSession();state.user=data.session?.user||null;renderAccount();await refreshAfterAuth();
  supabase.auth.onAuthStateChange(async(_event,session)=>{state.user=session?.user||null;renderAccount();await refreshAfterAuth();if(state.user)closeAuth();});
}
async function refreshAfterAuth(){state.monthEntries={};await loadCurrentMonth();await loadSelectedEntry();}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2300);}

window.addEventListener('pagehide',()=>commitDraftBeforeNavigation());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')commitDraftBeforeNavigation();});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(state.drawerOpen)saveEntry();} if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(state.drawerOpen)(e.shiftKey?redoChange():undoChange());} if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='y'){e.preventDefault();if(state.drawerOpen)redoChange();}});

function injectStyle(){const link=document.createElement('link');link.rel='stylesheet';link.href='./styles.css?v=final';document.head.appendChild(link);}
injectStyle();
renderShell();
state.entry=emptyEntry(currentDateKey());
renderCalendar();
loadCurrentMonth();
loadSelectedEntry();
initAuth();
