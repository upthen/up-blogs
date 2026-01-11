export interface Env {
  // 环境变量类型定义
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // 处理 CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 路由处理
    if (url.pathname === '/api/hello') {
      return handleHello(request, corsHeaders);
    }
    
    if (url.pathname === '/api/time') {
      return handleTime(corsHeaders);
    }

    // 默认响应
    return new Response(JSON.stringify({
      message: 'API Worker is running!',
      endpoints: ['/api/hello', '/api/time']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },
};

// 处理 /api/hello
async function handleHello(request: Request, headers: HeadersInit): Promise<Response> {
  const body = await request.json().catch(() => ({}));
  return new Response(JSON.stringify({
    message: 'Hello from Cloudflare Worker!',
    youSaid: body
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

// 处理 /api/time
function handleTime(headers: HeadersInit): Response {
  return new Response(JSON.stringify({
    timestamp: Date.now(),
    iso: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}
