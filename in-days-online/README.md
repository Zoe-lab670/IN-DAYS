# 一隅｜IN DAYS · Online Starter

这是 IN DAYS 的在线产品骨架：长期日历 + 日期记录 + 极简贴纸 + Supabase 登录与云端数据隔离。

## 1. 本地开发

需要 Node.js 20+。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

没有 Supabase 环境变量时，页面自动以本地模式运行（localStorage），方便先看 UI。

## 2. 创建 Supabase

在 Supabase 创建项目，然后打开 SQL Editor，运行：

```text
supabase-schema.sql
```

这会创建 `journal_entries`，每条记录绑定 `auth.users.id`，并启用 RLS，只允许登录用户读取/新增/修改/删除自己的记录。

## 3. 开启邮箱 Magic Link

Supabase Dashboard → Authentication → Providers → Email，确认 Email provider 开启。

然后在 Authentication → URL Configuration 中设置：

- Site URL：本地开发填 `http://localhost:3000`；部署后改成你的 Vercel 域名
- Redirect URLs：加入 `http://localhost:3000` 和你的线上域名

## 4. 环境变量

创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase Publishable/Anon Key
```

## 5. 部署到 Vercel

最推荐：把这个项目上传到 GitHub，然后在 Vercel → Add New Project → Import Git Repository。

在 Vercel 的 Project Settings → Environment Variables 添加同样的两个变量，然后 Redeploy。

部署完成后把线上地址加入 Supabase Authentication → URL Configuration：

```text
https://你的项目.vercel.app
```

## 6. 当前在线骨架

- 从 2026 年起可无限向未来翻月
- 回到今天
- 登录 / 注册（邮箱 Magic Link）
- 用户数据隔离
- 日期记录：标题 + 正文
- 极简 SVG 贴纸库
- 贴纸拖拽、双击删除
- 背景颜色
- Supabase 云端保存
- 未配置 Supabase 时自动本地模式

## 7. 下一阶段

建议继续做：

1. 贴纸缩放 / 旋转 / 层级
2. 图片上传
3. 月度回顾页
4. 公开分享卡片
5. 移动端 PWA
6. 自定义域名
7. AI 推荐贴纸 / AI 月度总结
