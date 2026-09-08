'use client';

import { useEffect, useMemo, useState } from 'react';
import { STICKER_CATEGORIES, STICKERS, StickerGraphic } from '../lib/stickers';
import { deleteEntry, loadEntriesInRange, loadEntry, saveEntry } from '../lib/storage';
import { supabase } from '../lib/supabase';

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const backgroundOptions = ['#fffdf7', '#f2f5ec', '#fff6e9', '#f4f0f7', '#eef4f5'];

const emptyEntry = (date) => ({ entry_date: date, title: '', content: '', background: '#fffdf7', stickers: [] });
function dateKey(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

export default function HomePage() {
  const today = useMemo(() => new Date(), []);
  const initialYear = Math.max(2026, today.getFullYear());
  const initialMonth = today.getFullYear() >= 2026 ? today.getMonth() : 0;
  const initialDay = today.getFullYear() >= 2026 ? today.getDate() : 1;
  const [view, setView] = useState({ year: initialYear, month: initialMonth });
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [entry, setEntry] = useState(emptyEntry(dateKey(initialYear, initialMonth, initialDay)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stickerCategory, setStickerCategory] = useState('all');
  const [status, setStatus] = useState('');
  const [dragState, setDragState] = useState(null);
  const [monthEntries, setMonthEntries] = useState({});
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [authStatus, setAuthStatus] = useState('');

  const { year, month } = view;
  const firstWeekday = new Date(year, month, 1).getDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentViewKey = year * 12 + month;
  const minViewKey = 2026 * 12;
  const days = useMemo(() => Array.from({ length: mondayOffset + totalDays }, (_, i) => i < mondayOffset ? null : i - mondayOffset + 1), [mondayOffset, totalDays]);
  const selectedDate = dateKey(year, month, selectedDay);
  const visibleStickers = useMemo(() => stickerCategory === 'all' ? STICKERS : STICKERS.filter((item) => item.category === stickerCategory), [stickerCategory]);
  const entryHasContent = Boolean(entry.title || entry.content || entry.stickers?.length);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setEntry(emptyEntry(selectedDate));
    });
    return () => listener.subscription.unsubscribe();
  }, [selectedDate]);

  useEffect(() => {
    let ignore = false;
    async function fetchMonthEntries() {
      const result = await loadEntriesInRange(dateKey(year, month, 1), dateKey(year, month, totalDays));
      if (!ignore) setMonthEntries(result);
    }
    async function fetchEntry() {
      setStatus('读取中…');
      const result = await loadEntry(selectedDate);
      if (!ignore) { setEntry(result || emptyEntry(selectedDate)); setStatus(result ? '已保存' : (supabase && !user ? '请登录后保存' : '新的一天')); }
    }
    fetchMonthEntries();
    fetchEntry();
    return () => { ignore = true; };
  }, [selectedDate, year, month, totalDays, user]);

  function openDay(day) { setSelectedDay(day); setDrawerOpen(true); }
  function moveMonth(delta) {
    const nextKey = currentViewKey + delta;
    if (nextKey < minViewKey) return;
    const nextYear = Math.floor(nextKey / 12);
    const nextMonth = nextKey % 12;
    setView({ year: nextYear, month: nextMonth });
    setSelectedDay(nextYear === today.getFullYear() && nextMonth === today.getMonth() ? today.getDate() : 1);
  }
  function goToToday() { setView({ year: initialYear, month: initialMonth }); setSelectedDay(initialDay); setDrawerOpen(false); }
  function addSticker(sticker) {
    const next = { id: `${sticker.id}-${Date.now()}`, stickerId: sticker.id, x: 120 + Math.round(Math.random() * 80), y: 120 + Math.round(Math.random() * 80), scale: 1, rotation: Math.round((Math.random() * 12) - 6) };
    setEntry((current) => ({ ...current, stickers: [...(current.stickers || []), next] }));
  }
  function updateSticker(id, patch) { setEntry((current) => ({ ...current, stickers: (current.stickers || []).map((item) => item.id === id ? { ...item, ...patch } : item) })); }
  function removeSticker(id) { setEntry((current) => ({ ...current, stickers: (current.stickers || []).filter((item) => item.id !== id) })); }
  function handlePointerDown(event, sticker) { event.currentTarget.setPointerCapture(event.pointerId); setDragState({ id: sticker.id, offsetX: event.clientX - sticker.x, offsetY: event.clientY - sticker.y }); }
  function handlePointerMove(event) {
    if (!dragState) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(event.clientX - bounds.left - dragState.offsetX, 42, bounds.width - 42);
    const y = clamp(event.clientY - bounds.top - dragState.offsetY, 42, bounds.height - 42);
    updateSticker(dragState.id, { x, y });
  }
  function handlePointerUp() { setDragState(null); }
  async function handleSave() {
    if (supabase && !user) { setAuthOpen(true); return; }
    try { setStatus('保存中…'); const saved = await saveEntry({ ...entry, entry_date: selectedDate }); setEntry(saved); setMonthEntries((current) => ({ ...current, [selectedDate]: saved })); setStatus('已保存'); }
    catch (error) { setStatus(error.message || '保存失败'); }
  }
  async function handleDelete() {
    try { await deleteEntry(selectedDate); const cleared = emptyEntry(selectedDate); setEntry(cleared); setMonthEntries((current) => { const next = { ...current }; delete next[selectedDate]; return next; }); setStatus('已清空'); }
    catch (error) { setStatus(error.message || '清空失败'); }
  }
  async function handleMagicLink() {
    if (!supabase || !email.trim()) return;
    setAuthStatus('发送中…');
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } });
    setAuthStatus(error ? error.message : '登录链接已发送到邮箱。');
  }
  async function logout() { await supabase?.auth.signOut(); setAuthOpen(false); }

  const monthCells = days.map((day, index) => {
    const active = day === selectedDay;
    const isToday = day === today.getDate() && year === today.getFullYear() && month === today.getMonth();
    return <button key={`${year}-${month}-${index}`} className={`day-card ${day ? '' : 'empty'} ${active ? 'active' : ''} ${isToday ? 'today' : ''}`} disabled={!day} onClick={() => day && openDay(day)} aria-label={day ? `${year}年${month + 1}月${day}日` : undefined}>
      {day && <><span className="day-number">{String(day).padStart(2, '0')}</span>{isToday && <span className="today-mark">TODAY</span>}<div className="day-art">{(monthEntries[dateKey(year, month, day)]?.stickers || []).slice(0, 2).map((placed) => { const sticker = STICKERS.find((item) => item.id === placed.stickerId); return sticker ? <StickerGraphic key={placed.id} sticker={sticker} size={40} /> : null; })}{monthEntries[dateKey(year, month, day)]?.content && <span className="entry-dot" />}{!monthEntries[dateKey(year, month, day)] && isToday ? <span className="day-dot" /> : null}</div></>}
    </button>;
  });

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><span /><i /></div><div><div className="brand-cn">一隅</div><div className="brand-en">IN DAYS</div></div></div>
      <div className="top-actions"><button className="today-button" onClick={goToToday}>回到今天</button>{supabase ? (user ? <button className="account-button" onClick={logout}>{user.email?.split('@')[0] || '我的账号'} · 退出</button> : <button className="account-button primary-outline" onClick={() => setAuthOpen(true)}>登录 / 注册</button>) : <span className="local-badge">本地模式</span>}</div>
    </header>

    <section className="hero"><div className="month-nav"><button className="nav-button" onClick={() => moveMonth(-1)} disabled={currentViewKey <= minViewKey} aria-label="上个月">←</button><div className="month-heading"><p className="eyebrow">{year}</p><h1>{monthNames[month]}</h1></div><button className="nav-button" onClick={() => moveMonth(1)} aria-label="下个月">→</button></div><p className="subtitle">给每天留一隅。</p></section>
    <section className="calendar-card"><div className="weekday-row">{weekdayLabels.map((label) => <div key={label}>{label}</div>)}</div><div className="calendar-grid">{monthCells}</div></section>
    <section className="selected-summary"><div><p className="section-kicker">TODAY'S CORNER</p><h2>{selectedDate}</h2><p>{entryHasContent ? (entry.title || entry.content || '这一天已经留下了一些东西。') : '点击任意日期，写下一点今天的心情，再放一枚贴纸。'}</p></div><button className="open-editor" onClick={() => setDrawerOpen(true)}>{entryHasContent ? '继续编辑' : '记录这一天'} <span>↗</span></button></section>

    {drawerOpen && <><button className="drawer-backdrop" aria-label="关闭编辑器" onClick={() => setDrawerOpen(false)} /><aside className="editor-drawer"><div className="drawer-head"><div><div className="section-kicker">A CORNER FOR</div><h2>{selectedDate}</h2></div><button className="close-button" onClick={() => setDrawerOpen(false)}>×</button></div><div className="editor-body">
      {supabase && !user && <div className="login-hint"><strong>登录后保存到云端</strong><span>现在可以试着编辑，但保存前需要登录。</span><button onClick={() => setAuthOpen(true)}>登录 / 注册</button></div>}
      <label className="field-label">标题<input value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} placeholder="今天值得记住什么？" /></label>
      <label className="field-label">记录<textarea value={entry.content} onChange={(e) => setEntry({ ...entry, content: e.target.value })} placeholder="写下一点点，不需要很多。" rows={5} /></label>
      <div className="editor-section"><div className="section-title-row"><span>贴纸</span><span>{entry.stickers?.length || 0}</span></div><div className="category-tabs">{STICKER_CATEGORIES.map((cat) => <button key={cat.key} className={stickerCategory === cat.key ? 'selected' : ''} onClick={() => setStickerCategory(cat.key)}>{cat.label}</button>)}</div><div className="sticker-library">{visibleStickers.map((sticker) => <button key={sticker.id} className="sticker-tile" title={`添加${sticker.name}`} onClick={() => addSticker(sticker)}><StickerGraphic sticker={sticker} size={50} /><span>{sticker.name}</span></button>)}</div></div>
      <div className="editor-section"><div className="section-title-row"><span>背景</span></div><div className="color-row">{backgroundOptions.map((color) => <button key={color} aria-label={`背景 ${color}`} className={`color-choice ${entry.background === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => setEntry({ ...entry, background: color })} />)}</div></div>
      <div className="journal-canvas" style={{ background: entry.background }} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}><div className="canvas-date">{monthNames[month].slice(0, 3)} {selectedDay}</div><div className="canvas-text">{entry.title && <div className="canvas-title">{entry.title}</div>}{entry.content && <div className="canvas-content">{entry.content}</div>}{!entry.title && !entry.content && <span>把一点今天，留在这里。</span>}</div>{(entry.stickers || []).map((placed) => { const sticker = STICKERS.find((item) => item.id === placed.stickerId); if (!sticker) return null; return <div key={placed.id} className="placed-sticker" style={{ left: placed.x, top: placed.y, transform: `translate(-50%, -50%) rotate(${placed.rotation}deg) scale(${placed.scale})` }} onPointerDown={(event) => handlePointerDown(event, placed)} onDoubleClick={() => removeSticker(placed.id)} title="拖动贴纸；双击删除"><StickerGraphic sticker={sticker} size={62} /></div>; })}</div><p className="canvas-hint">贴纸可拖动；双击贴纸删除。</p>
    </div><div className="drawer-footer"><button className="danger-button" onClick={handleDelete}>清空</button><span className="save-status">{status}</span><button className="save-button" onClick={handleSave}>保存这一天</button></div></aside></>}

    {authOpen && <><button className="drawer-backdrop auth-backdrop" aria-label="关闭登录" onClick={() => setAuthOpen(false)} /><section className="auth-modal"><button className="close-button" onClick={() => setAuthOpen(false)}>×</button><div className="section-kicker">WELCOME TO IN DAYS</div><h2>把每天，放进自己的云端一隅。</h2><p>输入邮箱，我们会发送一封一次性登录链接。无需记密码。</p><input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /><button className="save-button full" onClick={handleMagicLink} disabled={!email.trim()}>发送登录链接</button>{authStatus && <div className="auth-status">{authStatus}</div>}</section></>}

    <footer>IN DAYS · 从 2026 开始，一直记录下去。</footer>
  </main>;
}
