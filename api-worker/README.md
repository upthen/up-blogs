# API Worker

Cloudflare Workers API 项目

## 项目结构

```
api-worker/
├── src/
│   └── index.ts          # Worker 主文件
├── wrangler.toml         # Cloudflare 配置
├── package.json          # 项目配置
└── tsconfig.json         # TypeScript 配置
```

## 可用命令

\`\`\`bash
# 本地开发
pnpm dev

# 部署到 Cloudflare（开发环境）
pnpm deploy

# 部署到 Cloudflare（生产环境）
pnpm deploy:prod

# 查看实时日志
pnpm tail
\`\`\`

## API 接口

- `GET /` - 服务状态
- `POST /api/hello` - Hello 接口
- `GET /api/time` - 获取当前时间

## 本地开发

运行 \`pnpm dev\` 后，访问：
http://localhost:8787

## 部署

1. 确保已登录 Cloudflare: \`wrangler login\`
2. 运行: \`pnpm deploy\`
3. 部署成功后会获得一个 *.workers.dev 域名
