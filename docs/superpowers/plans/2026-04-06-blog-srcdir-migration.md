# 博客内容 srcDir 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将博客内容迁移到 `blog/` 子目录，通过 `srcDir` 配置与项目文件分离，保持 URL 结构不变。

**Architecture:** 在 VitePress 配置中添加 `srcDir: 'blog'`，将所有 markdown 内容移入 `blog/` 目录。VitePress 以 `blog/` 为内容根扫描文件并生成路由，URL 天然保持不变。

**Tech Stack:** VitePress 2.0.0-alpha.12, Vue 3, TypeScript

---

## 文件变更清单

| 文件 | 操作 | 职责 |
|------|------|------|
| `.vitepress/config.mts:27` | 修改 | 添加 `srcDir: 'blog'` |
| `coding/` → `blog/coding/` | 移动 | 技术文章内容 |
| `essay/` → `blog/essay/` | 移动 | 随笔内容 |
| `archive/` → `blog/archive/` | 移动 | 归档文章内容 |
| `index.md` → `blog/index.md` | 移动 | 首页 |
| `blog/test-content/` | 删除 | 清理历史测试文件 |

无需修改的文件（已验证）：
- `.vitepress/theme/components/posts.data.ts` — glob 自动适配 srcDir
- `.vitepress/theme/components/archive.data.ts` — glob 自动适配 srcDir
- `.vitepress/theme/components/content.data.ts` — 已使用 `config.srcDir`

---

### Task 1: 清理 blog/ 中的历史测试文件

**Files:**
- Delete: `blog/test-content/`
- Delete: `blog/essay/`（历史残留，与根目录 essay/ 不同）

- [ ] **Step 1: 删除历史测试文件**

```bash
rm -rf blog/test-content blog/essay
```

- [ ] **Step 2: 确认 blog/ 目录已清空**

```bash
ls blog/
```
Expected: 目录为空或不存在

- [ ] **Step 3: 提交**

```bash
git add -A blog/
git commit -m "chore: 清理 blog/ 中的历史测试文件"
```

---

### Task 2: 迁移内容目录到 blog/

**Files:**
- Move: `coding/` → `blog/coding/`
- Move: `essay/` → `blog/essay/`
- Move: `archive/` → `blog/archive/`
- Move: `index.md` → `blog/index.md`

- [ ] **Step 1: 移动内容目录**

```bash
mkdir -p blog
git mv coding blog/coding
git mv essay blog/essay
git mv archive blog/archive
git mv index.md blog/index.md
```

- [ ] **Step 2: 确认迁移结果**

```bash
ls blog/
```
Expected: `coding  essay  archive  index.md`

- [ ] **Step 3: 提交**

```bash
git commit -m "feat: 迁移博客内容到 blog/ 工作空间"
```

---

### Task 3: 添加 srcDir 配置

**Files:**
- Modify: `.vitepress/config.mts:27-29`

- [ ] **Step 1: 在 VitePress 配置中添加 srcDir**

在 `.vitepress/config.mts` 的 `withMermaid({...})` 配置对象中，在 `base: "/"` 之前添加 `srcDir`：

```typescript
export default withMermaid({
  srcDir: "blog",
  base: "/",
  assetsDir: "static",
```

- [ ] **Step 2: 提交**

```bash
git add .vitepress/config.mts
git commit -m "feat: 添加 srcDir 配置指向 blog/ 工作空间"
```

---

### Task 4: 验证开发服务器

- [ ] **Step 1: 启动开发服务器**

```bash
pnpm dev
```

- [ ] **Step 2: 验证首页**

访问 `http://localhost:5173/`
Expected: 首页正常显示文章列表

- [ ] **Step 3: 验证各分类路由**

依次访问：
- `http://localhost:5173/coding/` — 技术文章列表
- `http://localhost:5173/essay/` — 随笔列表
- `http://localhost:5173/archive/` — 归档列表

Expected: 各页面正常渲染

- [ ] **Step 4: 验证文章页面**

随机点击一篇技术文章和一篇随笔，确认内容正常显示。

Expected: 文章内容、样式正常

- [ ] **Step 5: 关闭开发服务器**

Ctrl+C 停止开发服务器

---

### Task 5: 验证生产构建

- [ ] **Step 1: 执行构建**

```bash
pnpm build
```

Expected: 构建成功，无错误

- [ ] **Step 2: 检查构建输出中的路由**

```bash
ls .vitepress/dist/coding/ .vitepress/dist/essay/ .vitepress/dist/archive/
```

Expected: 三个目录下都有对应的 HTML 文件，URL 路径正确（不包含 `/blog/` 前缀）

- [ ] **Step 3: 预览构建结果**

```bash
pnpm preview
```

访问 `http://localhost:4173/` 确认生产构建正常。

Expected: 与开发服务器表现一致

- [ ] **Step 4: 关闭预览服务器**

Ctrl+C

---

### Task 6: 检查 RSS 和搜索功能

- [ ] **Step 1: 检查 RSS feed 生成**

```bash
cat .vitepress/dist/feed.xml | head -20
```

Expected: feed.xml 存在且包含文章条目

- [ ] **Step 2: 验证搜索索引**

```bash
ls .vitepress/dist/assets/*.js | xargs grep -l "mini-search" | head -1
```

Expected: 搜索索引文件存在

---

### Task 7: 最终提交

- [ ] **Step 1: 检查是否还有未提交的变更**

```bash
git status
```

Expected: 无未提交的变更（如有构建产物变更需确认是否已 gitignore）

- [ ] **Step 2: 确认所有提交记录**

```bash
git log --oneline main..HEAD
```

Expected: 看到迁移相关的提交记录
