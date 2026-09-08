import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const CONFIG = window.IN_DAYS_CONFIG || {};

// Supabase Project URL must be the project root. Older copies sometimes used
// the REST endpoint (…/rest/v1/), which makes Auth requests fail with
// "Invalid path specified in request URL". Normalize any pasted path away.
function normalizeSupabaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
}

const SUPABASE_URL = normalizeSupabaseUrl(CONFIG.SUPABASE_URL);
const SUPABASE_KEY = String(CONFIG.SUPABASE_PUBLISHABLE_KEY || '').trim();
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const weekdayLabels = ['一','二','三','四','五','六','日'];
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthCN = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const backgroundOptions = ['#fffdf7','#f2f5ec','#fff6e9','#f4f0f7','#eef4f5'];
const STICKER_CATEGORIES = [
  {key:'all',label:'全部'}, {key:'daily',label:'日常'}, {key:'nature',label:'自然'},
  {key:'food',label:'食物'}, {key:'animals',label:'动物'}, {key:'mood',label:'心情'}
];
const STICKERS = [
  {id:'coffee',name:'咖啡',category:'daily',accent:'#cbb995',render:'coffee'},
  {id:'book',name:'书本',category:'daily',accent:'#8d9ca6',render:'book'},
  {id:'camera',name:'相机',category:'daily',accent:'#9b9b98',render:'camera'},
  {id:'music',name:'音乐',category:'daily',accent:'#ae9aac',render:'music'},
  {id:'flower',name:'花',category:'nature',accent:'#cbaaa0',render:'flower'},
  {id:'leaf',name:'叶子',category:'nature',accent:'#8da684',render:'leaf'},
  {id:'sun',name:'太阳',category:'nature',accent:'#d7b86e',render:'sun'},
  {id:'cloud',name:'云',category:'nature',accent:'#b2c0c7',render:'cloud'},
  {id:'pear',name:'梨',category:'food',accent:'#d2ba72',render:'pear'},
  {id:'toast',name:'吐司',category:'food',accent:'#c9926f',render:'toast'},
  {id:'cake',name:'蛋糕',category:'food',accent:'#c7a5b4',render:'cake'},
  {id:'cat',name:'猫',category:'animals',accent:'#9a9690',render:'cat'},
  {id:'bear',name:'熊',category:'animals',accent:'#a88f79',render:'bear'},
  {id:'penguin',name:'企鹅',category:'animals',accent:'#73787d',render:'penguin'},
  {id:'happy',name:'开心',category:'mood',accent:'#d8b971',render:'happy'},
  {id:'sleepy',name:'困',category:'mood',accent:'#9cabb6',render:'sleepy'},
  {id:'heart',name:'喜欢',category:'mood',accent:'#c58d8c',render:'heart'}
];

const app = document.getElementById('app');
let now = new Date();
const initialYear = Math.max(2026, now.getFullYear());
const initialMonth = now.getFullYear() >= 2026 ? now.getMonth() : 0;
const initialDay = now.getFullYear() >= 2026 ? now.getDate() : 1;
let state = {
  year: initialYear, month: initialMonth, selectedDay: initialDay,
  drawerOpen: false, stickerCategory: 'all', monthEntries: {},
  entry: null, user: null, authOpen: false, email: '', authStatus: '', status: '', drag: null
};

function dateKey(year, month, day) { return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
function emptyEntry(date) { return { entry_date: date, title:'', content:'', background:'#fffdf7', stickers:[] }; }
function currentDateKey() { return dateKey(state.year, state.month, state.selectedDay); }
function isToday(year, month, day) { return year === now.getFullYear() && month === now.getMonth() && day === now.getDate(); }
function sanitizeText(value) { return String(value ?? '').replace(/[<>&]/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[ch])); }
function svgSticker(sticker, size=54) {
  const stroke = '#3f3f3b', accent = sticker?.accent || '#b7c9ad';
  const common = `fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  let content = '';
  switch (sticker?.render) {
    case 'coffee': content=`<path ${common} d="M16 27h28v18a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V27Z"/><path ${common} d="M44 31h5a6 6 0 0 1 0 12h-5"/><path ${common} d="M23 18c-2-4 4-5 2-9M33 18c-2-4 4-5 2-9"/><path d="M20 31h20v11H20z" fill="${accent}" opacity=".65"/>`; break;
    case 'book': content=`<path ${common} d="M12 17c10-4 18-2 20 2v34c-2-4-10-6-20-2V17Z"/><path ${common} d="M52 17c-10-4-18-2-20 2v34c2-4 10-6 20-2V17Z"/><path d="M15 22c7-2 12-1 15 1v24c-3-2-8-3-15-1Z" fill="${accent}" opacity=".45"/>`; break;
    case 'camera': content=`<rect ${common} x="12" y="22" width="40" height="28" rx="6"/><path ${common} d="M22 22l4-6h12l4 6"/><circle ${common} cx="32" cy="36" r="9"/><circle cx="32" cy="36" r="5" fill="${accent}" opacity=".6"/>`; break;
    case 'music': content=`<path ${common} d="M22 22v24"/><path ${common} d="M22 22l23-5v24"/><path ${common} d="M22 40c-5-2-10 1-10 6s5 6 10 3c4-3 4-8 0-9Z" fill="${accent}" opacity=".55"/><path ${common} d="M45 36c-5-2-10 1-10 6s5 6 10 3c4-3 4-8 0-9Z" fill="${accent}" opacity=".55"/>`; break;
    case 'flower': content=`<path ${common} d="M32 52V30"/><path ${common} d="M32 40c-8-3-11-8-8-11 4-4 8 0 8 5 0-7 5-11 8-8 3 3 0 8-5 10 8-1 13 3 11 7-2 4-8 3-12-1"/><circle cx="32" cy="27" r="4" fill="${accent}"/>`; break;
    case 'leaf': content=`<path ${common} d="M18 47C27 32 38 24 50 17c-2 15-10 29-27 35-3 1-5-2-5-5Z" fill="${accent}" opacity=".72"/><path ${common} d="M20 48c9-9 17-15 28-23"/>`; break;
    case 'sun': content=`<circle ${common} cx="32" cy="32" r="12" fill="${accent}" opacity=".65"/><path ${common} d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"/>`; break;
    case 'cloud': content=`<path ${common} d="M16 45h32a8 8 0 0 0 1-16c-2-8-14-12-20-3-8-5-17 1-15 9-5 0-6 10 2 10Z" fill="${accent}" opacity=".55"/>`; break;
    case 'pear': content=`<path ${common} d="M34 19c4-7 2-10-1-12M35 18c9 1 13 9 11 18-2 11-9 19-15 19s-13-8-15-19c-2-9 2-18 11-18 3 0 5 2 8 0Z" fill="${accent}" opacity=".66"/><path ${common} d="M35 10c4-3 7-2 10-1"/>`; break;
    case 'toast': content=`<path ${common} d="M19 48V28c0-8 6-13 13-13s13 5 13 13v20c0 3-3 5-6 5H25c-3 0-6-2-6-5Z" fill="${accent}" opacity=".6"/><path ${common} d="M25 28c2-3 12-3 14 0"/>`; break;
    case 'cake': content=`<path ${common} d="M13 29c10-7 28-7 38 0v20H13Z"/><path ${common} d="M13 40c10 7 28 7 38 0"/><path ${common} d="M18 25c4 3 8 3 11 0 4 4 8 4 12 0 2 2 4 3 5 2"/><path ${common} d="M27 21c0-4 5-4 5-8M38 21c0-4 5-4 5-8"/><path d="M17 32h30v7H17z" fill="${accent}" opacity=".55"/>`; break;
    case 'cat': content=`<path ${common} d="M17 26l4-10 10 7 10-7 4 10v15c0 8-6 13-15 13S17 49 17 41V26Z" fill="${accent}" opacity=".32"/><circle cx="26" cy="33" r="2.3" fill="${stroke}"/><circle cx="38" cy="33" r="2.3" fill="${stroke}"/><path ${common} d="M29 40c2 2 4 2 6 0M48 46c5 1 6 6 3 8"/>`; break;
    case 'bear': content=`<circle ${common} cx="23" cy="21" r="6" fill="${accent}" opacity=".45"/><circle ${common} cx="41" cy="21" r="6" fill="${accent}" opacity=".45"/><path ${common} d="M17 31c0-9 30-9 30 0v12c0 9-6 13-15 13s-15-4-15-13V31Z" fill="${accent}" opacity=".42"/><circle cx="26" cy="36" r="2" fill="${stroke}"/><circle cx="38" cy="36" r="2" fill="${stroke}"/><path ${common} d="M29 43c2 2 4 2 6 0"/>`; break;
    case 'penguin': content=`<ellipse ${common} cx="32" cy="36" rx="17" ry="21" fill="${accent}" opacity=".25"/><path ${common} d="M24 18c5-5 11-5 16 0M27 26c2 2 8 2 10 0"/><circle cx="27" cy="29" r="2"/><circle cx="37" cy="29" r="2"/><path d="M30 33h4l-2 3Z" fill="#d7b86e"/>`; break;
    case 'happy': content=`<circle ${common} cx="32" cy="32" r="20" fill="${accent}" opacity=".35"/><circle cx="25" cy="29" r="2" fill="${stroke}"/><circle cx="39" cy="29" r="2" fill="${stroke}"/><path ${common} d="M24 38c5 5 11 5 16 0"/>`; break;
    case 'sleepy': content=`<path ${common} d="M18 29c3-9 11-14 20-12 9 1 15 10 13 19-2 12-13 20-24 16-9-3-14-13-9-23Z" fill="${accent}" opacity=".3"/><path ${common} d="M24 33l5 0M35 33l5 0M30 39c2-2 4-2 6 0"/>`; break;
    case 'heart': content=`<path d="M32 50S13 39 13 26c0-8 10-12 16-5 3-4 13-6 19 1 8 10-4 21-16 28Z" fill="${accent}" opacity=".55"/><path ${common} d="M32 50S13 39 13 26c0-8 10-12 16-5 3-4 13-6 19 1 8 10-4 21-16 28Z"/>`; break;
    default: content=`<circle ${common} cx="32" cy="32" r="20"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${content}</svg>`;
}

function renderShell() {
  app.innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <div class="brand-lockup"><div class="brand-mark" aria-hidden="true"><span></span><i></i></div><div><div class="brand-cn">一隅</div><div class="brand-en">IN DAYS</div></div></div>
        <div class="top-actions"><button class="today-button" id="todayBtn">回到今天</button><span id="accountArea"></span></div>
      </header>
      <section class="hero"><div class="month-nav"><button class="nav-button" id="prevMonth" aria-label="上个月">←</button><div class="month-heading"><p class="eyebrow" id="yearLabel"></p><h1 id="monthLabel"></h1></div><button class="nav-button" id="nextMonth" aria-label="下个月">→</button></div><p class="subtitle">给每天留一隅。</p></section>
      <section class="calendar-card"><div class="weekday-row">${weekdayLabels.map(label=>`<div>${label}</div>`).join('')}</div><div class="calendar-grid" id="calendarGrid"></div></section>
      <section class="selected-summary"><div><p class="section-kicker">TODAY'S CORNER</p><h2 id="selectedDate"></h2><p id="selectedPreview"></p></div><button class="open-editor" id="openEditor">记录这一天 <span>↗</span></button></section>
      <footer>一隅 · IN DAYS</footer>
    </main>
    <div id="drawerRoot"></div><div id="authRoot"></div><div class="toast" id="toast"></div>
  `;
  document.getElementById('prevMonth').addEventListener('click', ()=>moveMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', ()=>moveMonth(1));
  document.getElementById('todayBtn').addEventListener('click', goToday);
  document.getElementById('openEditor').addEventListener('click', ()=>openDrawer());
  renderAccount();
}

function renderAccount() {
  const area = document.getElementById('accountArea');
  if (!supabase) { area.innerHTML = `<span class="local-badge">本地模式</span>`; return; }
  if (state.user) {
    const name = sanitizeText((state.user.email || '我的账号').split('@')[0]);
    area.innerHTML = `<button class="account-button" id="logoutBtn">${name} · 退出</button>`;
    document.getElementById('logoutBtn').addEventListener('click', async ()=>{ await supabase.auth.signOut(); });
  } else {
    area.innerHTML = `<button class="account-button primary-outline" id="loginBtn">登录 / 注册</button>`;
    document.getElementById('loginBtn').addEventListener('click', openAuth);
  }
}

function moveMonth(delta) {
  const current = state.year * 12 + state.month;
  const min = 2026 * 12;
  const next = current + delta;
  if (next < min) return;
  state.year = Math.floor(next / 12); state.month = next % 12;
  state.selectedDay = state.year === initialYear && state.month === initialMonth ? initialDay : 1;
  renderCalendar();
  loadCurrentMonth();
  loadSelectedEntry();
}
function goToday() {
  state.year = initialYear; state.month = initialMonth; state.selectedDay = initialDay; state.drawerOpen = false;
  renderCalendar(); loadCurrentMonth(); loadSelectedEntry(); closeDrawer();
}
function renderCalendar() {
  document.getElementById('yearLabel').textContent = state.year;
  document.getElementById('monthLabel').textContent = monthNames[state.month];
  document.getElementById('selectedDate').textContent = currentDateKey();
  const currentEntry = state.monthEntries[currentDateKey()] || state.entry || null;
  document.getElementById('selectedPreview').textContent = currentEntry && (currentEntry.title || currentEntry.content || (currentEntry.stickers||[]).length)
    ? (currentEntry.title || currentEntry.content || '这一天已经留下了一些东西。')
    : '点击任意日期，写下一点今天的心情，再放一枚贴纸。';
  const grid = document.getElementById('calendarGrid');
  const firstWeekday = new Date(state.year,state.month,1).getDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const totalDays = new Date(state.year,state.month+1,0).getDate();
  const cells = [];
  for (let i=0;i<mondayOffset;i++) cells.push(`<button class="day-card empty" disabled></button>`);
  for (let day=1;day<=totalDays;day++) {
    const key = dateKey(state.year,state.month,day), entry = state.monthEntries[key];
    const active = day === state.selectedDay;
    const today = isToday(state.year,state.month,day);
    const art = (entry?.stickers || []).slice(0,2).map(p=>{
      const sticker=STICKERS.find(s=>s.id===p.stickerId); return sticker ? svgSticker(sticker,40) : '';
    }).join('');
    const fallback = (!art && today) ? `<span class="day-dot"></span>` : '';
    cells.push(`<button class="day-card ${active?'active':''} ${today?'today':''}" data-day="${day}" aria-label="${state.year}年${state.month+1}月${day}日"><span class="day-number">${String(day).padStart(2,'0')}</span>${today?'<span class="today-mark">TODAY</span>':''}<div class="day-art">${art}${fallback}${entry?.content?'<span class="entry-dot"></span>':''}</div></button>`);
  }
  grid.innerHTML = cells.join('');
  grid.querySelectorAll('.day-card[data-day]').forEach(btn=>btn.addEventListener('click',()=>{
    state.selectedDay = Number(btn.dataset.day);
    renderCalendar(); loadSelectedEntry(); openDrawer();
  }));
  document.getElementById('prevMonth').disabled = state.year*12+state.month <= 2026*12;
}

async function loadCurrentMonth() {
  const totalDays = new Date(state.year,state.month+1,0).getDate();
  const start = dateKey(state.year,state.month,1), end = dateKey(state.year,state.month,totalDays);
  state.monthEntries = await loadEntriesInRange(start,end);
  renderCalendar();
}
async function loadSelectedEntry() {
  const key = currentDateKey();
  state.status = '读取中…';
  state.entry = await loadEntry(key) || emptyEntry(key);
  state.status = state.entry.id ? '已保存' : (supabase && !state.user ? '请登录后保存' : '新的一天');
  renderCalendar();
  if (state.drawerOpen) renderDrawer();
}

const LOCAL_PREFIX='in-days:entry:';
function getLocal(key) { const raw=localStorage.getItem(LOCAL_PREFIX+key); return raw?JSON.parse(raw):null; }
function setLocal(entry) { localStorage.setItem(LOCAL_PREFIX+entry.entry_date, JSON.stringify({...entry,updated_at:new Date().toISOString()})); }
async function currentUserId() { if (!supabase) return null; const {data}=await supabase.auth.getUser(); return data?.user?.id || null; }
async function loadEntry(date) {
  if (!supabase) return getLocal(date);
  if (!state.user) return null;
  const {data,error}=await supabase.from('journal_entries').select('id,user_id,entry_date,title,content,background,stickers,updated_at').eq('entry_date',date).eq('user_id',state.user.id).maybeSingle();
  if (error) { console.warn(error); toast(error.message); return null; }
  return data;
}
async function loadEntriesInRange(startDate,endDate) {
  if (supabase) {
    if (!state.user) return {};
    const {data,error}=await supabase.from('journal_entries').select('id,user_id,entry_date,title,content,background,stickers,updated_at').eq('user_id',state.user.id).gte('entry_date',startDate).lte('entry_date',endDate).order('entry_date',{ascending:true});
    if (error) { console.warn(error); toast(error.message); return {}; }
    return Object.fromEntries((data||[]).map(item=>[item.entry_date,item]));
  }
  const result={}; let cursor=new Date(`${startDate}T00:00:00`), end=new Date(`${endDate}T00:00:00`);
  while(cursor<=end){ const k=cursor.toISOString().slice(0,10), item=getLocal(k); if(item)result[k]=item; cursor.setDate(cursor.getDate()+1); }
  return result;
}
async function saveEntry() {
  if (supabase && !state.user) { openAuth(); return; }
  try {
    const entry = {...state.entry, entry_date:currentDateKey(), title:state.entry.title||'', content:state.entry.content||'', background:state.entry.background||'#fffdf7', stickers:state.entry.stickers||[]};
    if (supabase) {
      const userId = await currentUserId(); if(!userId) throw new Error('请先登录后再保存记录。');
      const payload={user_id:userId,entry_date:entry.entry_date,title:entry.title,content:entry.content,background:entry.background,stickers:entry.stickers,updated_at:new Date().toISOString()};
      const {data,error}=await supabase.from('journal_entries').upsert(payload,{onConflict:'user_id,entry_date'}).select('id,user_id,entry_date,title,content,background,stickers,updated_at').single();
      if(error) throw error; state.entry=data;
    } else { setLocal(entry); state.entry={...entry,updated_at:new Date().toISOString()}; }
    state.monthEntries[state.entry.entry_date]=state.entry; state.status='已保存'; renderCalendar(); renderDrawer(); toast('已保存');
  } catch(e) { state.status=e.message||'保存失败'; renderDrawer(); toast(state.status); }
}
async function deleteEntry() {
  const date=currentDateKey();
  try {
    if (supabase) {
      if(!state.user) throw new Error('请先登录。');
      const {error}=await supabase.from('journal_entries').delete().eq('entry_date',date).eq('user_id',state.user.id); if(error)throw error;
    } else localStorage.removeItem(LOCAL_PREFIX+date);
    delete state.monthEntries[date]; state.entry=emptyEntry(date); state.status='已清空'; renderCalendar(); renderDrawer(); toast('已清空');
  } catch(e) { state.status=e.message||'清空失败'; renderDrawer(); toast(state.status); }
}

function openDrawer() { state.drawerOpen=true; renderDrawer(); }
function closeDrawer() { state.drawerOpen=false; document.getElementById('drawerRoot').innerHTML=''; }
function addSticker(sticker) {
  const x=100+Math.round(Math.random()*110), y=105+Math.round(Math.random()*110);
  const placed={id:`${sticker.id}-${Date.now()}-${Math.round(Math.random()*1000)}`,stickerId:sticker.id,x,y,scale:1,rotation:Math.round(Math.random()*12-6)};
  state.entry.stickers=[...(state.entry.stickers||[]),placed]; renderDrawer();
}
function updateSticker(id,patch) { state.entry.stickers=(state.entry.stickers||[]).map(item=>item.id===id?{...item,...patch}:item); renderDrawer(false); }
function removeSticker(id) { state.entry.stickers=(state.entry.stickers||[]).filter(item=>item.id!==id); renderDrawer(); }
function bindStickerDrag(canvas) {
  canvas.querySelectorAll('.placed-sticker').forEach(el=>{
    const id=el.dataset.id;
    el.addEventListener('pointerdown', e=>{
      const item=(state.entry.stickers||[]).find(s=>s.id===id); if(!item)return;
      el.setPointerCapture(e.pointerId); state.drag={id,dx:e.clientX-item.x,dy:e.clientY-item.y};
    });
    el.addEventListener('pointermove', e=>{
      if(!state.drag || state.drag.id!==id) return;
      const rect=canvas.getBoundingClientRect();
      const x=Math.max(38,Math.min(rect.width-38,e.clientX-rect.left-state.drag.dx));
      const y=Math.max(38,Math.min(rect.height-38,e.clientY-rect.top-state.drag.dy));
      updateSticker(id,{x,y});
    });
    el.addEventListener('pointerup',()=>state.drag=null);
    el.addEventListener('dblclick',()=>removeSticker(id));
  });
}
function renderDrawer(bind=true) {
  if(!state.drawerOpen) return closeDrawer();
  const entry=state.entry||emptyEntry(currentDateKey());
  const cats=STICKER_CATEGORIES.map(c=>`<button class="${state.stickerCategory===c.key?'selected':''}" data-cat="${c.key}">${c.label}</button>`).join('');
  const stickers=STICKERS.filter(s=>state.stickerCategory==='all'||s.category===state.stickerCategory).map(s=>`<button class="sticker-tile" data-sticker="${s.id}">${svgSticker(s,46)}<span>${s.name}</span></button>`).join('');
  const canvasStickers=(entry.stickers||[]).map(p=>{const s=STICKERS.find(x=>x.id===p.stickerId);return s?`<div class="placed-sticker" data-id="${p.id}" style="left:${p.x-38}px;top:${p.y-38}px;transform:rotate(${p.rotation||0}deg) scale(${p.scale||1})">${svgSticker(s,64)}</div>`:''}).join('');
  const bg=entry.background||'#fffdf7';
  document.getElementById('drawerRoot').innerHTML=`
    <button class="drawer-backdrop" id="drawerBackdrop" aria-label="关闭编辑器"></button>
    <aside class="editor-drawer">
      <div class="drawer-head"><div><div class="section-kicker">A CORNER FOR</div><h2>${currentDateKey()}</h2></div><button class="close-button" id="closeDrawer">×</button></div>
      <div class="editor-body">
        ${supabase&&!state.user?`<div class="login-hint"><strong>云端记录</strong><span>登录后这一天会同步到你的账号。</span><button id="loginFromEditor">登录</button></div>`:''}
        <label class="field-label">标题<input id="entryTitle" value="${sanitizeText(entry.title)}" maxlength="80" placeholder="给这一天一个名字" /></label>
        <label class="field-label">今天发生了什么？<textarea id="entryContent" rows="4" placeholder="写下一点点就好。">${sanitizeText(entry.content)}</textarea></label>
        <div class="editor-section"><div class="section-title-row"><span>贴纸</span><span>${(entry.stickers||[]).length} 个</span></div><div class="category-tabs">${cats}</div><div class="sticker-library">${stickers}</div></div>
        <div class="editor-section"><div class="section-title-row"><span>背景</span><span>选择当天的颜色</span></div><div class="color-row">${backgroundOptions.map(c=>`<button class="color-choice ${bg===c?'selected':''}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div></div>
        <div class="journal-canvas" id="journalCanvas" style="background:${bg}"><div class="canvas-date">${currentDateKey()}</div><div class="canvas-text">${entry.title?`<div class="canvas-title">${sanitizeText(entry.title)}</div>`:''}${entry.content?`<div class="canvas-content">${sanitizeText(entry.content)}</div>`:`<span>写下一点，再放一枚贴纸。</span>`}</div>${canvasStickers}</div>
        <div class="canvas-hint">拖动贴纸调整位置 · 双击删除</div>
      </div>
      <div class="drawer-footer"><button class="danger-button" id="deleteEntry">清空</button><span class="save-status">${sanitizeText(state.status)}</span><button class="save-button" id="saveEntry">保存</button></div>
    </aside>`;

  document.getElementById('drawerBackdrop').addEventListener('click',closeDrawer);
  document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
  document.getElementById('entryTitle').addEventListener('input',e=>{state.entry.title=e.target.value; renderCanvasOnly();});
  document.getElementById('entryContent').addEventListener('input',e=>{state.entry.content=e.target.value; renderCanvasOnly();});
  document.querySelectorAll('[data-cat]').forEach(btn=>btn.addEventListener('click',()=>{state.stickerCategory=btn.dataset.cat;renderDrawer();}));
  document.querySelectorAll('[data-sticker]').forEach(btn=>btn.addEventListener('click',()=>{const s=STICKERS.find(x=>x.id===btn.dataset.sticker);if(s)addSticker(s);}));
  document.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>{state.entry.background=btn.dataset.color;renderDrawer();}));
  document.getElementById('saveEntry').addEventListener('click',saveEntry);
  document.getElementById('deleteEntry').addEventListener('click',deleteEntry);
  document.getElementById('loginFromEditor')?.addEventListener('click',openAuth);
  if(bind) bindStickerDrag(document.getElementById('journalCanvas'));
}
function renderCanvasOnly(){
  const canvas=document.getElementById('journalCanvas'); if(!canvas) return;
  canvas.style.background=state.entry.background||'#fffdf7';
  const text=canvas.querySelector('.canvas-text');
  text.innerHTML=(state.entry.title?`<div class="canvas-title">${sanitizeText(state.entry.title)}</div>`:'')+(state.entry.content?`<div class="canvas-content">${sanitizeText(state.entry.content)}</div>`:`<span>写下一点，再放一枚贴纸。</span>`);
}

function openAuth() {
  if(!supabase) { toast('当前是本地模式，先配置 Supabase 才能登录。'); return; }
  state.authOpen=true; state.authStatus='';
  document.getElementById('authRoot').innerHTML=`<button class="auth-backdrop" id="authBackdrop" aria-label="关闭登录"></button><section class="auth-modal"><button class="close-button" id="closeAuth">×</button><div class="section-kicker">IN DAYS ACCOUNT</div><h2>把你的一隅<br/>留在云端</h2><p>输入邮箱，我们会发送一封一次性登录链接。无需设置密码。</p><input class="auth-input" id="authEmail" type="email" autocomplete="email" placeholder="name@example.com" value="${sanitizeText(state.email)}"/><button class="save-button full" id="sendMagic">发送登录链接</button><div class="auth-status" id="authStatus"></div></section>`;
  document.getElementById('authBackdrop').addEventListener('click',closeAuth); document.getElementById('closeAuth').addEventListener('click',closeAuth);
  document.getElementById('sendMagic').addEventListener('click',sendMagicLink);
}
function closeAuth(){state.authOpen=false;document.getElementById('authRoot').innerHTML='';}
async function sendMagicLink(){
  const email=document.getElementById('authEmail').value.trim(); if(!email)return;
  state.email=email; state.authStatus='发送中…'; document.getElementById('authStatus').textContent=state.authStatus;
  // Always redirect back to the GitHub Pages app root, matching the
  // URL configured in Supabase Authentication → URL Configuration.
  const path = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
  const redirectTo = `${window.location.origin}${path}`;
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});
  state.authStatus = error
    ? (/Invalid path specified in request URL/i.test(error.message)
      ? 'Supabase 连接地址仍有问题：请确保 Project URL 是 https://你的项目ID.supabase.co（不要带 /rest/v1/）。'
      : error.message)
    : '登录链接已发送到邮箱，请打开邮件完成登录。';
  document.getElementById('authStatus').textContent=state.authStatus;
}
function toast(message){ const el=document.getElementById('toast'); if(!el)return; el.textContent=message; el.classList.add('show'); clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2200); }

async function initAuth(){
  if(!supabase) return;
  const {data}=await supabase.auth.getSession(); state.user=data.session?.user||null; renderAccount(); await refreshAfterAuth();
  supabase.auth.onAuthStateChange(async (_event,session)=>{ state.user=session?.user||null; renderAccount(); await refreshAfterAuth(); if(state.user)closeAuth(); });
}
async function refreshAfterAuth(){ state.monthEntries={}; await loadCurrentMonth(); await loadSelectedEntry(); }

function injectStyle(){ const link=document.createElement('link'); link.rel='stylesheet'; link.href='./styles.css'; document.head.appendChild(link); }

injectStyle();
renderShell();
state.entry=emptyEntry(currentDateKey());
renderCalendar();
loadCurrentMonth();
loadSelectedEntry();
initAuth();
