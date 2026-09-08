import './globals.css';

export const metadata = {
  title: '一隅｜IN DAYS',
  description: '给每天留一隅。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
