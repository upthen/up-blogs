<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElDialog, ElIcon } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

// API 配置
const API_BASE_URL = 'https://api-worker.zyb-6616.workers.dev';

// 诗词数据类型
interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  type: string;
  content: string;
}

// 状态
const visible = ref(false);
const currentPoem = ref<Poem | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// 今日日期
const today = computed(() => new Date().toISOString().split('T')[0]);

// 存储键
const STORAGE_KEY = 'daily-poem-storage';

// 检查是否需要显示
const checkShouldShow = () => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    if (!storage) return true;

    const data = JSON.parse(storage);
    // 如果是今天，不显示
    return data.lastDate !== today.value;
  } catch (e) {
    console.error('Failed to read storage:', e);
    return true;
  }
};

// 保存弹窗状态
const saveStorage = (poem: Poem) => {
  try {
    const data = {
      lastDate: today.value,
      poemId: poem.id,
      viewed: true
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save storage:', e);
  }
};

// 从 API 获取今天的诗词
const fetchTodayPoem = async (poemType: '诗' | '词' = '词') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/poems/daily?type=${encodeURIComponent(poemType)}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'API returned error');
    }

    currentPoem.value = result.data;
    saveStorage(result.data);
  } catch (e) {
    console.error('Failed to fetch poem:', e);
    error.value = e instanceof Error ? e.message : 'Unknown error';
    // 失败时使用备用诗词
    currentPoem.value = {
      id: -1,
      title: '加载失败',
      author: '未知',
      dynasty: '',
      type: poemType,
      content: '无法从服务器获取诗词，请稍后重试。'
    };
  }
};

// 显示弹窗
const showPoem = async () => {
  loading.value = true;
  error.value = null;
  await fetchTodayPoem('词'); // 默认显示宋词
  if (!error.value) {
    visible.value = true;
  }
  loading.value = false;
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
};

// 格式化内容（将换行符转换为 <br>）
const formatContent = (content: string) => {
  return content.split('\n').map(line => `<p>${line}</p>`).join('');
};

// 暴露方法给外部调用
defineExpose({
  show: () => {
    showPoem();
  },
  refresh: () => {
    // 刷新功能：获取新的诗词并显示，不受每日限制
    loading.value = true;
    error.value = null;
    fetchTodayPoem('词').then(() => {
      if (!error.value) {
        visible.value = true;
      }
      loading.value = false;
    });
  }
});

// 延迟0.1秒显示（几乎立即，但避免页面布局闪烁）
onMounted(() => {
  if (checkShouldShow()) {
    showPoem();
  } else {
    loading.value = false;
  }
});
</script>

<template>
  <el-dialog
    v-model="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :destroy-on-close="false"
    width="600px"
    class="daily-poem-dialog"
    align-center
    @close="handleClose"
  >
    <!-- 卡片内容 - 使用原生 div，无阴影 -->
    <div v-if="currentPoem" class="poem-card">
      <!-- 标题区 -->
      <div class="poem-header">
        <div class="poem-title">
          {{ currentPoem.title }}
        </div>
        <div class="poem-author-dynasty">
          {{ currentPoem.author }} · {{ currentPoem.dynasty }}
        </div>
      </div>

      <!-- 内容区 -->
      <div class="poem-content" v-html="formatContent(currentPoem.content)"></div>

      <!-- 注释区（可选） -->
      <div v-if="currentPoem.notes" class="poem-notes">
        {{ currentPoem.notes }}
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载诗词...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <el-button @click="showPoem" type="primary" plain>重试</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.daily-poem-dialog {
  --poem-bg-light: #ffffff;
  --poem-bg-dark: #1f1f1f;
  --poem-text-light: #000000;
  --poem-text-dark: #ffffff;
  --poem-border-light: #e5e7eb;
  --poem-border-dark: #424242;
  --poem-aux-text-light: #666666;
  --poem-aux-text-dark: #999999;
}

/* 亮色模式 */
[data-theme="light"] .daily-poem-dialog {
  --poem-bg: var(--poem-bg-light);
  --poem-text: var(--poem-text-light);
  --poem-border: var(--poem-border-light);
  --poem-aux-text: var(--poem-aux-text-light);
}

/* 暗色模式 */
[data-theme="dark"] .daily-poem-dialog {
  --poem-bg: var(--poem-bg-dark);
  --poem-text: var(--poem-text-dark);
  --poem-border: var(--poem-border-dark);
  --poem-aux-text: var(--poem-aux-text-dark);
}

:deep(.el-dialog) {
  background-color: transparent;
  padding: 0;
}

:deep(.el-dialog__header) {
  padding: 0;
  border: none;
}

:deep(.el-dialog__headerbtn) {
  color: var(--poem-text) !important;
  font-size: 20px;
  transition: opacity 0.3s;
}

/* 移动端关闭按钮优化 */
@media (max-width: 640px) {
  :deep(.el-dialog__headerbtn) {
    font-size: 24px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

:deep(.el-dialog__headerbtn:hover) {
  opacity: 0.6;
}

:deep(.el-dialog__body) {
  padding: 0 !important;
}

/* 使用原生 div，完全控制样式，无任何阴影 */
.poem-card {
  background-color: var(--poem-bg);
  color: var(--poem-text);
  border: 1px solid var(--poem-border);
  border-radius: 8px;
  overflow: hidden;
  /* 无任何阴影效果 */
}

.poem-header {
  text-align: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid var(--poem-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poem-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--poem-text);
}

.poem-author-dynasty {
  font-size: 15px;
  color: var(--poem-aux-text);
  font-style: normal;
  letter-spacing: 0.5px;
}

.poem-content {
  padding: 32px;
  line-height: 2.2;
  text-align: center;
}

.poem-content p {
  margin: 14px 0;
  font-size: 16px;
  color: var(--poem-text);
}

.poem-notes {
  padding: 0 32px 20px 32px;
  font-size: 14px;
  color: var(--poem-aux-text);
  text-align: center;
  border-top: 1px solid var(--poem-border);
  margin-top: 8px;
  padding-top: 20px;
  font-style: italic;
}

.loading-container {
  padding: 48px;
  text-align: center;
  color: var(--poem-text);
}

.error-container {
  padding: 48px;
  text-align: center;
  color: var(--poem-text);
}

.error-message {
  margin-bottom: 16px;
  color: #f56c6c;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--poem-border);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 淡入动画 */
:deep(.el-dialog) {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==================== 移动端响应式适配 ==================== */

@media (max-width: 640px) {
  :deep(.el-dialog) {
    width: 90vw !important;
    margin: 0 auto;
  }

  .poem-card {
    border-radius: 6px;
  }

  .poem-header {
    padding: 20px 16px 16px 16px;
  }

  .poem-title {
    font-size: 24px;
  }

  .poem-author-dynasty {
    font-size: 14px;
  }

  .poem-content {
    padding: 24px 16px;
  }

  .poem-content p {
    font-size: 15px;
    margin: 12px 0;
  }

  .poem-notes {
    padding: 0 16px 16px 24px;
    font-size: 13px;
  }

  .loading-container {
    padding: 32px 16px;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog) {
    width: 95vw !important;
  }

  .poem-header {
    padding: 16px 12px 12px 12px;
  }

  .poem-title {
    font-size: 22px;
  }

  .poem-author-dynasty {
    font-size: 13px;
  }

  .poem-content {
    padding: 20px 12px;
  }

  .poem-content p {
    font-size: 14px;
    margin: 10px 0;
  }

  .poem-notes {
    padding: 0 12px 12px 20px;
    font-size: 12px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  :deep(.el-dialog__headerbtn) {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
