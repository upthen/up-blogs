---
title: Qt如何实现一个自定义组件
description: 本文想记录一下定义一个自定义组件的一般方法和步骤
tags: [Qt]
draft: true
---

# Qt如何实现一个自定义组件

## 头文件

```c++
#ifndef AUDIOCONTROLBAR_H // 头文件名，ifndef 和 底部的 #endif 一对
#define AUDIOCONTROLBAR_H

// 组件中使用的 qt 控件
#include <QWidget>
#include <QLabel>
#include <QPushButton>
#include <QTime>

// 自定义控件 ： 继承自 QWidget 控件
class AudioControlBar : public QWidget
{
    Q_OBJECT

// 固定分为以下3个部分：public  signals  private (或者说以下2个部分，public 和 private)
public:
    explicit AudioControlBar(QWidget *parent = nullptr); // 固定写法

    // 设置时间显示
    void setTime(const QTime &time);

    // 获取当前显示的时间
    QTime getTime() const;

 public slots:


// 定义控件绑定的 slots 事件
signals:
    // 暂停按钮点击信号
    void pauseClicked();

    // 停止按钮点击信号
    void stopClicked();

// 定义组件内部的私有变量
private:
    QLabel *timeLabel;           // 时间显示标签
    QLabel *waveformPlaceholder; // 声波特效占位符
    QPushButton *pauseButton;    // 暂停按钮
    QPushButton *stopButton;     // 停止按钮
    QTime currentTime;           // 当前时间

}


#endif // AUDIOCONTROLBAR_H

```
