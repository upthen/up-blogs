# 博客内容工作空间设计文档

**日期**: 2026-04-06
**作者**: Claude
**状态**: 设计阶段

## 概述

将博客内容从项目根目录迁移到独立的 `blog/` 工作空间目录，实现内容与项目代码的物理分离，同时保持 URL 结构和工作流的稳定性。

## 问题背景

当前项目结构中，博客内容（`coding/`、`essay/`、`archive/`）与项目配置、脚本、API 代码混合在根目录下。这导致：

1. **目录混乱**：根目录包含内容、配置、代码等多种类型文件
2. **内容识别困难**：难以快速区分哪些是博客内容，哪些是项目文件
3. **扩展性受限**：未来添加其他非内容类型文件时容易与内容混淆

## 设计目标

1. ✅ 创建独立的内容工作空间 `blog/` 目录
2. ✅ 保持现有 URL 结构不变（SEO 友好）
3. ✅ 最小化对现有工作流的影响
4. ✅ 支持未来的内容扩展

## 方案选择

选择 **方案 B：contentDirs 配置**

### 对比分析

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| A. 简单移动 + 配置调整 | 实现简单 | URL 变化，影响 SEO | ❌ |
| **B. contentDirs 配置** | **URL 不变，SEO 无影响** | 需要版本支持 | ✅ |
| C. Git 子模块 | 完全分离 | 复杂度高，工作流变化大 | ❌ |

### 实现原理

VitePress 的 `contentDirs` 配置允许指定内容目录，同时保持 URL 路径不变。通过设置 `contentDirs: ['blog']`，VitePress 会：

1. 从 `blog/` 目录读取内容
2. 使用 `blog/` 下的目录结构生成路由
3. URL 路径不包含 `blog/` 前缀

示例：
- 文件路径：`blog/coding/hello-world.md`
- 生成 URL：`/coding/hello-world`（不是 `/blog/coding/hello-world`）

## 技术设计

### 目录结构

#### 迁移前
```
/Users/zyb/Dev/up-blogs/
├── coding/                    # 博客内容
│   └── index.md
├── essay/                     # 博客内容
│   └── index.md
├── archive/                   # 博客内容
│   └── index.md
├── index.md                   # 首页
├── .vitepress/                # VitePress 配置
│   └── config.mts
├── api-worker/                # API 服务
├── scripts/                   # 工具脚本
├── public/                    # 静态资源
└── package.json
```

#### 迁移后
```
/Users/zyb/Dev/up-blogs/
├── blog/                      # 🆕 内容工作空间
│   ├── coding/                # 博客内容（迁移）
│   │   └── index.md
│   ├── essay/                 # 博客内容（迁移）
│   │   └── index.md
│   ├── archive/               # 博客内容（迁移）
│   │   └── index.md
│   └── index.md               # 首页（迁移）
├── .vitepress/                # VitePress 配置（不变）
│   └── config.mts             # 🔄 需要修改
├── api-worker/                # API 服务（不变）
├── scripts/                   # 工具脚本（不变）
├── public/                    # 静态资源（不变）
└── package.json               # 配置文件（不变）
```

### 配置更改

**文件**: `.vitepress/config.mts`

**修改前**:
```typescript
export default withMermaid({
  base: "/",
  assetsDir: "static",
  lang: "zh-CN",
  title: "闻 · 斋",
  // ...
})
```

**修改后**:
```typescript
export default withMermaid({
  contentDirs: ['blog'],        // 🆕 新增
  base: "/",
  assetsDir: "static",
  lang: "zh-CN",
  title: "闻 · 斋",
  // ...
})
```

### URL 验证

| 页面类型 | 文件路径 | 生成 URL | 变化 |
|---------|---------|---------|------|
| 首页 | `blog/index.md` | `/` | ✅ 无变化 |
| 编程列表 | `blog/coding/index.md` | `/coding/` | ✅ 无变化 |
| 随笔列表 | `blog/essay/index.md` | `/essay/` | ✅ 无变化 |
| 归档列表 | `blog/archive/index.md` | `/archive/` | ✅ 无变化 |
| 文章 | `blog/coding/hello-world.md` | `/coding/hello-world` | ✅ 无变化 |

## 工作流影响

### Obsidian 工作流

**当前配置**:
- Vault 路径：`~/Dev/up-blogs`
- 工作目录：根目录

**迁移后选项**:

**选项 A：保持现有 Vault**
- Vault 路径：`~/Dev/up-blogs`（不变）
- 在 `blog/` 子目录下创建内容
- 影响较小，但根目录仍有其他文件

**选项 B：创建新的 Vault**（推荐）
- 新 Vault 路径：`~/Dev/up-blogs/blog`
- 纯净的内容环境
- 需要重新配置 Obsidian Git 插件

### Git Hooks

**Pre-commit 图片检查**：
- 脚本路径：`.git/hooks/pre-commit`
- 检查逻辑：检查暂存区中的图片文件
- 影响：无（Git hooks 不受目录结构影响）

### Git 自动提交脚本

**脚本路径**: `scripts/git-commit-push.sh`

**需要调整**:
```bash
# 当前：在根目录执行
cd ~/Dev/up-blogs

# 迁移后：可选切换到 blog/ 目录
cd ~/Dev/up-blogs/blog
```

**建议**：
- 保持脚本在根目录执行
- Git 会自动处理子目录中的变更

## 迁移步骤（计划阶段）

### Phase 1: 准备
1. 备份当前项目
2. 确认 VitePress 版本支持 `contentDirs`

### Phase 2: 目录迁移
1. 创建 `blog/` 目录
2. 移动 `coding/` 到 `blog/coding/`
3. 移动 `essay/` 到 `blog/essay/`
4. 移动 `archive/` 到 `blog/archive/`
5. 移动 `index.md` 到 `blog/index.md`

### Phase 3: 配置更新
1. 更新 `.vitepress/config.mts`，添加 `contentDirs: ['blog']`
2. 验证本地开发环境（`pnpm dev`）
3. 验证构建（`pnpm build`）

### Phase 4: 工作流调整
1. 更新 Obsidian Vault 配置
2. 测试 Git hooks
3. 测试自动提交脚本
4. 更新 `CLAUDE.md` 文档

### Phase 5: 验证与部署
1. 本地完整测试
2. 提交到 Git
3. Netlify 自动部署
4. 验证线上 URL 和功能

## 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| VitePress 版本不支持 `contentDirs` | 高 | 低 | 检查版本，必要时升级 |
| Obsidian 工作流中断 | 中 | 中 | 提供详细的迁移指南 |
| URL 变化导致 SEO 下降 | 高 | 低 | 使用 `contentDirs` 配置确保 URL 不变 |
| Git hooks 失效 | 低 | 低 | Git hooks 基于 repo，不受目录影响 |

## 测试计划

### 功能测试
- [ ] 首页正常显示
- [ ] 文章列表页正常（coding、essay、archive）
- [ ] 文章详情页正常
- [ ] 图片加载正常
- [ ] RSS 生成正常

### URL 测试
- [ ] 首页: `https://upthen.me/`
- [ ] 编程: `https://upthen.me/coding/`
- [ ] 随笔: `https://upthen.me/essay/`
- [ ] 归档: `https://upthen.me/archive/`

### 工作流测试
- [ ] Obsidian 创建新文章
- [ ] Git 自动提交
- [ ] Pre-commit 图片检查
- [ ] Netlify 自动部署

## 后续优化

### 短期（1-2 周）
- 更新 `CLAUDE.md` 中的目录结构说明
- 创建迁移指南文档
- 优化 Obsidian 配置

### 长期
- 考虑添加 `drafts/` 目录存放草稿
- 考虑添加 `.vitepress/cache` 到 `.gitignore`
- 评估内容管理工具（如 CMS）

## 总结

本设计通过使用 VitePress 的 `contentDirs` 配置，实现了内容与代码的物理分离，同时保持了 URL 结构和 SEO 的稳定性。迁移过程影响可控，工作流调整最小，是一个平衡了当前需求和未来扩展性的方案。

**下一步**: 创建详细的实施计划（implementation plan）
