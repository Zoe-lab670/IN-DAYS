import { supabase } from './supabase';

const LOCAL_PREFIX = 'in-days:entry:';

function storageKey(date) {
  return `${LOCAL_PREFIX}${date}`;
}

function isLoggedIn() {
  return Boolean(supabase?.auth);
}

async function getUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

export async function loadEntry(date) {
  if (supabase) {
    const userId = await getUserId();
    if (!userId) return null;
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, user_id, entry_date, title, content, background, stickers, updated_at')
      .eq('entry_date', date)
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data) return data;
    if (error) console.warn('Supabase load failed.', error.message);
    return null;
  }

  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(storageKey(date));
  return raw ? JSON.parse(raw) : null;
}

export async function saveEntry(entry) {
  if (supabase) {
    const userId = await getUserId();
    if (!userId) throw new Error('请先登录后再保存记录。');
    const payload = {
      user_id: userId,
      entry_date: entry.entry_date,
      title: entry.title || '',
      content: entry.content || '',
      background: entry.background || '#fffdf7',
      stickers: entry.stickers || [],
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(payload, { onConflict: 'user_id,entry_date' })
      .select('id, user_id, entry_date, title, content, background, stickers, updated_at')
      .single();
    if (!error) return data;
    throw error;
  }

  if (typeof window !== 'undefined') {
    const saved = { ...entry, updated_at: new Date().toISOString() };
    localStorage.setItem(storageKey(entry.entry_date), JSON.stringify(saved));
    return saved;
  }
  return entry;
}

export async function deleteEntry(date) {
  if (supabase) {
    const userId = await getUserId();
    if (!userId) throw new Error('请先登录。');
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('entry_date', date)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }
  if (typeof window !== 'undefined') localStorage.removeItem(storageKey(date));
}

export async function loadEntriesInRange(startDate, endDate) {
  if (supabase) {
    const userId = await getUserId();
    if (!userId) return {};
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, user_id, entry_date, title, content, background, stickers, updated_at')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true });
    if (!error && data) return Object.fromEntries(data.map((item) => [item.entry_date, item]));
    if (error) console.warn('Supabase month load failed.', error.message);
    return {};
  }

  if (typeof window === 'undefined') return {};
  const result = {};
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const raw = localStorage.getItem(storageKey(key));
    if (raw) result[key] = JSON.parse(raw);
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export { isLoggedIn };
