<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElDialog, ElButton, ElCard, ElTag, ElIcon } from 'element-plus';
import { Close, Share } from '@element-plus/icons-vue';
import { poems } from '../../../data/poems';
import dayjs from 'dayjs';

// 状态
const visible = ref(false);
const currentPoem = ref<InstanceType<typeof poems>[0] | null>(null);
const loading = ref(true);

// 今日日期
const today = computed(() => dayjs().format('YYYY-MM-DD'));

// 存储键
const STORAGE_KEY = 'daily-poem-storage';

// 检查是否需要显示
const checkShouldShow = () => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    if (!storage) return true;

    const data = JSON.parse(storage);
    // 如果是今天，不显示
    return data.lastDate !== today;
  } catch (e) {
    console.error('Failed to read storage:', e);
    return true;
  }
};

// 保存弹窗状态
const saveStorage = (poem: InstanceType<typeof poems>[0], index: number) => {
  try {
    const data = {
      lastDate: today.value,
      poemIndex: index,
      poemId: poem.id,
      viewed: true
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save storage:', e);
  }
};

// 获取今天的词
const getTodayPoem = () => {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    if (storage) {
      const data = JSON.parse(storage);
      // 如果有记录，使用上次的索引 + 1
      const nextIndex = (data.poemIndex + 1) % poems.length;
      currentPoem.value = poems[nextIndex];
      saveStorage(poems[nextIndex], nextIndex);
    } else {
      // 首次访问，使用第一首
      currentPoem.value = poems[0];
      saveStorage(poems[0], 0);
    }
  } catch (e) {
    console.error('Failed to get today poem:', e);
    currentPoem.value = poems[0];
  }
};

// 显示弹窗
const showPoem = () => {
  loading.value = true;
  getTodayPoem();
  visible.value = true;
  loading.value = false;
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
};

// 分享功能（预留）
const handleShare = () => {
  if (navigator.share && currentPoem.value) {
    navigator.share({
      title: `【${currentPoem.value.title}】${currentPoem.value.author}`,
      text: currentPoem.value.content,
      url: window.location.href
    }).catch(console.error);
  }
};

// 格式化内容（将换行符转换为 <br>）
const formatContent = (content: string) => {
  return content.split('\n').map(line => `<p>${line}</p>`).join('');
};

// 朝代标签颜色
const dynastyColor = computed(() => {
  return currentPoem.value?.dynasty === '北宋' ? 'danger' : 'warning';
});

// 延迟1秒显示
onMounted(() => {
  if (checkShouldShow()) {
    setTimeout(() => {
      showPoem();
    }, 1000);
  } else {
    loading.value = false;
  }
});
</script>

<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="false"
    width="600px"
    class="daily-poem-dialog"
    align-center
  >
    <!-- 卡片内容 -->
    <el-card v-if="currentPoem" class="poem-card" shadow="hover">
      <!-- 标题区 -->
      <div class="poem-header">
        <div class="poem-title">
          {{ currentPoem.title }}
        </div>
        <el-tag :type="dynastyColor" size="small">
          {{ currentPoem.dynasty }}
        </el-tag>
        <div class="poem-author">
          {{ currentPoem.author }}
        </div>
      </div>

      <!-- 内容区 -->
      <div class="poem-content" v-html="formatContent(currentPoem.content)"></div>

      <!-- 注释区（可选） -->
      <div v-if="currentPoem.notes" class="poem-notes">
        {{ currentPoem.notes }}
      </div>

      <!-- 按钮区 -->
      <div class="poem-footer">
        <el-button type="primary" @click="handleClose">
          <el-icon><Close /></el-icon>
          关闭
        </el-button>
        <el-button @click="handleShare" :disabled="!navigator.share">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
      </div>
    </el-card>

    <!-- 加载中 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载诗词...</p>
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
  --poem-shadow-light: rgba(0, 0, 0, 0.1);
  --poem-shadow-dark: rgba(255, 255, 255, 0.1);
}

/* 亮色模式 */
[data-theme="light"] .daily-poem-dialog {
  --poem-bg: var(--poem-bg-light);
  --poem-text: var(--poem-text-light);
  --poem-border: var(--poem-border-light);
  --poem-shadow: var(--poem-shadow-light);
}

/* 暗色模式 */
[data-theme="dark"] .daily-poem-dialog {
  --poem-bg: var(--poem-bg-dark);
  --poem-text: var(--poem-text-dark);
  --poem-border: var(--poem-border-dark);
  --poem-shadow: var(--poem-shadow-dark);
}

:deep(.el-dialog) {
  background-color: transparent;
  padding: 0;
}

:deep(.el-dialog__body) {
  padding: 0 !important;
}

.poem-card {
  background-color: var(--poem-bg);
  color: var(--poem-text);
  border: 1px solid var(--poem-border);
  box-shadow: var(--poem-shadow);
  border-radius: 8px;
  overflow: hidden;
}

.poem-header {
  text-align: center;
  padding: 24px 24px 12px 24px;
  border-bottom: 1px solid var(--poem-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.poem-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--poem-text);
}

.poem-author {
  font-size: 14px;
  color: var(--poem-text);
  opacity: 0.8;
  font-style: italic;
}

.poem-content {
  padding: 32px;
  line-height: 2;
  text-align: center;
}

.poem-content p {
  margin: 12px 0;
  font-size: 16px;
  color: var(--poem-text);
}

.poem-notes {
  padding: 0 32px 16px 32px;
  font-size: 14px;
  color: var(--poem-text);
  opacity: 0.7;
  text-align: center;
  border-top: 1px solid var(--poem-border);
  margin-top: 8px;
  padding-top: 16px;
}

.poem-footer {
  padding: 16px 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--poem-border);
}

.loading-container {
  padding: 48px;
  text-align: center;
  color: var(--poem-text);
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
</style>
