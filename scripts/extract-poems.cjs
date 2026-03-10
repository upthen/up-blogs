#!/usr/bin/env node

/**
 * 从 chinese-gushiwen 数据库中提取300首古诗词
 * 并转换为 data/poems.ts 格式
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  inputDir: path.join(__dirname, '../.material/chinese-gushiwen/guwen'),
  outputFile: path.join(__dirname, '../data/poems.ts'),
  targetCount: 300
};

// 读取 JSON 文件
function readPoemsFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 文件格式是多个 JSON 对象用逗号分隔，没有包裹在数组中
    // 例如: {..},{..},{..},..
    // 需要手动解析
    const poems = [];

    // 按照对象边界分割
    let braceCount = 0;
    let current = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        current += char;
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        current += char;
        continue;
      }

      if (inString) {
        current += char;
        continue;
      }

      if (char === '{') {
        braceCount++;
        current += char;
        continue;
      }

      if (char === '}') {
        braceCount--;
        current += char;

        // 当计数器回到0，说明一个完整的对象结束
        if (braceCount === 0) {
          try {
            const poem = JSON.parse(current);
            poems.push(poem);
          } catch (e) {
            console.warn(`⚠️  跳过无效对象: ${current.substring(0, 50)}...`);
          }
          current = '';

          // 跳过后续的逗号和空格
          while (i + 1 < content.length && /[,\s]/.test(content[i + 1])) {
            i++;
          }
        }
        continue;
      }

      current += char;
    }

    console.log(`✅ 读取文件: ${path.basename(filePath)} - ${poems.length} 首诗`);
    return poems;
  } catch (e) {
    console.error(`❌ 读取文件失败: ${filePath}`, e);
    return [];
  }
}

// 转换为目标格式
function convertPoem(sourcePoem) {
  // 提取主要类型（取第一个标签）
  const typeTags = Array.isArray(sourcePoem.type) ? sourcePoem.type : [];
  const mainType = typeTags[0] || '古诗文';

  // 映射到简化的类型
  const typeMap = {
    '乐府': '乐府',
    '唐诗三百首': '诗',
    '宋词': '词',
    '元曲': '曲',
    '赋': '赋'
  };

  const type = typeMap[mainType] || '诗';

  // 生成唯一 ID（使用原标题简化）
  const id = sourcePoem.title
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .substring(0, 20)
    + '-' + Math.random().toString(36).substring(2, 6);

  return {
    id,
    title: sourcePoem.title,
    author: sourcePoem.writer,
    dynasty: sourcePoem.dynasty,
    type,
    content: sourcePoem.content,
    notes: sourcePoem.translation || sourcePoem.remark || ''
  };
}

// 提取指定数量的诗词
function extractPoems(count) {
  console.log(`\n📦 开始提取 ${count} 首诗词...\n`);

  // 读取第一个文件（guwen0-1000.json）
  const firstFile = path.join(CONFIG.inputDir, 'guwen0-1000.json');
  const allPoems = readPoemsFile(firstFile);

  if (allPoems.length < count) {
    console.warn(`⚠️  第一个文件只有 ${allPoems.length} 首诗，少于要求的 ${count} 首`);
  }

  // 提取指定数量的诗词
  const selectedPoems = allPoems.slice(0, count);
  console.log(`✅ 提取完成，共 ${selectedPoems.length} 首诗\n`);

  // 转换为目标格式
  const convertedPoems = selectedPoems.map(convertPoem);

  return convertedPoems;
}

// 生成 TypeScript 文件
function generatePoemsFile(poems) {
  const header = `/**
 * 每日一诗数据源
 * 作者：从 chinese-gushiwen 数据库提取
 *
 * 说明：收录 ${poems.length} 首精选古诗文
 * 数据来源：.material/chinese-gushiwen/guwen/guwen0-1000.json
 *
 * 包含类型：诗、词、曲、赋、乐府
 */

export interface Poem {
  id: string;                  // 唯一标识
  title: string;               // 诗题
  author: string;              // 作者
  dynasty: string;             // 朝代
  content: string;             // 诗文内容
  notes?: string;              // 翻译或注释
}

export const poems: Poem[] = [
`;

  const body = poems.map(poem => {
    // 转义单引号
    const content = poem.content.replace(/'/g, "\\'");
    const notes = poem.notes ? poem.notes.replace(/'/g, "\\'") : '';

    return `  {
    id: "${poem.id}",
    title: "${poem.title}",
    author: "${poem.author}",
    dynasty: "${poem.dynasty}",
    type: "${poem.type}",
    content: \`${content}\`,
    ${notes ? `notes: "${notes}"` : 'notes: ""'}
  }`;
  }).join(',\n');

  const footer = `
];

// 获取随机诗
export function getRandomPoem(): Poem {
  const index = Math.floor(Math.random() * poems.length);
  return poems[index];
}

// 按索引获取诗
export function getPoemByIndex(index: number): Poem {
  return poems[index % poems.length];
}

// 获取诗的总数
export function getPoemCount(): number {
  return poems.length;
}
`;

  return header + body + footer;
}

// 主函数
function main() {
  console.log('========================================');
  console.log('  古诗词数据提取工具');
  console.log('========================================\n');

  try {
    // 提取诗词
    const poems = extractPoems(CONFIG.targetCount);

    // 统计信息
    const typeCount = {};
    poems.forEach(poem => {
      typeCount[poem.type] = (typeCount[poem.type] || 0) + 1;
    });

    console.log('📊 类型统计：');
    Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 首`);
    });
    console.log('');

    // 生成 TypeScript 文件
    const fileContent = generatePoemsFile(poems);

    // 写入文件
    fs.writeFileSync(CONFIG.outputFile, fileContent, 'utf-8');
    console.log(`✅ 已生成文件: ${CONFIG.outputFile}\n`);

    console.log('========================================');
    console.log('  ✅ 提取完成！');
    console.log('========================================\n');

  } catch (e) {
    console.error('\n❌ 提取失败:', e);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { extractPoems, generatePoemsFile };
