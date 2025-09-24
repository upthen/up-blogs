---
title: 关于Qt中的 addStretch
description: Qt widget 中 addStrech 
---

# :pushpin:Qt widget 中 addStrech 

---

`addStretch()`是 Qt 布局中用于管理控件间弹性空间的重要方法，它会在布局中添加一个可伸缩的空间（QSpacerItem），帮助控制界面的整体排布和比例。

### 📊 核心机制

`addStretch(int stretchFactor)`的核心是在布局中添加一个**伸缩量**。这个伸缩量会占据**布局中未被其他控件填满的所有剩余空间**。`stretchFactor`参数是一个整数，用于指定多个伸缩量之间**分配剩余空间的比例**，默认值为0。

您可以这样理解：所有 `stretchFactor`的值会相加得到一个总和，每个伸缩量会按自己的 `stretchFactor`值占总和的比例来分得相应的剩余空间。

### 🎯 主要用途与效果

`addStretch()`通过其插入位置和拉伸因子的不同组合，可以实现多种常见的布局效果。

| 应用场景         | 操作方法                                                     | 效果描述                   | 示意图 |
| ---------------- | ------------------------------------------------------------ | -------------------------- | ------ |
| **控件居右**     | 在**第一个控件之前**添加一个 `addStretch()`                  | 所有控件被推向右侧         |        |
| **控件居中**     | 在**第一个控件之前**和**最后一个控件之后**各添加一个 `addStretch()` | 控件整体被推向中间         |        |
| **控件均匀分布** | 在**每两个控件之间**都添加一个 `addStretch()`，且它们的 `stretchFactor`值**相等** | 控件之间的间距相同         |        |
| **按比例分布**   | 在控件之间添加 `addStretch()`，并为它们设置**不同**的 `stretchFactor`值 | 控件间的间距按指定比例分配 |        |

### ⚙️ 参数详解

`addStretch(int stretchFactor)`中的 `stretchFactor`参数决定了该伸缩项在**所有伸缩项**中对**剩余空间**的**分配权重**。

- **默认情况**：如果不指定参数（即 `addStretch()`），其 `stretchFactor`默认为**0**。
- **比例分配**：布局中所有伸缩项的 `stretchFactor`值会加总，每个伸缩项按自身 `stretchFactor`占总和的比例来分配剩余空间。例如，连续调用 `addStretch(1)`, `addStretch(1)`, `addStretch(2)`，则剩余空间会被分为4份（1+1+2），这三个伸缩项分别获得1/4、1/4和2/4的空间。
- **值为0**：`stretchFactor`为0的伸缩项也有其作用。有时它仅作为一个“占位”或“分隔”的标记，具体的布局行为可能结合其他规则（如控件的大小策略）共同决定。

### 🛠 高级用法与技巧

1. **与 `setStretchFactor`结合使用**：`addStretch()`控制的是**空白空间**的分布，而 `setStretchFactor`函数则可以直接控制**控件本身**在布局中拉伸的比例。例如，你可以让一个按钮的宽度是另一个按钮的两倍。两者可以协同工作，实现更精细的布局控制。
2. **替代方案 `addSpacerItem()`**：`addStretch()`快速方便，但灵活性较低。如果需要更精确地控制弹性空间的**初始大小**或**拉伸策略**（例如，指定一个固定的初始宽度或高度，或禁止在某个方向上拉伸），可以使用 `addSpacerItem()`并手动创建一个 `QSpacerItem`对象。`addSpacerItem()`允许自定义宽度、高度和大小策略（如 `QSizePolicy::Expanding`、`QSizePolicy::Fixed`等）。

### 💡 实用提示

- **理解“剩余空间”**：所有关于 `stretchFactor`的计算都是基于布局中的“剩余空间”——即其他非伸缩控件使用其**理想大小（sizeHint）** 或遵循其**大小策略（size policy）** 布局后剩下的空间。
- **大小策略的影响**：控件自身的大小策略（如 `QSizePolicy::Expanding`）会影响其如何与伸缩空间交互。例如，一个具有 `Expanding`策略的 `QLineEdit`会主动争夺剩余空间。
- **混合使用**：在实际布局中，经常混合使用 `addStretch()`、`addWidget()`和 `setStretchFactor`来达到理想的界面效果。

