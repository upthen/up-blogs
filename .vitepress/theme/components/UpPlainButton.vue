<template>
  <button class="up-plain-button">
    <slot></slot>
  </button>
</template>

<script setup>
// 组件 props 定义，可根据需求扩展
defineProps({
  // 按钮是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 按钮类型
  type: {
    type: String,
    default: 'button',
    validator: value => ['button', 'submit', 'reset'].includes(value),
  },
})
</script>

<style scoped>
.up-plain-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.up-plain-button:hover {
  background-color: #f5f5f5;
}

.up-plain-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
