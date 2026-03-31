# 古诗词功能兜底方案实现说明

## 📝 修改日期
2026-03-10

## 🎯 修改目标
当 Cloudflare Workers API 调用失败时，从本地 `data/poems.ts` 文件加载诗词数据，确保用户始终能看到诗词，不会因为网络问题而出现加载失败。

## 📂 修改文件
`/.vitepress/theme/components/DailyPoem.vue`

## 🔧 主要修改内容

### 1. 导入本地诗词数据
```typescript
import { poems as localPoems, getRandomPoem, type Poem as LocalPoem } from '../../../data/poems';
```

### 2. 扩展 Poem 接口
支持两种数据格式：
- API 返回格式：`id: number`
- 本地数据格式：`id: string`

```typescript
interface Poem {
  id: number | string;  // 支持两种类型
  title: string;
  author: string;
  dynasty: string;
  type: string;
  content: string;
  notes?: string; // 本地数据特有的注释字段
}
```

### 3. 新增兜底函数
```typescript
// 从本地数据获取随机诗词（兜底方案）
const getFallbackPoem = (): Poem => {
  const localPoem = getRandomPoem();
  return {
    id: localPoem.id,
    title: localPoem.title,
    author: localPoem.author,
    dynasty: localPoem.dynasty,
    type: '词', // 本地数据都是词
    content: localPoem.content,
    notes: localPoem.notes
  };
};
```

### 4. 修改 fetchTodayPoem 函数
在 `catch` 块中添加兜底逻辑：

```typescript
try {
  // API 调用逻辑...
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'API returned error');
  }

  currentPoem.value = result.data;
  saveStorage(result.data);
} catch (e) {
  console.error('Failed to fetch poem from API, using fallback:', e);

  // 📦 兜底方案：从本地 data/poems.ts 加载诗词
  const fallbackPoem = getFallbackPoem();
  currentPoem.value = fallbackPoem;

  // 本地数据不保存到 storage，确保下次仍会尝试 API
}
```

### 5. 简化显示逻辑
因为有兜底方案，所以总是显示诗词，不再依赖 error 状态：

```typescript
// 显示弹窗
const showPoem = async () => {
  loading.value = true;
  error.value = null;

  await fetchTodayPoem('ci');

  // 现在有兜底方案，总是显示诗词
  visible.value = true;
  loading.value = false;
};
```

## 📊 本地诗词数据
- **位置**: `data/poems.ts`
- **数量**: 18 首
- **作者**: 苏东坡（北宋）、辛弃疾（南宋）
- **类型**: 全部为"词"

## 🎨 用户体验提升

### ✅ 修改前
- API 调用失败 → 显示错误信息
- 用户看到"加载失败"，需要手动重试
- 网络限制环境下无法使用该功能

### ✅ 修改后
- API 调用失败 → 自动切换到本地数据
- 用户始终能看到诗词（苏东坡或辛弃疾的词）
- 网络问题不影响功能可用性

## 🔍 行为说明

### 普通场景（API 正常）
1. 用户访问博客
2. 调用 Cloudflare Workers API
3. 返回今日诗词
4. 保存到 localStorage
5. 显示弹窗

### 兜底场景（API 失败）
1. 用户访问博客
2. 调用 Cloudflare Workers API **失败**
3. 自动从 `data/poems.ts` 随机选择一首词
4. 显示弹窗
5. **不保存**到 localStorage（下次访问仍会尝试 API）

### 为什么不保存本地诗词到 localStorage？
- 确保每次用户访问都会先尝试 API
- 如果网络恢复，可以及时使用在线功能
- 避免用户一直看到静态的本地诗词

## 🧪 测试建议

### 测试场景 1：API 正常
```bash
# 正常访问博客
# 应该看到 API 返回的诗词
```

### 测试场景 2：API 失败
```bash
# 1. 修改 API_BASE_URL 为无效地址
# 2. 访问博客
# 3. 应该看到本地诗词（苏东坡或辛弃疾）
# 4. 打开浏览器控制台，应该看到错误日志
```

### 测试场景 3：网络恢复
```bash
# 1. 使用无效地址访问（触发兜底）
# 2. 恢复正确地址
# 3. 刷新页面
# 4. 应该看到 API 返回的诗词
```

## 📌 注意事项

1. **本地诗词类型固定**
   - 本地数据只有"词"类型
   - 如果用户选择"诗"或"曲"，API 失败时仍会返回"词"
   - 这是可接受的权衡，因为 18 首词已足够日常使用

2. **随机性保证**
   - 每次兜底调用 `getRandomPoem()` 都会随机选择
   - 18 首词的随机性足够避免重复感

3. **控制台日志**
   - API 失败时会在控制台输出错误信息
   - 便于开发和调试
   - 普通用户看不到控制台，体验不受影响

4. **性能考虑**
   - 本地数据加载极快（< 1ms）
   - 不会影响页面加载速度
   - 优于从网络请求

## 🚀 后续优化方向

1. **扩展本地数据**
   - 添加"诗"、"曲"、"赋"类型
   - 增加更多作者（李白、杜甫、王维等）
   - 目标：收录 365 首诗词（每日一首不重复）

2. **智能缓存策略**
   - 记录 API 失败次数
   - 连续失败 N 次后，暂停尝试 API
   - 避免无效的网络请求

3. **混合模式**
   - 优先使用 API（每天不同的诗词）
   - 失败时使用本地（保证可用性）
   - 显示来源标签（API/本地）

## 📚 相关文件

- `data/poems.ts` - 本地诗词数据源
- `api-worker/src/index.ts` - Cloudflare Workers API
- `.vitepress/theme/components/DailyPoem.vue` - 弹窗组件
- `.vitepress/theme/components/UpTools.vue` - 工具栏按钮组件

## ✨ 总结

通过添加本地诗词数据作为兜底方案，我们确保了：
- ✅ 网络问题不影响功能可用性
- ✅ 用户始终能看到优美的古诗词
- ✅ 优雅的降级策略（API 失败 → 本地数据）
- ✅ 良好的开发体验（详细的控制台日志）

这是一个典型的"渐进增强"设计，API 正常时提供更丰富的功能，API 失败时保证核心功能可用。
