# [yongbo.life](https://yongbo.life)

一套 **极简** 风格的自定义 `VitePress` 博客模板，遵循让阅读回归本源的宗旨和极简的理念。

> **状态**：个人自用，持续开发中。计划在达到一定完成度后，抽离成主题模板开源。

## ✨ 特性

### 已实现
- [x] 黑白模式切换
- [x] 目录跳转
- [x] 文章列表
- [x] 本地搜索
- [x] 字体切换
- [x] 回到顶部
- [x] 年份转换为天干地支纪年（农历显示）
- [x] 支持 Iconify 图标
- [x] 移动端适配
- [x] 图片压缩脚本（WebP 格式）
- [x] Giscus 评论系统
- [x] RSS 订阅
- [x] 图片预览（灯箱效果）
- [x] Mermaid 图表支持
- [x] 编程导航页（常用工具快捷入口）

### 开发中
- [ ] SEO 优化
- [ ] 大模型检索优化
- [ ] 文章列表最新文章单独展示
- [ ] 文章列表置顶功能
- [ ] 个人旅游分布图（地图标注+图片）
- [ ] 社交分享功能
- [x] Cloudflare Workers API

## 🛠 技术栈

### 前端
- **VitePress 2.0** - 静态站点生成器
- **Vue 3.5** - 使用 Composition API
- **UnoCSS** - 原子化 CSS 框架
- **TypeScript** - 类型安全
- **Mermaid** - 图表支持

### 后端/API
- **Cloudflare Workers** - Serverless 函数
- **Cloudflare D1** - SQLite 数据库（可选）
- **Cloudflare KV** - 键值存储（可选）

### 部署
- **Netlify** - 前端托管
- **Cloudflare Workers** - API 服务
- **PicGo + 腾讯云 COS** - 图床服务

### 工具
- **pnpm** - 包管理器
- **Sharp** - 图片处理
- **Git** - 版本控制

## 📁 项目结构

```
up-blogs/
├── api-worker/              # Cloudflare Workers API
│   ├── src/
│   │   └── index.ts         # API 主文件
│   ├── wrangler.toml        # Workers 配置
│   └── package.json
│
├── coding/                  # 技术文章
├── essay/                   # 随笔
│
├── .vitepress/              # VitePress 配置
│   ├── theme/               # 自定义主题
│   │   ├── components/      # Vue 组件
│   │   └── styles/          # 全局样式
│   └── config.mts           # 主配置文件
│
├── public/                  # 静态资源
├── scripts/                 # 工具脚本
│   └── compress.js          # 图片压缩
├── uno.config.ts            # UnoCSS 配置
└── package.json
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖
\`\`\`bash
# 克隆项目
git clone https://github.com/upthen/up-blogs.git
cd up-blogs

# 安装依赖
pnpm install
\`\`\`

### 本地开发
\`\`\`bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5173
\`\`\`

## 📦 常用命令

### 博客开发
\`\`\`bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建静态站点
pnpm preview          # 预览生产构建
\`\`\`

### 图片压缩
\`\`\`bash
pnpm compress         # 基础压缩（85% 质量）
pnpm compress:high    # 高质量（95%）
pnpm compress:mid     # 中等质量（85%）
pnpm compress:low     # 低质量（75%）
pnpm compress:webp    # 转换为 WebP（85%）
\`\`\`

### API 开发
\`\`\`bash
cd api-worker

pnpm dev              # 启动本地开发服务器
pnpm deploy           # 部署到 Cloudflare
pnpm tail             # 查看实时日志
\`\`\`

## 🌐 部署

### 前端部署（Netlify）
项目已连接到 Netlify，推送到 `main` 分支会自动部署。

### API 部署（Cloudflare Workers）
\`\`\`bash
cd api-worker
pnpm deploy
\`\`\`

## 🎨 主题定制

### 颜色系统

| Token | 亮色模式 | 暗色模式 |
|-------|---------|---------|
| `--color-primaryGray` | #F5F5F7 | #121212 |
| `--color-accentBlack` | #212121 | #E0E0E0 |
| `--color-auxGray1` | #E0E0E0 | #424242 |

完整的颜色定义见 `uno.config.ts`

### 布局模式

在 Markdown frontmatter 中指定：
\`\`\`yaml
---
layout: list    # 显示文章列表
layout: home    # 首页模式
# 默认为单篇文章模式
---
\`\`\`

## 📝 内容规范

### 图片管理
1. 将图片放在与 Markdown 文件相同的目录
2. 提交前使用压缩脚本：
   \`\`\`bash
   pnpm compress:webp-mid
   \`\`\`
3. 头图使用高质量：`pnpm compress:webp-high`

### 文章分类
- `/coding/` - 技术文章
- `/essay/` - 随笔
- 其他分类可自由创建

## 🔌 API 接口

Cloudflare Workers 提供的 API：

- `GET /` - API 服务状态
- `POST /api/hello` - 测试接口
- `GET /api/time` - 获取服务器时间

## 📄 许可证

- **代码**：MIT 许可证
- **内容（文字/图片）**：CC BY-NC-SA 4.0

## 📜 更新日志

### 2025-09-28
- 新增图片预览功能
- 新增图片压缩脚本

### 2026-01-11
- 添加 Cloudflare Workers API
- 配置 PicGo + 腾讯云 COS 图床
- 完善 Obsidian + Git 工作流

## 🙏 致谢

本项目基于以下优秀工具：
- [VitePress](https://vitepress.dev/)
- [Vue.js](https://vuejs.org/)
- [UnoCSS](https://unocss.dev/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Netlify](https://www.netlify.com/)
