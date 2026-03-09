export interface Env {
  DB: D1Database;
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

    if (url.pathname === '/api/poems/daily') {
      return handleDailyPoem(request, env, corsHeaders);
    }

    if (url.pathname === '/api/poems/random') {
      return handleRandomPoem(request, env, corsHeaders);
    }

    // 默认响应
    return new Response(JSON.stringify({
      message: 'API Worker is running!',
      endpoints: ['/api/hello', '/api/time', '/api/poems/daily', '/api/poems/random']
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

// 处理 /api/poems/daily
async function handleDailyPoem(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
  try {
    // 获取参数 - 支持 POST body 或 URL query
    let type = '词';
    let dateParam = null;

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        type = body.type || type;
        dateParam = body.date || null;
      } catch (e) {
        // JSON 解析失败，忽略
      }
    } else {
      const url = new URL(request.url);
      type = url.searchParams.get('type') || type;
      dateParam = url.searchParams.get('date');
    }

    // 确定日期
    const today = dateParam ? new Date(dateParam) : new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // 根据日期计算 seed
    const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);

    // 获取该类型的总数量
    const totalResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM poems WHERE type = ?"
    ).bind(type).first();

    if (!totalResult || !totalResult.total) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No poems found for the specified type'
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const total = totalResult.total as number;

    // 计算偏移量
    const offset = seed % total;

    // 获取诗词
    const poem = await env.DB.prepare(
      "SELECT id, title, author, dynasty, type, content FROM poems WHERE type = ? LIMIT 1 OFFSET ?"
    ).bind(type, offset).first();

    if (!poem) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to retrieve poem'
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: poem,
      meta: {
        date: dateStr,
        seed,
        type,
        total
      }
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// 处理 /api/poems/random
async function handleRandomPoem(request: Request, env: Env, headers: HeadersInit): Promise<Response> {
  try {
    // 获取参数 - 支持 POST body 或 URL query
    let type = '词';

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        type = body.type || type;
      } catch (e) {
        // JSON 解析失败，忽略
      }
    } else {
      const url = new URL(request.url);
      type = url.searchParams.get('type') || type;
    }

    // 获取该类型的总数量
    const totalResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM poems WHERE type = ?"
    ).bind(type).first();

    if (!totalResult || !totalResult.total) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No poems found for the specified type'
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const total = totalResult.total as number;

    // 随机偏移量
    const offset = Math.floor(Math.random() * total);

    // 获取诗词
    const poem = await env.DB.prepare(
      "SELECT id, title, author, dynasty, type, content FROM poems WHERE type = ? LIMIT 1 OFFSET ?"
    ).bind(type, offset).first();

    if (!poem) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to retrieve poem'
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: poem,
      meta: {
        type,
        total
      }
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
