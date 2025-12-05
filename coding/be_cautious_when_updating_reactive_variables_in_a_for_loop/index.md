---
title: 谨慎的在 for 循环中更新响应式变量
description: 在 vue 中响应式变量的更新会触发页面渲染、computed 计算等操作，因此，如果在for循环中进行响应式变量更新操作，可能导致重复渲染
draft: true
---

# 谨慎的在 for 循环中更新响应式变量

```ts
<script setup>
import { ref, computed, watch } from 'vue'

const msg = ref('Hello World!')
const count = ref(0)
const sum = computed(() => {
  return count.value * 2 + 1
})

const addCount = async () => {
  for (let i = 1; i <= 10; i++) {
    await sleep()
    count.value = count.value + i
  }
}

const sleep = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 100)
  })
}

watch(sum, (value) => {
  console.log('sum newValue', value)
})
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
  <button @click="addCount">Add Count</button>
  <p>{{ sum }}</p>
</template>
```

https://play.vuejs.org/#eNp9U01v2zAM/SucLnYWL2m2nTonWFcU2HbYiq3YLrp4NpOolSVDH0kGw/99lBzHBlbUB1siH8nHR7plN02zOHhk1yy3pRGNA4vONxuuRN1o46AFg9sMSl033mGVwbFw5R462BpdQ0KxCVdclVpZB7XdwToEpMlnlFLDb21k9SqZDYBSe+XOkKuL1fqabEOJNJ3BegMtV0A4543qwxaHQnqE1/AW5rDiqqP4IUNRVbfn1IX9q0qY5NhqA6lEB4K8qw/0yel7RYf5fNZDAIpjIYiIRGxSyhtM06KB3XibgwiQjjiMFGIsAf9nr/AI96SWsJimBq2WBxxBEBR/EDVq76ath+cMHhh1GfEOstGR3rF4HEdKCmaQRnZjhsBLS1xIvUuToDER+RUgSQY9tBcxX/ajp6HTxWHdyMIh3QDy/WrTtnGuXZcv6RatQtGk4PCm1hXKNWfk5wyWvfOPd04r+FhKUT6Rc5gNZ5ubqoJ4zpc9qo9oQo1AMNQIu5cvJyxYxpylXrZit3i0WtGuxvY4CxsjJJrvjRPUK2fXg3RUldbv+DXanPGYDfZyj+XTM/ZHewo2zu5JdDQH5Ozic4XZIfEP7ruf3/BE54uTNPCS0C84f4Qx+sCxh33yqiLaE1xk+yX+cULtHuzdyaGyQ1OBaBx6xHNGP93tC62PdN8t3g+Lyrp/0Q9INQ==
