# ✍️ NiceWeChatFile

> Markdown → 微信公众号，让写作更高效

一个开源的微信公众号 Markdown 编辑器。写完直接复制粘贴，样式完整保留，省去手动排版的时间。

[![GitHub](https://img.shields.io/badge/GitHub-leolau100%2FWeChatFile-1a1a1a?logo=github)](https://github.com/leolau100/WeChatFile)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)](https://github.com/leolau100/WeChatFile/releases)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Buy me a coffee](https://img.shields.io/badge/buy%20me%20a%20coffee-☕-orange)](https://github.com/sponsors/leolau100)

---

## 功能

- **Markdown 实时预览** — 左侧写，右侧即时渲染，所见即所得
- **64 款主题** — 涵盖简约、科技、商务、节日等风格，一键切换
- **一键复制** — 生成微信兼容的内联样式 HTML，直接粘贴到公众号编辑器
- **顶部 / 底部模版** — 自定义文章头尾的品牌模版，支持 Markdown 和 HTML 混写
- **本地自动保存** — 内容、主题、模版全部存在 localStorage，刷新不丢失
- **Chrome 插件** — 同一份代码可作为浏览器插件运行，在任何页面快速调用

---

## 在线使用

> 部署地址（上线后填写）

或直接 clone 到本地运行，参考下方「本地开发」步骤。

---

## Chrome 插件安装

1. 下载或 clone 本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目根目录
5. 点击浏览器工具栏里的插件图标，即可打开编辑器

---

## 本地开发

**环境要求**：Node.js v18+，npm v8+

```bash
# 克隆仓库
git clone https://github.com/leolau100/WeChatFile.git
cd WeChatFile

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173` 即可。

**构建**

```bash
npm run build
```

产物输出到 `dist/` 目录，可直接部署到任意静态托管服务（Vercel、Netlify、GitHub Pages 等）。

---

## 项目结构

```
NiceWeChatFile/
├── src/
│   ├── views/
│   │   ├── Home.vue          # 首页
│   │   ├── Editor.vue        # 编辑器主页面
│   │   └── About.vue         # 关于页
│   ├── components/
│   │   ├── ThemeSelector.vue # 主题选择抽屉
│   │   └── TemplateModal.vue # 模版管理面板
│   └── router/
│       └── index.js
├── themes/                   # 64 款主题 CSS 文件
├── footer/                   # 底部模版示例
├── manifest.json             # Chrome 插件配置
├── background.js             # 插件 Service Worker
└── vite.config.js
```

---

## 主题一览

共 64 款，部分主题名称：

`aurora` · `autumn` · `blue` · `business` · `candy` · `charcoal` · `cyber` · `dark-pro` · `forest` · `geek-tech` · `github-light` · `gold-luxury` · `ink-wash` · `magazine` · `matrix` · `midnight` · `neon` · `nordic` · `nordic-dark` · `obsidian` · `ocean` · `paper` · `pop-art` · `red-festive` · `retro` · `rose-gold` · `sakura` · `sunset` · `tech-dark` · `tech-purple` · `vapor` · `wabi` · `wechat-classic` · ……

---

## 技术栈

| 用途 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 5 |
| 路由 | Vue Router 4 |
| Markdown 解析 | marked 14 |
| 插件平台 | Chrome Extension Manifest V3 |

---

## 贡献

欢迎 PR 和 Issue。

- 提 Bug：[New Issue](https://github.com/leolau100/WeChatFile/issues/new)
- 新增主题：在 `themes/` 目录下添加 CSS 文件，参考已有主题的选择器命名规范（`.theme-{name}`）
- 功能建议：先开 Issue 讨论，再提 PR

---

## 作者

**DoublePoint** — *Build something we like and want.*

- GitHub：[@leolau100](https://github.com/leolau100)
- 觉得有用的话，欢迎 ⭐ Star 或 [请我喝杯咖啡 ☕](https://github.com/sponsors/leolau100)

---

## License

[MIT](./LICENSE) © 2024 DoublePoint
