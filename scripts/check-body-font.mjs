// 检查构建产物中 body 的最终生效字体。
// 规则:按 HTML 中 <link rel="stylesheet"> 的引用顺序拼接所有 CSS,
// 取最后一条命中 body 且含 font-family 的声明,断言:
//   1. 不再出现写死的 STZhongsong / SimSun(中宋/宋体)
//   2. 使用 --vp-font-family-base(由 style.css 定义为 苹方/幼圆)
// 用法:node scripts/check-body-font.mjs [distDir]
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = process.argv[2] ?? ".vitepress/dist";
const distRoot = join(process.cwd(), distDir);

if (!existsSync(distRoot)) {
  console.error(`✗ 未找到构建产物目录: ${distRoot},请先执行 pnpm build`);
  process.exit(2);
}

// 收集 dist 内所有 html 与 css
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = walk(distRoot);
const htmls = files.filter((f) => f.endsWith(".html"));
const cssText = new Map(
  files.filter((f) => f.endsWith(".css")).map((f) => [f, readFileSync(f, "utf8")]),
);

if (htmls.length === 0 || cssText.size === 0) {
  console.error("✗ 构建产物中没有 html 或 css 文件");
  process.exit(2);
}

// 提取一条 CSS 文本里所有「选择器含 body 的 font-family 声明」
const BODY_FONT_RE = /([^{}]*\bbody[^{}]*)\{([^}]*)\}/g;
function bodyFontRules(css) {
  const rules = [];
  for (const m of css.matchAll(BODY_FONT_RE)) {
    const decls = m[2];
    const ff = decls.match(/font-family\s*:\s*([^;}]*)/);
    if (ff) rules.push({ selector: m[1].trim().slice(-80), value: ff[1].trim() });
  }
  return rules;
}

// 按每个 html 的 link 顺序确定层叠顺序;同一文件内按出现顺序
const winners = new Map();
for (const html of htmls) {
  const text = readFileSync(html, "utf8");
  const hrefs = [...text.matchAll(/<link[^>]*stylesheet[^>]*href="([^"]+)"/g)].map(
    (m) => m[1],
  );
  for (const href of hrefs) {
    const base = href.split("/").pop().split(/[?#]/)[0];
    const file = [...cssText.keys()].find((k) => k.split("/").pop() === base);
    if (!file) continue;
    for (const rule of bodyFontRules(cssText.get(file))) {
      winners.set(rule.selector + " => " + rule.value, { html, ...rule });
    }
  }
}

const ordered = [...winners.values()];
const last = ordered[ordered.length - 1];

console.log("按层叠顺序的 body font-family 声明:");
for (const r of ordered) console.log(`  [${r.html.split("/").pop()}] ${r.selector} { font-family: ${r.value} }`);

if (!last) {
  console.error("\n✗ 没有找到任何 body font-family 声明(异常)");
  process.exit(1);
}

const v = last.value;
if (/STZhongsong|SimSun/i.test(v)) {
  console.error(`\n✗ 红:body 最终字体仍写死中宋/宋体: ${v}`);
  process.exit(1);
}
if (!v.includes("--vp-font-family-base") && !/PingFang/i.test(v)) {
  console.error(`\n✗ 红:body 最终字体未落到 --vp-font-family-base(苹方/幼圆): ${v}`);
  process.exit(1);
}
console.log(`\n✓ 绿:body 最终字体 = ${v}`);
