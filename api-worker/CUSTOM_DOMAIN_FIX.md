# Cloudflare Worker 自定义域名配置指南

## 问题描述
`*.workers.dev` 域名在某些网络环境下（如4G/5G、公司网络）无法访问，只能在家里网络访问。

## 解决方案：绑定自定义域名

### 步骤 1：准备域名
假设您有以下域名（如果没有可以购买一个，如 .xyz 域名很便宜）：
- `yourdomain.com`

### 步骤 2：在 Cloudflare 配置自定义域名

```bash
cd ~/Study/up-blogs/api-worker

# 添加自定义路由（需要先登录）
wrangler domains list
```

### 步骤 3：修改 wrangler.toml 配置

```toml
name = "api-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# D1 数据库配置
[[d1_databases]]
binding = "DB"
database_name = "up-blogs-db"
database_id = "ca64b6ca-20fa-491a-ab43-0aad4d801aff"

[vars]
ENVIRONMENT = "development"

# ===== 新增：自定义域名配置 =====
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
# ===============================

# 开发环境配置
[env.development]
name = "api-worker-dev"

# 生产环境配置
[env.production]
name = "api-worker"
```

### 步骤 4：在 Cloudflare 控制台配置 DNS

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择您的域名
3. 添加 CNAME 记录：
   - 名称：`api`
   - 类型：`CNAME`
   - 目标：`api-worker.zyb-6616.workers.dev`
   - 代理状态：已代理（橙色云朵）

### 步骤 5：修改前端代码

在 `.vitepress/theme/components/DailyPoem.vue` 中：

```typescript
// 将
const API_BASE_URL = 'https://api-worker.zyb-6616.workers.dev';

// 改为
const API_BASE_URL = 'https://api.yourdomain.com';
```

## 为什么自定义域名能解决问题？

1. **避免网络限制**：`*.workers.dev` 可能被某些ISP限制，但自定义域名通常不受影响
2. **更好的路由**：Cloudflare 会优化自定义域名的全球路由
3. **更快的访问**：避免了额外的DNS解析层

## 临时替代方案

如果您暂时没有域名，可以尝试：

### 方案 A：使用 Cloudflare Pages
1. 将 Worker 部署为 Pages Functions
2. 使用 `yourname.pages.dev` 域名

### 方案 B：使用 Cloudflare Tunnel（用于本地开发）
```bash
wrangler tunnel api-tunnel
```

## 测试验证

部署后，在不同网络下测试：

```bash
# 测试 API 是否可访问
curl -v https://api.yourdomain.com/api/time
```

## 注意事项

- 免费版 Cloudflare 账号最多支持 3 个 Workers
- 自定义域名需要已托管在 Cloudflare
- HTTPS 证书会自动配置，无需手动申请
