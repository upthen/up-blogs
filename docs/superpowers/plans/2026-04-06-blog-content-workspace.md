# 博客内容工作空间实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将博客内容从项目根目录迁移到独立的 `blog/` 工作空间目录，使用 VitePress 的 `contentDirs` 配置实现 URL 结构不变。

**Architecture:**
1. 创建 `blog/` 目录作为内容工作空间
2. 将 `coding/`、`essay/`、`archive/` 和 `index.md` 迁移到 `blog/` 目录
3. 更新 VitePress 配置添加 `contentDirs: ['blog']`
4. 验证 URL 结构保持不变（SEO 无影响）

**Tech Stack:** VitePress 2.0.0-alpha.12, TypeScript, Git, pnpm

---

## Task 1: 备份当前项目状态

**Files:**
- Create: 无
- Modify: 无
- Test: 无

- [ ] **Step 1: 确认 Git 工作区干净**

```bash
git status
```

Expected output: `nothing to commit, working tree clean`

If there are uncommitted changes, commit or stash them first:
```bash
# Option A: Commit changes
git add .
git commit -m "chore: pre-migration cleanup"

# Option B: Stash changes
git stash
```

- [ ] **Step 2: 创建迁移前备份标签**

```bash
git tag -a pre-blog-migration -m "Before migrating content to blog/ directory"
git tag -l
```

Expected output: Should include `pre-blog-migration` in the tag list

- [ ] **Step 3: 验证 VitePress 版本支持 contentDirs**

```bash
cat package.json | grep "vitepress"
```

Expected output: `"vitepress": "2.0.0-alpha.12"`

确认: VitePress 2.x 支持 `contentDirs` 配置

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: create pre-migration backup tag"
```

---

## Task 2: 创建 blog/ 目录结构

**Files:**
- Create: `blog/`
- Modify: 无
- Test: 无

- [ ] **Step 1: 创建 blog 目录**

```bash
mkdir -p blog
ls -la | grep blog
```

Expected output: `drwxr-xr-x  ... blog`

- [ ] **Step 2: 创建 .gitkeep 确保 blog 目录被 Git 追踪**

```bash
touch blog/.gitkeep
git add blog/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: create blog/ directory for content workspace"
```

---

## Task 3: 迁移 coding/ 目录

**Files:**
- Create: 无
- Modify: 无（移动目录）
- Test: 无

- [ ] **Step 1: 移动 coding/ 到 blog/coding/**

```bash
mv coding blog/
ls blog/
```

Expected output: Should include `coding` in the blog directory listing

- [ ] **Step 2: 验证移动成功**

```bash
ls blog/coding/
```

Expected output: Should show all files from original coding directory

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move coding/ to blog/coding/"
```

---

## Task 4: 迁移 essay/ 目录

**Files:**
- Create: 无
- Modify: 无（移动目录）
- Test: 无

- [ ] **Step 1: 移动 essay/ 到 blog/essay/**

```bash
mv essay blog/
ls blog/
```

Expected output: Should include `coding` and `essay`

- [ ] **Step 2: 验证移动成功**

```bash
ls blog/essay/
```

Expected output: Should show all files from original essay directory

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move essay/ to blog/essay/"
```

---

## Task 5: 迁移 archive/ 目录

**Files:**
- Create: 无
- Modify: 无（移动目录）
- Test: 无

- [ ] **Step 1: 移动 archive/ 到 blog/archive/**

```bash
mv archive blog/
ls blog/
```

Expected output: Should include `coding`, `essay`, and `archive`

- [ ] **Step 2: 验证移动成功**

```bash
ls blog/archive/
```

Expected output: Should show all files from original archive directory

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move archive/ to blog/archive/"
```

---

## Task 6: 迁移首页 index.md

**Files:**
- Create: `blog/index.md`
- Modify: 无（移动文件）
- Test: 无

- [ ] **Step 1: 验证根目录的 index.md 存在**

```bash
ls -la index.md
```

Expected output: Should show index.md in root directory

- [ ] **Step 2: 移动 index.md 到 blog/index.md**

```bash
mv index.md blog/
ls blog/
```

Expected output: Should include `index.md`, `coding`, `essay`, `archive`

- [ ] **Step 3: 验证根目录无 index.md**

```bash
ls -la index.md 2>&1
```

Expected output: `No such file or directory`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move index.md to blog/index.md"
```

---

## Task 7: 更新 VitePress 配置添加 contentDirs

**Files:**
- Create: 无
- Modify: `.vitepress/config.mts:26-27`
- Test: 无

- [ ] **Step 1: 读取当前配置**

```bash
cat .vitepress/config.mts | head -30
```

Expected output: Should show current VitePress configuration without contentDirs

- [ ] **Step 2: 在 config.mts 中添加 contentDirs 配置**

Edit `.vitepress/config.mts` and add `contentDirs: ['blog'],` after the opening brace:

```typescript
export default withMermaid({
  contentDirs: ['blog'],
  base: "/",
  assetsDir: "static",
  lang: "zh-CN",
  title: "闻 · 斋",
  // ... rest of config
})
```

- [ ] **Step 3: 验证配置语法正确**

```bash
npx tsc --noEmit .vitepress/config.mts
```

Expected output: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add .vitepress/config.mts
git commit -m "feat: add contentDirs configuration for blog/ workspace"
```

---

## Task 8: 清理 blog/.gitkeep

**Files:**
- Create: 无
- Modify: `blog/.gitkeep` (删除)
- Test: 无

- [ ] **Step 1: 删除 .gitkeep（目录已有内容，不需要空目录占位符）**

```bash
rm blog/.gitkeep
git status
```

Expected output: Should show `deleted: blog/.gitkeep`

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove blog/.gitkeep (no longer needed)"
```

---

## Task 9: 本地开发环境验证

**Files:**
- Create: 无
- Modify: 无
- Test: 本地开发服务器

- [ ] **Step 1: 清理 VitePress 缓存**

```bash
rm -rf .vitepress/cache
rm -rf node_modules/.vite
```

Expected output: No errors

- [ ] **Step 2: 启动开发服务器**

```bash
pnpm dev
```

Expected output: Development server starts successfully on `http://localhost:5173`

Wait for server to fully start (look for "BUILD SUCCESS" or similar message)

- [ ] **Step 3: 测试首页访问**

Open browser and navigate to: `http://localhost:5173/`

Expected result:
- Homepage loads without errors
- No 404 errors in console
- Content displays correctly

- [ ] **Step 4: 测试编码页面访问**

Open browser and navigate to: `http://localhost:5173/coding/`

Expected result:
- Coding page loads
- URL is `/coding/` (NOT `/blog/coding/`)
- Articles list displays

- [ ] **Step 5: 测试随笔页面访问**

Open browser and navigate to: `http://localhost:5173/essay/`

Expected result:
- Essay page loads
- URL is `/essay/` (NOT `/blog/essay/`)
- Articles list displays

- [ ] **Step 6: 测试归档页面访问**

Open browser and navigate to: `http://localhost:5173/archive/`

Expected result:
- Archive page loads
- URL is `/archive/` (NOT `/blog/archive/`)
- Archives list displays

- [ ] **Step 7: 测试具体文章访问**

Open any article link (e.g., navigate to a specific coding article)

Expected result:
- Article page loads
- URL is `/coding/article-name` (NOT `/blog/coding/article-name`)
- Content displays correctly
- Images load correctly

- [ ] **Step 8: 停止开发服务器**

Press `Ctrl+C` in the terminal to stop the dev server

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "test: verify local development environment (all pages accessible)"
```

---

## Task 10: 生产构建验证

**Files:**
- Create: 无
- Modify: 无
- Test: 构建输出

- [ ] **Step 1: 运行生产构建**

```bash
pnpm build
```

Expected output:
- BUILD SUCCESS message
- No errors during build
- Static files generated in `.vitepress/dist/`

- [ ] **Step 2: 验证构建输出目录结构**

```bash
ls -la .vitepress/dist/
```

Expected output: Should include `index.html`, `coding/`, `essay/`, `archive/` directories

- [ ] **Step 3: 验证 URL 结构（检查生成的 HTML 文件）**

```bash
ls .vitepress/dist/coding/ | head -5
```

Expected output: Should include `index.html` and article HTML files

Verify that there is NO `blog/` directory in the output:
```bash
ls .vitepress/dist/ | grep blog || echo "No blog/ directory found (correct)"
```

Expected output: "No blog/ directory found (correct)"

- [ ] **Step 4: 测试预览服务器**

```bash
pnpm preview
```

Expected output: Preview server starts (usually on `http://localhost:4173`)

Wait for server to start, then open browser and test:
- Homepage: `http://localhost:4173/`
- Coding: `http://localhost:4173/coding/`
- Essay: `http://localhost:4173/essay/`
- Archive: `http://localhost:4173/archive/`

All pages should load correctly with URLs unchanged.

- [ ] **Step 5: 停止预览服务器**

Press `Ctrl+C` in the terminal

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify production build (URL structure preserved)"
```

---

## Task 11: 更新 CLAUDE.md 文档

**Files:**
- Create: 无
- Modify: `CLAUDE.md:51-56`
- Test: 无

- [ ] **Step 1: 更新目录结构说明**

In `CLAUDE.md`, find the section describing content organization and update it:

Before (approximate):
```markdown
### 内容组织

- `/coding/` - 技术文章
- `/essay/` - 随笔
- `index.md` - 首页
```

After:
```markdown
### 内容组织

所有博客内容位于 `blog/` 工作空间目录：
- `blog/coding/` - 技术文章
- `blog/essay/` - 随笔
- `blog/archive/` - 归档文章
- `blog/index.md` - 首页
```

- [ ] **Step 2: 验证文档更新**

```bash
grep -n "blog/" CLAUDE.md | head -10
```

Expected output: Should show multiple references to `blog/` directory

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for blog/ workspace structure"
```

---

## Task 12: Git Hooks 验证

**Files:**
- Create: 无
- Modify: 无
- Test: `.git/hooks/pre-commit`

- [ ] **Step 1: 测试 pre-commit hook（图片检查）**

Create a test image file in the blog directory:
```bash
# Create a small test image
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > blog/test-image.png
```

- [ ] **Step 2: 尝试提交图片（应该被 pre-commit hook 阻止）**

```bash
git add blog/test-image.png
git commit -m "test: should be blocked by pre-commit hook"
```

Expected output: Pre-commit hook should block the commit with an error message about image files

- [ ] **Step 3: 清理测试文件**

```bash
rm blog/test-image.png
git reset HEAD blog/test-image.png 2>/dev/null || true
```

- [ ] **Step 4: 验证 hook 对 blog/ 目录正常工作**

Create a test markdown file:
```bash
echo "# Test Post" > blog/test-post.md
git add blog/test-post.md
git commit -m "test: verify markdown files can be committed"
```

Expected output: Commit should succeed (markdown files are allowed)

- [ ] **Step 5: 清理测试文件**

```bash
rm blog/test-post.md
git reset --soft HEAD~1  # Undo the commit but keep changes
git reset HEAD blog/test-post.md  # Unstage the file
rm blog/test-post.md
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify git hooks work with blog/ directory"
```

---

## Task 14: 最终验证与准备部署

**Files:**
- Create: 无
- Modify: 无
- Test: 完整的工作流验证

- [ ] **Step 1: 查看所有迁移提交**

```bash
git log --oneline | head -20
```

Expected output: Should show a series of commits related to blog migration

- [ ] **Step 2: 验证目录结构**

```bash
tree -L 2 -I 'node_modules|.git' . | head -30
```

Expected output: Should show blog/ directory containing coding/, essay/, archive/, index.md

- [ ] **Step 3: 验证根目录干净**

```bash
ls -la | grep -E "^-.*\.md$" | grep -v "package.json"
```

Expected output: Should NOT show coding.md, essay.md, archive.md, or index.md in root

- [ ] **Step 4: 最终构建测试**

```bash
rm -rf .vitepress/dist .vitepress/cache
pnpm build
```

Expected output: BUILD SUCCESS

- [ ] **Step 5: 验证 RSS 生成**

```bash
ls -lh .vitepress/dist/feed.xml
```

Expected output: Should show feed.xml was generated

- [ ] **Step 6: 检查构建输出中的 blog/ 目录**

```bash
ls .vitepress/dist/ | grep blog && echo "ERROR: blog/ should not be in dist" || echo "OK: No blog/ directory in dist"
```

Expected output: "OK: No blog/ directory in dist"

- [ ] **Step 7: 创建迁移总结文档**

```bash
cat > docs/migration-summary.md << 'EOF'
# 博客内容工作空间迁移总结

## 迁移日期
2026-04-06

## 迁移内容

### 目录变更
- `coding/` → `blog/coding/`
- `essay/` → `blog/essay/`
- `archive/` → `blog/archive/`
- `index.md` → `blog/index.md`

### 配置变更
- `.vitepress/config.mts`: 添加 `contentDirs: ['blog']`

## URL 变化

**重要**: URL 结构完全不变

| 页面 | 迁移前 URL | 迁移后 URL |
|------|-----------|-----------|
| 首页 | `/` | `/` |
| 编程 | `/coding/` | `/coding/` |
| 随笔 | `/essay/` | `/essay/` |
| 归档 | `/archive/` | `/archive/` |
| 文章 | `/coding/article-name` | `/coding/article-name` |

## SEO 影响

无影响。所有 URL 保持不变，搜索引擎无需重新索引。

## Netlify 部署

部署流程无需更改：
- 推送到 `main` 分支
- Netlify 自动触发构建
- 构建命令：`pnpm build`
- 发布目录：`.vitepress/dist`

## 后续工作

### 可选优化
1. 考虑添加 `blog/drafts/` 用于草稿
2. 考虑添加 `.vitepress/cache` 到 `.gitignore`
3. 评估是否需要内容管理工具（CMS）

### 维护
- 保持 `CLAUDE.md` 文档更新
- 新文章创建在 `blog/` 目录下

## 回滚方案

如果需要回滚到迁移前状态：

```bash
# 方法 1: 使用备份标签
git checkout pre-blog-migration
git checkout -b rollback-branch

# 方法 2: 手动回滚
git log --oneline | grep "refactor: move"
# 逐个 revert 迁移提交
```

## 联系

如有问题，请参考：
- 设计文档: `docs/superpowers/specs/2026-04-06-blog-content-workspace-design.md`
- 实施计划: `docs/superpowers/plans/2026-04-06-blog-content-workspace.md`
EOF
```

- [ ] **Step 8: Commit**

```bash
git add docs/migration-summary.md
git commit -m "docs: add migration summary document"
```

---

## Task 15: 推送到远程仓库

**Files:**
- Create: 无
- Modify: 无
- Test: 远程仓库

- [ ] **Step 1: 验证所有提交已本地完成**

```bash
git log origin/main..HEAD --oneline
```

Expected output: Should show all migration commits not yet pushed

- [ ] **Step 2: 统计提交数量**

```bash
git log origin/main..HEAD --oneline | wc -l
```

Expected output: Should show approximately 15 commits (one per task)

- [ ] **Step 3: 推送到远程仓库**

```bash
git push origin main
```

Expected output: Push successful, no errors

- [ ] **Step 4: 验证 Netlify 构建触发**

1. 访问 Netlify: https://app.netlify.com
2. 查看你的站点部署队列
3. 确认新的构建已触发

Expected result: Netlify should start building automatically

- [ ] **Step 5: 等待 Netlify 构建完成**

Monitor the build progress on Netlify dashboard

Expected result: Build should succeed (no errors)

- [ ] **Step 6: 验证线上站点**

1. 访问: `https://upthen.me/`
2. 测试首页、编程页、随笔页、归档页
3. 测试具体文章链接

Expected result: All pages load correctly with unchanged URLs

- [ ] **Step 7: 清理本地备份标签（可选）**

```bash
# 如果一切正常，可以删除备份标签
git tag -d pre-blog-migration
git push origin :refs/tags/pre-blog-migration
```

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: complete blog content workspace migration"
```

---

## 验收标准

迁移成功的标志：

- [ ] 所有内容目录已移动到 `blog/`
- [ ] 根目录不再有 `coding/`、`essay/`、`archive/`、`index.md`
- [ ] VitePress 配置已添加 `contentDirs: ['blog']`
- [ ] 本地开发环境正常运行
- [ ] 生产构建成功
- [ ] URL 结构保持不变（无 `/blog/` 前缀）
- [ ] Git hooks 正常工作
- [ ] 文档已更新（CLAUDE.md）
- [ ] 代码已推送到远程仓库
- [ ] Netlify 自动部署成功
- [ ] 线上站点验证通过

## 故障排除

### 本地开发服务器启动失败

**问题**: `pnpm dev` 报错

**检查步骤**:
1. 确认 VitePress 配置语法正确
2. 清理缓存: `rm -rf .vitepress/cache node_modules/.vite`
3. 重新安装依赖: `pnpm install`
4. 检查 TypeScript 编译: `npx tsc --noEmit .vitepress/config.mts`

### 构建失败

**问题**: `pnpm build` 报错

**检查步骤**:
1. 确认所有文件已移动到 `blog/`
2. 检查 `.vitepress/config.mts` 中的 `contentDirs` 配置
3. 查看构建错误日志
4. 确认 VitePress 版本支持 `contentDirs`

### URL 包含 /blog/ 前缀

**问题**: 访问页面时 URL 变成 `/blog/coding/`

**原因**: `contentDirs` 配置可能不正确

**解决方案**:
1. 确认配置: `contentDirs: ['blog']`（不是 `contentDirs: ['blog/']`）
2. 重启开发服务器
3. 清理缓存后重新构建

### Netlify 构建失败

**问题**: Netlify 上构建报错

**检查步骤**:
1. 查看Netlify 构建日志
2. 确认本地构建成功
3. 检查 Node.js 版本（Netlify 设置）
4. 验证 `package.json` 中的构建命令

### Git hooks 不工作

**问题**: 图片文件被提交到仓库

**检查步骤**:
1. 确认 `.git/hooks/pre-commit` 存在且可执行
2. 检查 hook 中的路径是否正确
3. 手动测试: `SKIP_IMAGE_CHECK=true git commit -m "test"` 应该可以提交
4. 验证 hook 是否被 Git 忽略（`git config core.hooksPath`）

## 参考资料

- 设计文档: `docs/superpowers/specs/2026-04-06-blog-content-workspace-design.md`
- VitePress 文档: https://vitepress.dev/guide/routing#rewriting-redirects
