# 一隅｜IN DAYS · V18 Final

## 本轮解决的问题
月历缩略图不再重新排版，也不再对文字、贴纸、照片分别缩放。
每个日期卡片直接使用当天 560×420 composition 的同一份 SVG 内容，月历只负责把整张 composition 按比例缩小到卡片尺寸。

### 规则
- 标题、正文、贴纸、照片的位置严格继承一日画布。
- 字号、贴纸 scale、照片比例、旋转严格继承一日画布。
- 月历不会为了“看起来更大”而放大文字或单独调整元素。
- 日期仍是独立的左上角 HTML 层，不参与 composition 缩放，也不显示保护框。
- 已移除旧版 mini-stage / per-element mini scaling 路径。

## 替换
只替换 index.html / styles.css / app.js / README.md。
保留你现有的 config.js，不要覆盖。

## 已检查
- app.js `node --check` 通过
- 107 原始贴纸 + 126 补充贴纸 = 233，ID 唯一
- 无重复函数定义
- 无 `mini-stage` 旧路径
- `miniObjectHtml` 只生成一个 560×420 composition SVG
- index.html 缓存版本统一为 V19
- ZIP 完整性通过


## V19 本轮优化
- 新增统一标题默认位置与字号。
- 第一次在空白标题中输入内容时，自动恢复默认标题位置/字号。
- 画布内联标题编辑同样遵循默认值。
- 已保留用户对已有标题的手动调整，不会在普通续写时强制重置。
