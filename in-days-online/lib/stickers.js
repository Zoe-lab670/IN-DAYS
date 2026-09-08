export const STICKER_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'daily', label: '日常' },
  { key: 'nature', label: '自然' },
  { key: 'food', label: '食物' },
  { key: 'animals', label: '动物' },
  { key: 'mood', label: '心情' },
];

export const STICKERS = [
  { id: 'coffee', name: '咖啡', category: 'daily', accent: '#cbb995', render: 'coffee' },
  { id: 'book', name: '书本', category: 'daily', accent: '#8d9ca6', render: 'book' },
  { id: 'camera', name: '相机', category: 'daily', accent: '#9b9b98', render: 'camera' },
  { id: 'music', name: '音乐', category: 'daily', accent: '#ae9aac', render: 'music' },
  { id: 'flower', name: '花', category: 'nature', accent: '#cbaaa0', render: 'flower' },
  { id: 'leaf', name: '叶子', category: 'nature', accent: '#8da684', render: 'leaf' },
  { id: 'sun', name: '太阳', category: 'nature', accent: '#d7b86e', render: 'sun' },
  { id: 'cloud', name: '云', category: 'nature', accent: '#b2c0c7', render: 'cloud' },
  { id: 'pear', name: '梨', category: 'food', accent: '#d2ba72', render: 'pear' },
  { id: 'toast', name: '吐司', category: 'food', accent: '#c9926f', render: 'toast' },
  { id: 'cake', name: '蛋糕', category: 'food', accent: '#c7a5b4', render: 'cake' },
  { id: 'cat', name: '猫', category: 'animals', accent: '#9a9690', render: 'cat' },
  { id: 'bear', name: '熊', category: 'animals', accent: '#a88f79', render: 'bear' },
  { id: 'penguin', name: '企鹅', category: 'animals', accent: '#73787d', render: 'penguin' },
  { id: 'happy', name: '开心', category: 'mood', accent: '#d8b971', render: 'happy' },
  { id: 'sleepy', name: '困', category: 'mood', accent: '#9cabb6', render: 'sleepy' },
  { id: 'heart', name: '喜欢', category: 'mood', accent: '#c58d8c', render: 'heart' },
];

export function StickerGraphic({ sticker, size = 54 }) {
  const stroke = '#3f3f3b';
  const accent = sticker?.accent ?? '#b7c9ad';
  const common = { fill: 'none', stroke, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const s = sticker?.render;
  const props = { width: size, height: size, viewBox: '0 0 64 64', 'aria-hidden': true };

  const svg = {
    coffee: <><path {...common} d="M16 27h28v18a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V27Z"/><path {...common} d="M44 31h5a6 6 0 0 1 0 12h-5"/><path {...common} d="M23 18c-2-4 4-5 2-9M33 18c-2-4 4-5 2-9"/><path d="M20 31h20v11H20z" fill={accent} opacity=".65"/></>,
    book: <><path {...common} d="M12 17c10-4 18-2 20 2v34c-2-4-10-6-20-2V17Z"/><path {...common} d="M52 17c-10-4-18-2-20 2v34c2-4 10-6 20-2V17Z"/><path d="M15 22c7-2 12-1 15 1v24c-3-2-8-3-15-1Z" fill={accent} opacity=".45"/></>,
    camera: <><rect {...common} x="12" y="22" width="40" height="28" rx="6"/><path {...common} d="M22 22l4-6h12l4 6"/><circle {...common} cx="32" cy="36" r="9"/><circle cx="32" cy="36" r="5" fill={accent} opacity=".6"/></>,
    music: <><path {...common} d="M22 22v24"/><path {...common} d="M22 22l23-5v24"/><path {...common} d="M22 40c-5-2-10 1-10 6s5 6 10 3c4-3 4-8 0-9Z" fill={accent} opacity=".55"/><path {...common} d="M45 36c-5-2-10 1-10 6s5 6 10 3c4-3 4-8 0-9Z" fill={accent} opacity=".55"/></>,
    flower: <><path {...common} d="M32 52V30"/><path {...common} d="M32 40c-8-3-11-8-8-11 4-4 8 0 8 5 0-7 5-11 8-8 3 3 0 8-5 10 8-1 13 3 11 7-2 4-8 3-12-1"/><circle cx="32" cy="27" r="4" fill={accent}/></>,
    leaf: <><path {...common} d="M18 47C27 32 38 24 50 17c-2 15-10 29-27 35-3 1-5-2-5-5Z" fill={accent} opacity=".72"/><path {...common} d="M20 48c9-9 17-15 28-23"/></>,
    sun: <><circle {...common} cx="32" cy="32" r="12" fill={accent} opacity=".65"/><path {...common} d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"/></>,
    cloud: <><path {...common} d="M16 45h32a8 8 0 0 0 1-16c-2-8-14-12-20-3-8-5-17 1-15 9-5 0-6 10 2 10Z" fill={accent} opacity=".55"/></>,
    pear: <><path {...common} d="M34 19c4-7 2-10-1-12M35 18c9 1 13 9 11 18-2 11-9 19-15 19s-13-8-15-19c-2-9 2-18 11-18 3 0 5 2 8 0Z" fill={accent} opacity=".66"/><path {...common} d="M35 10c4-3 7-2 10-1"/></>,
    toast: <><path {...common} d="M19 48V28c0-8 6-13 13-13s13 5 13 13v20c0 3-3 5-6 5H25c-3 0-6-2-6-5Z" fill={accent} opacity=".6"/><path {...common} d="M25 28c2-3 12-3 14 0"/></>,
    cake: <><path {...common} d="M13 29c10-7 28-7 38 0v20H13Z"/><path {...common} d="M13 40c10 7 28 7 38 0"/><path {...common} d="M18 25c4 3 8 3 11 0 4 4 8 4 12 0 2 2 4 3 5 2"/><path {...common} d="M27 21c0-4 5-4 5-8M38 21c0-4 5-4 5-8"/><path d="M17 32h30v7H17z" fill={accent} opacity=".55"/></>,
    cat: <><path {...common} d="M17 26l4-10 10 7 10-7 4 10v15c0 8-6 13-15 13S17 49 17 41V26Z" fill={accent} opacity=".32"/><circle cx="26" cy="33" r="2.3" fill={stroke}/><circle cx="38" cy="33" r="2.3" fill={stroke}/><path {...common} d="M29 40c2 2 4 2 6 0M48 46c5 1 6 6 3 8"/></>,
    bear: <><circle {...common} cx="23" cy="21" r="6" fill={accent} opacity=".45"/><circle {...common} cx="41" cy="21" r="6" fill={accent} opacity=".45"/><path {...common} d="M17 31c0-9 30-9 30 0v12c0 9-6 13-15 13s-15-4-15-13V31Z" fill={accent} opacity=".42"/><circle cx="26" cy="36" r="2" fill={stroke}/><circle cx="38" cy="36" r="2" fill={stroke}/><path {...common} d="M29 43c2 2 4 2 6 0"/></>,
    penguin: <><ellipse {...common} cx="32" cy="36" rx="17" ry="21" fill={accent} opacity=".25"/><path {...common} d="M24 18c5-5 11-5 16 0M27 26c2 2 8 2 10 0"/><circle cx="27" cy="29" r="2"/><circle cx="37" cy="29" r="2"/><path d="M30 33h4l-2 3Z" fill="#d7b86e"/></>,
    happy: <><circle {...common} cx="32" cy="32" r="20" fill={accent} opacity=".35"/><circle cx="25" cy="29" r="2" fill={stroke}/><circle cx="39" cy="29" r="2" fill={stroke}/><path {...common} d="M24 38c5 5 11 5 16 0"/></>,
    sleepy: <><path {...common} d="M18 29c3-9 11-14 20-12 9 1 15 10 13 19-2 12-13 20-24 16-9-3-14-13-9-23Z" fill={accent} opacity=".3"/><path {...common} d="M24 33l5 0M35 33l5 0M30 39c2-2 4-2 6 0"/></>,
    heart: <><path d="M32 50S13 39 13 26c0-8 10-12 16-5 3-4 13-6 19 1 8 10-4 21-16 28Z" fill={accent} opacity=".55"/><path {...common} d="M32 50S13 39 13 26c0-8 10-12 16-5 3-4 13-6 19 1 8 10-4 21-16 28Z"/></>,
  }[s];

  return <svg {...props}>{svg}</svg>;
}
