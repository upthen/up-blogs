# eslint 三元运算符格式化和缩进规则冲突问题


## 问题描述

eslint 针对条件表达式内容过长的情况下有一套格式化逻辑，但是这套逻辑与缩进规则有冲突。
导致出现以下问题。
- 格式化后缩进出现异常
- 修复缩进异常后，又触发三元表达式格式化规则，又还原为异常的缩进

![image.png](https://p26-juejin-sign.byteimg.com/tos-cn-i-k3u1fbpfcp/647fbbb1cb9648bd9afbd3f4633536c2~tplv-k3u1fbpfcp-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6:q75.awebp?rk3s=bb34011d&x-expires=1756277107&x-signature=53AGj%2F53c6waNUlAbzx4QtGu98w%3D)


![img_v3_02p6_c9504bf9-32b9-42a6-b83a-1be2f1ed0b7g.gif](https://p26-juejin-sign.byteimg.com/tos-cn-i-k3u1fbpfcp/cc8e985c119e4618a2fed8d6285a5334~tplv-k3u1fbpfcp-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6:q75.awebp?rk3s=bb34011d&x-expires=1756277107&x-signature=NTuBI2GkTOpG60%2FC%2BvTAc%2BMKT44%3D)


## 修复方案

在 eslint 中缩进规则模块增加忽略条件表达式的规则。

```ts

indent: ['error', 2, { SwitchCase: 1, ignoreNodes: ['ConditionalExpression'] }],
```

[indent#rule-details](https://eslint.org/docs/latest/rules/indent#rule-details)

>  `"ignoredNodes"` can be used to disable indentation checking for any AST node. This accepts an array of [selectors](https://eslint.org/docs/latest/extend/selectors). If an AST node is matched by any of the selectors, the indentation of tokens which are direct children of that node will be ignored. This can be used as an escape hatch to relax the rule if you disagree with the indentation that it enforces for a particular syntactic pattern.
>  `"ignoredNodes"`可用于禁用对任何AST节点的缩进检查。该选项接收一个[选择器](https://eslint.org/docs/latest/extend/selectors)数组。如果某个AST节点与任意选择器匹配，则该节点直接子级的所有标记的缩进都将被忽略。当您不认同该规则对特定语法模式强制要求的缩进方式时，此功能可作为应急方案来放宽规则限制。



## 结果

![image.png](https://p26-juejin-sign.byteimg.com/tos-cn-i-k3u1fbpfcp/71f85179f19843f49b18e6eae9fc4fae~tplv-k3u1fbpfcp-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6:q75.awebp?rk3s=bb34011d&x-expires=1756277107&x-signature=bXNqbXQv22mP32xVfZlLurhTH%2BQ%3D)