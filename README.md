# PrismPhys Project Page

基于 `RomanHauksson/academic-project-astro-template` 的静态 Astro 论文主页。内容来自 `../paper/PrismPhys`，视频来自 `../Assets`。原始论文与素材仅以只读方式使用，生成文件全部写入本目录。

## 本地运行

需要 Node.js 24+ 和 npm。

```bash
cd /data3/wyc/PrismPhys/Project_Page
npm ci
npm run dev
```

打开 `http://127.0.0.1:4321`。开发服务默认只监听本机，不暴露到局域网。

## 构建与预览

```bash
npm run build
npm run check:site
npm run preview
```

- `npm run build`：执行 Astro 类型检查并生成 `dist/`。
- `npm run check:site`：检查 6 个视频案例、12 张多尺寸论文图片、资源路径、锚点和重复 HTML ID。
- `npm run preview`：在 `http://127.0.0.1:4321` 预览构建产物。

若开发机不允许 Astro 写用户级配置目录，可使用：

```bash
XDG_CONFIG_HOME=/tmp/prismphys-config ASTRO_TELEMETRY_DISABLED=1 npm run build
```

## 资源生成

`public/` 已包含部署所需资源，正常构建不需要 FFmpeg、Python 或原始素材。只有重新选片或更新论文图片时才需要运行：

```bash
# 需要 ffmpeg 和 Python Pillow
npm run assets
```

也可用环境变量指定工具：`FFMPEG=/path/to/ffmpeg FONT=/path/to/font.ttf npm run assets`。

生成器只读取 `../Assets` 与 `../paper/PrismPhys`，只写入 `public/` 和 `src/data/demos.json`。视频为 1280×632、H.264、faststart；图片为 960/1600/2400px WebP。

## 项目结构

```text
Project_Page/
├── src/
│   ├── paper.mdx                 # 论文正文、结果表格和 BibTeX
│   ├── pages/index.astro         # HTML、SEO、导航和页面入口
│   ├── components/               # 页眉、图片、视频、表格、BibTeX
│   ├── data/demos.json           # 6 个视频案例的展示信息
│   ├── lib/paths.ts              # GitHub Pages 子路径处理
│   └── styles/global.css         # 学术主题、响应式与 reduced-motion
├── public/
│   ├── images/                   # 多尺寸论文图片
│   ├── videos/                   # 6 个对比视频、封面与字幕
│   ├── scripts/                  # 同源外置交互脚本，兼容严格 CSP
│   └── paper/PrismPhys.pdf       # 论文 PDF
├── scripts/
│   ├── prepare_assets.py         # 只读原素材的资源生成器
│   └── check-site.mjs            # 构建产物检查
├── .github/workflows/astro.yml   # GitHub Pages 自动部署
└── astro.config.ts
```

详细验收结果和剩余生产检查见 [QA.md](./QA.md)。

## 部署到 GitHub Pages

- 目标仓库：`https://github.com/yiming676/PrismPhys_Project-Page`
- 部署地址：`https://yiming676.github.io/PrismPhys_Project-Page/`

1. 将 `Project_Page` 的内容作为该仓库根目录推送到 `main` 分支，保留 `.github/workflows/astro.yml`。
2. 在仓库 **Settings → Pages** 中，将 **Source** 设为 **GitHub Actions**。
3. 推送到 `main`，或在 **Actions** 中手动运行 **Deploy Astro site to Pages**。
4. 工作流会用 `configure-pages` 返回的 `origin` 和 `base_path` 构建，因此用户主页和 `<username>.github.io/<repository>/` 子路径都不需要手改资源 URL。

本地视频和图片已包含在仓库中，不依赖外部媒体服务。

## 验收说明

页面使用语义化 HTML、键盘可操作的视频标签、可见焦点、字幕与文字说明。视频默认不自动播放；无 JavaScript 时提供全部视频直链。CSS 动效只用于控件反馈和视频切换，并支持 `prefers-reduced-motion`。

静态安全策略通过 CSP meta 提供。GitHub Pages 的 HSTS、X-Frame-Options 等响应头由托管平台控制，本地扫描无法验证生产响应头。
