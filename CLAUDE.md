# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是一个名为"闻 · 斋"的极简个人博客，基于 **VitePress** 构建——一个由 Vue 驱动的静态站点生成器。网站致力于让阅读回归本源，采用简洁朴素的设计理念。

**技术栈：**
- **VitePress 2.0.0-alpha.12** - 静态站点生成器
- **Vue 3.5.20** - 前端框架（使用 Composition API）
- **UnoCSS** - 原子化 CSS 框架（预设：attributify、icons、wind4）
- **TypeScript** - 类型安全
- **pnpm@10.13.1** - 包管理器

## 常用命令

### 博客开发

```bash
# 开发
pnpm dev              # 启动开发服务器（http://localhost:5173）
pnpm build            # 构建静态站点
pnpm preview          # 预览生产构建
```

### 图片处理

```bash
# 使用 Sharp 压缩图片
pnpm compress         # 基础压缩（默认 85% 质量）
pnpm compress:high    # 高质量（95%）
pnpm compress:mid     # 中等质量（85%）
pnpm compress:low     # 低质量（75%）
pnpm compress:webp    # 转换为 WebP（85%）
pnpm compress:webp-high   # WebP 格式 95%
pnpm compress:webp-mid    # WebP 格式 85%（默认）
pnpm compress:webp-low    # WebP 格式 75%
```

### API 开发（Cloudflare Workers）

```bash
cd api-worker         # 进入 API 项目目录

# 开发与部署
pnpm dev              # 启动本地开发服务器（http://localhost:8787）
pnpm deploy           # 部署到 Cloudflare Workers（开发环境）
pnpm deploy:prod      # 部署到 Cloudflare Workers（生产环境）
pnpm tail             # 查看实时日志

# Wrangler CLI
wrangler login        # 登录 Cloudflare 账户
wrangler whoami       # 查看当前登录账户
wrangler secret list  # 列出所有环境变量
```

### Git 工作流

```bash
# Obsidian + Git 工作流
cd ~/Dev/up-blogs     # 进入项目目录

# 提交更改
git add .
git commit -m "更新内容"
git push              # 推送到 GitHub，Netlify 自动部署
```

## 架构

### 主题系统

自定义主题通过 Vue 3 组件扩展 VitePress 默认主题：

**布局结构** (`.vitepress/theme/Layout.vue:1`)：
- `UpNav` - 导航栏
- `UpContent` - 主内容包装器，根据布局条件渲染
- `UpDocList` - 文章列表（在 `list`/`home` 布局页面显示）
- `UpBack` - 返回按钮（在普通页面显示）
- `UpTools` - 悬浮工具面板（主题切换、字体设置、回到顶部、搜索）
- 页脚，使用中国农历显示版权信息

**布局模式：**
- `list`/`home` - 通过 `UpDocList` 组件显示文章列表
- 默认模式 - 显示 `UpBack` 组件用于导航

### 颜色系统

使用 CSS 自定义属性实现亮色/暗色主题切换（定义于 `uno.config.ts:85-106`）：

| Token | 亮色模式 | 暗色模式 | 用途 |
|-------|---------|---------|------|
| `--color-primaryGray` | #F5F5F7 | #121212 | 主页面背景 |
| `--color-accentBlack` | #212121 | #E0E0E0 | 标题、重要文本 |
| `--color-auxGray1` | #E0E0E0 | #424242 | 边框、分隔线、按钮背景 |
| `--color-auxGray2` | #9E9E9E | #9E9E9E | 次要文本、图标 |
| `--color-dynamicGray` | #616161 | #BDBDBD | H3 标题、中等重要性元素 |
| `--color-hoverGray` | #BDBDBD | #616161 | 悬停状态 |
| `--color-white` | #FFFFFF | #1F1F1F | 卡片/内容区块背景 |
| `--color-deepGray` | #424242 | #E0E0E0 | 特殊强调 |

UnoCSS 将这些映射到语义化名称：`primary`、`accent`、`aux1`、`aux2`、`dynamic`、`hover`、`white`、`deep`。

### 内容组织

- `/coding/` - 技术文章
- `/essay/` - 随笔
- `index.md` - 首页

页面通过 frontmatter 的 `layout` 属性控制渲染：
```yaml
---
layout: list  # 或 'home' 显示文章列表，默认为单篇文章
---
```

### 配置文件

- `.vitepress/config.mts` - VitePress 主配置（RSS、Mermaid、搜索）
- `uno.config.ts` - UnoCSS 配置（主题切换、颜色变量、预设）
- `scripts/compress.js` - 图片压缩脚本（使用 Sharp 库）

### 核心功能

- **RSS 订阅** - 通过 `vitepress-plugin-rss` 自动生成（输出 `feed.xml`）
- **Mermaid 图表** - 通过 `vitepress-plugin-mermaid` 支持
- **图片预览** - 通过 `vitepress-plugin-image-viewer` 实现灯箱效果
- **本地搜索** - VitePress 内置搜索
- **Giscus 评论** - 基于 GitHub 的评论系统
- **农历** - 使用 `lunisolar` 库以传统中国格式显示日期（如"甲辰年"）

### API 服务（Cloudflare Workers）

项目包含一个独立的 API 服务，位于 `api-worker/` 目录：

**项目结构：**
```
api-worker/
├── src/
│   └── index.ts         # Worker 主文件
├── wrangler.toml        # Cloudflare 配置
├── package.json
└── tsconfig.json
```

**当前 API 端点：**
- `GET /` - API 服务状态和可用端点列表
- `POST /api/hello` - Hello 接口（测试用）
- `GET /api/time` - 获取服务器时间（含时区信息）

**技术特性：**
- TypeScript + Cloudflare Workers
- 边缘计算，全球低延迟
- 支持 CORS 跨域请求
- 可扩展 D1 数据库、KV 存储

**部署信息：**
- 本地开发：`http://localhost:8787`
- 生产环境：部署后获得 `*.workers.dev` 域名
- 免费额度：每天 100,000 次请求

### 图床服务（PicGo + 腾讯云 COS）

**配置工具：**
- **PicGo** (v2.4.2) - 图片上传工具
- **腾讯云 COS** - 对象存储服务

**Obsidian 集成：**
- 插件：Image auto upload Plugin
- 配置文件：`.obsidian/plugins/obsidian-image-auto-upload-plugin/data.json`
- PicGo 路径：`/Applications/PicGo.app/Contents/MacOS/picgo`

**使用方式：**
1. 在 Obsidian 中粘贴图片（`Cmd + V`）
2. 插件自动调用 PicGo 上传到腾讯云 COS
3. 自动替换为图床 URL

**PicGo 配置：**
- 图床设置：腾讯云 COS
- 存储路径：`img/`
- 自动重命名：开启

### 样式规范

- 使用 **UnoCSS attributify 模式** - 将 `<div class="flex items-center">` 写为 `<div flex items-center>`
- 暗色主题通过根元素的 `.dark` 类应用
- 亮色/暗色模式使用不同的背景纹理
- 所有自定义组件使用 `Up` 前缀（如 `UpNav`、`UpTheme`）

## 开发工作流

### 内容创作（Obsidian）

**推荐工作流：**
1. 使用 Obsidian 打开项目目录：`~/Dev/up-blogs`
2. 在 Obsidian 中编写 Markdown 内容
3. 粘贴图片自动上传到腾讯云 COS
4. Obsidian Git 插件自动提交到 GitHub
5. Netlify 自动构建并部署

**Obsidian 配置：**
- Vault: `~/Dev/up-blogs`
- 实时预览：已启用
- Git 插件：已安装并配置
- 图片自动上传：已配置

### 前端开发

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 修改代码
# - .vitepress/theme/ - 主题组件
# - uno.config.ts - 样式配置
# - coding/ 或 essay/ - 内容

# 3. 实时预览（热重载）
# 访问 http://localhost:5173

# 4. 构建生产版本
pnpm build

# 5. 预览生产构建
pnpm preview
```

### API 开发

```bash
# 1. 进入 API 项目
cd api-worker

# 2. 本地开发
pnpm dev

# 3. 编辑 API 代码
# - src/index.ts - 主要逻辑
# - wrangler.toml - 配置文件

# 4. 测试 API
curl http://localhost:8787/api/time

# 5. 部署到生产
pnpm deploy
```

## 部署

### 前端部署（Netlify）

**连接信息：**
- 仓库：https://github.com/upthen/up-blogs.git
- 分支：`main`
- 构建命令：`pnpm build`
- 发布目录：`.vitepress/dist`

**自动部署：**
- 推送到 `main` 分支触发自动部署
- Pull Request 合并后触发自动部署
- Netlify 提供 HTTPS + CDN

### API 部署（Cloudflare Workers）

**部署命令：**
```bash
cd api-worker
pnpm deploy           # 开发环境
pnpm deploy:prod      # 生产环境
```

**部署后获得的 URL：**
- 格式：`https://api-worker.YOUR_SUBDOMAIN.workers.dev`
- 支持自定义域名绑定

## 图片管理

**工作流程：**

1. **图片存放**
   - 与 Markdown 文件同目录：`essay/my-post/image.jpg`
   - 或使用 `/public/` 目录：`/public/images/image.jpg`

2. **图片压缩（提交前）**
   ```bash
   # 压缩当前目录的所有图片
   pnpm compress:webp-mid

   # 头图使用高质量
   pnpm compress:webp-high path/to/hero.jpg
   ```

3. **使用图床（推荐）**
   - 在 Obsidian 中粘贴图片
   - 自动上传到腾讯云 COS
   - 获得图床 URL：`https://YOUR_BUCKET.cos.ap-guangzhou.myqcloud.com/img/xxx.webp`

**图片规范：**
- 优先使用 WebP 格式
- 头图质量：95%（`compress:webp-high`）
- 内容图片质量：85%（`compress:webp-mid`）
- 建议压缩后单张图片 < 500KB

## 重要规范

### 依赖管理

**始终使用 pnpm 安装依赖：**
```bash
# ✅ 正确
pnpm install
pnpm add -g wrangler

# ❌ 错误（不要使用 npm）
npm install
npm install -g wrangler
```

### 代码规范

**Vue 组件：**
- 使用 `Up` 前缀命名组件（如 `UpNav`、`UpTools`）
- 使用 Composition API (`<script setup>`)
- TypeScript 类型定义优先

**样式：**
- 优先使用 UnoCSS attributify 模式
- 示例：`<div flex items-center gap-2>` 而不是 `<div class="flex items-center gap-2">`

**Markdown 内容：**
- 使用 frontmatter 定义元数据
- 图片路径建议使用相对路径
- 代码块指定语言以启用语法高亮

### Git 提交规范

**提交信息格式：**
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具更新
```

**示例：**
```bash
git commit -m "feat: 添加图片预览功能"
git commit -m "fix: 修复暗色模式下的颜色问题"
git commit -m "docs: 更新 README 文档"
```

## 故障排除

### 常见问题

**VitePress 构建失败：**
```bash
# 清除缓存并重新安装
rm -rf node_modules .vitepress/cache
pnpm install
pnpm build
```

**PicGo 上传失败：**
```bash
# 检查 PicGo 配置
open -a PicGo

# 测试 PicGo CLI
/Applications/PicGo.app/Contents/MacOS/picgo upload /path/to/image.jpg
```

**Wrangler 部署失败：**
```bash
# 重新登录
wrangler logout
wrangler login

# 检查配置
cat api-worker/wrangler.toml
```

### 日志查看

**Cloudflare Workers：**
```bash
cd api-worker
pnpm tail              # 实时查看日志
```

**Netlify 构建：**
- 访问：https://app.netlify.com/sites/YOUR_SITE/deploys
- 查看构建日志和错误信息

## 内容许可

- **代码**：MIT 许可证
- **内容（文字/图片）**：CC BY-NC-SA 4.0
