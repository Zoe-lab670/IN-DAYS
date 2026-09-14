# 一隅｜IN DAYS — Day Composition V9-acceptance

基于 V8 继续优化。本轮以“最终验收前稳定性”为重点，不改变 Supabase 表结构，也不覆盖现有 config.js。

## V9-acceptance 本轮完成
- 修复本地模式按月读取记录时的时区偏移问题：不再使用 `toISOString().slice(0,10)` 推导本地日期，避免日本/东亚时区在月初出现少一天或前一天记录的问题。
- 加强历史数据兼容：当 `stickers` JSON 是新版对象但 title/content/background 仍保存在表字段时，读取会优先保留已有表字段，避免旧数据字段被空对象覆盖。
- 调整 Supabase `onAuthStateChange`：事件回调不直接等待数据刷新，改为异步调度，降低认证事件与 Supabase 内部锁/事件链互相等待的风险。
- 继续保留 V8 的照片裁切、纸张/胶带/阴影、移动端单日创作、快捷键、时间胶囊、月度回顾与导出能力。

## 本轮检查
- `node --check app.js`：通过。
- 贴纸数量与唯一性：重新检查。
- 关键函数重复定义：重新检查。
- index.html 的 V8 资源引用：保持一致，V9-acceptance 不改变缓存语义。
- ZIP 完整性：重新检查。
- `config.js` 不打包、不覆盖。

## 未完成自动验证
当前容器 Chromium headless 仍不稳定，因此 Supabase Magic Link、中文 IME、真实触控拖拽/缩放/旋转仍需 GitHub Pages 实机验证。

## 升级规则
V9-acceptance 只替换 `index.html`、`styles.css`、`app.js`、`README.md`；保留正式站现有 `config.js`。


验收说明：已通过静态/语法/资源/贴纸库检查。当前容器的 Chromium 被环境策略阻止启动本地页面，因此未将浏览器 E2E 标记为通过。建议上线前以真实 GitHub Pages 环境做一次链路验证。
