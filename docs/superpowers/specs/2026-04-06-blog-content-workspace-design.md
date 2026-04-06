# 博客内容工作空间需求文档

**日期**: 2026-04-06
**状态**: 设计确认 - 方案 A（srcDir）

## 用户需求

### 核心需求

在当前博客项目的基础上，创建一个独立的工作空间目录，将博客内容与项目其他文件分离，避免根目录下很多其他不需要渲染的 MD 文件也出现在博客上。

### 问题背景

当前项目结构中，博客内容（`coding/`、`essay/`、`archive/`）与项目配置、脚本、API 代码混合在根目录下。这导致：

1. **目录混乱**：根目录包含内容、配置、代码等多种类型文件
2. **内容识别困难**：难以快速区分哪些是博客内容，哪些是项目文件
3. **扩展性受限**：未来添加其他非内容类型文件时容易与内容混淆

### 设计目标

1. ✅ 创建独立的内容工作空间目录
2. ✅ 保持现有 URL 结构不变（SEO 友好）
3. ✅ 最小化对现有工作流的影响
4. ✅ 支持未来的内容扩展

### 技术约束

- 使用 VitePress 2.0.0-alpha.12 作为静态站点生成器
- 使用 Vue 3.5.20
- 使用 UnoCSS 进行样式管理
- 使用 TypeScript
- 使用 pnpm@10.13.1 作为包管理器
- 部署在 Netlify

## 可行方案设计

### 方案选型

采用 **方案 A：srcDir 配置**。

**排除的方案：**
- `contentDirs` 配置 — VitePress 2.0.0-alpha.12 中不存在此配置
- `rewrites` — 实验性功能，且 `createContentLoader` 不受 rewrites 影响，需要额外手动处理
- 符号链接 — Git 支持不佳，跨平台兼容性差

### 核心原理

在 `.vitepress/config.mts` 中设置 `srcDir: 'blog'`。VitePress 行为：

1. **内容扫描**：只扫描 `blog/` 下的 `.md` 文件
2. **URL 生成**：`blog/coding/xxx.md` → `/coding/xxx`（srcDir 以下的内容就是路由根路径，天然保持 URL 不变）
3. **配置目录**：`.vitepress/config.mts` 仍在项目根目录解析，不受 srcDir 影响（已从 VitePress 源码确认）
4. **数据加载器**：`createContentLoader` 的 glob 模式通过 `normalizeGlob(patterns, config.srcDir)` 自动相对于 srcDir 解析

源码依据：
- `.vitepress/` 目录解析：`resolve(root, file) = path.resolve(root, '.vitepress', file)`（chunk-3d7P_gGE.js:18127）
- srcDir 解析：`path.resolve(root, userConfig.srcDir || '.')`（chunk-3d7P_gGE.js:18149）
- 内容扫描：`glob(["**/*.md"], { cwd: siteConfig.srcDir })`（chunk-3d7P_gGE.js:17720）

### 变更清单

#### 1. VitePress 配置（`.vitepress/config.mts`）

添加 `srcDir: 'blog'`。

#### 2. 目录迁移

```
coding/     → blog/coding/
essay/      → blog/essay/
archive/    → blog/archive/
index.md    → blog/index.md
```

#### 3. 数据加载器（无需修改）

以下三个文件经源码分析确认无需修改：

- `.vitepress/theme/components/posts.data.ts` — 使用 `createContentLoader("**/**/*.md")`，glob 自动相对于 srcDir 解析
- `.vitepress/theme/components/archive.data.ts` — 同上
- `.vitepress/theme/components/content.data.ts` — 已使用 `config.srcDir` 构建路径（第 44 行）

#### 4. 需要检查但预计无需修改的内容

- `public/` 目录 — VitePress 静态资源目录，不受 srcDir 影响
- RSS 配置 — 通过 vitepress-plugin-rss，路径通常基于配置自动处理
- Git pre-commit hook — 图片检测脚本
- 图片压缩脚本

#### 5. 需要清理

- `blog/test-content/` — 现有测试文件

### 迁移后的目录结构

```
/Users/zyb/Dev/up-blogs/
├── blog/                      # 博客内容（srcDir）
│   ├── coding/                # 技术文章
│   ├── essay/                 # 随笔
│   ├── archive/               # 归档
│   └── index.md               # 首页
├── .vitepress/                # VitePress 配置（不变）
├── api-worker/                # API 服务（不变）
├── scripts/                   # 工具脚本（不变）
├── public/                    # 静态资源（不变）
├── docs/                      # 文档（不变）
├── data/                      # 数据文件（不变）
└── package.json
```

### 验证标准

1. `pnpm dev` 启动成功，首页正常显示
2. `/coding/`、`/essay/`、`/archive/` 路由正常
3. 各文章页面正常渲染
4. RSS feed 正常生成
5. `pnpm build` 构建成功
6. URL 结构与迁移前完全一致
