---
title: C++ 编码规范
description: 软件开发，没有规矩，不成方圆，个人的编码习惯需要通过团队统一的开发规范来约束，不然会给团队开发带来灾难。这里整理了一份 C++ 领域的编码规范。
tag: [C++]
---

# :star2: C++编码规范

软件开发，没有规矩，不成方圆，个人的编码习惯需要通过团队统一的开发规范来约束，不然会给团队开发带来灾难。

这里整理了 C++ 领域的一些公认认可度较高的编码规范。

## 谷歌C++编码规范

> [!NOTE]
>
> 简称 GSG，谷歌的 C++ 编程规范，在国内有较大影响力，是企业级规范，对代码的具体样式有细致的规定，可直接采用。
>
> 由于历史原因，GSG 较为保守，通过抑制语言特性以达到规避风险的目的。在早期尚未形成所谓“现代”编程思想的时候，此规范就已经面世并发挥作用了，其中的某些观点可能与 C++ 官方不符，比如 C++ 创始人曾一度认为用常数 0 表示空指针比用 NULL 更好，而 GSG 的观点与之相反，但历史表明 GSG 的观点是正确的，C++11 引入了专属符号 nullptr 以表示空指针的值。
>
> GSG 是实践经验的总结，也在不断发展，目前已适应 C++17，对提升代码可维护性有很高的参考价值。

1. 谷歌官方规范 github 仓库，不只有 c++，还有其他语言。

   [:book: google style guide](https://github.com/google/styleguide)

2. 谷歌开发规范中文版（社区翻译）

   [:book: 谷歌开发规范中文版\_github](https://github.com/zh-google-styleguide/zh-google-styleguide)

   [:earth*africa: 谷歌开发规范中文版*网页版](https://zh-google-styleguide.readthedocs.io/en/latest/contents.html)

## C++ Core Guidelines

> [!NOTE]
>
> 简称 CCG，是 **C++ 创始人**对 C++ 代码编写的宏观指导，属于语言级规范体系，全面地阐述了现代 C++ 编程思想，以规则条款的形式明确地指出哪些是要避免的，哪些是值得提倡的，具有权威性，适合开发者学习。
>
> 由于其篇幅宏大细节繁多，可在相应代码审计工具的支持下作为企业的编程规范和审计依据。

1. C++ 作者编写的C++开发规范

   [:writing_hand: CppCoreGuidelines](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

2. [GitHub - lynnboy/CppCoreGuidelines-zh-CN: Translation of C++ Core Guidelines [https://github.com/isocpp/CppCoreGuidelines\] into Simplified Chinese.](https://github.com/lynnboy/CppCoreGuidelines-zh-CN)
3. [C++ 核心指导方针 | CppCoreGuidelines-zh-CN (lynnboy.github.io)](https://lynnboy.github.io/CppCoreGuidelines-zh-CN/CppCoreGuidelines-zh-CN)



## Qt 编码规范

> 参考资料：[📄Qt Coding Style 中文版](https://wiki.qt.io/Qt_Coding_Style/zh)

##### 缩进

- 采用4个空格
- 空格，不要用TAB！

##### 变量声明

- 每行一个变量
- 尽可能避免短的变量名(比如"a", "rbarr", "nughdeget")
- 单字符的变量只在临时变量或循环的计数中使用
- 等到真正需要使用时再定义变量

```TypeScript
// Wrong 
int a, b; 
char *c, *d;

// Correct 
int height; 
int width; 
char *nameOfThis; 
char '''nameOfThat; 
```

##### **以小写字符开头，后续单词以大写开头(驼峰式)**

- 避免使用缩写

```TypeScript
// Wrong
short Cntr; 
char ITEM_DELIM = '';
// Correct 
short counter; 
char itemDelimiter = '';
```

- 类名总是以大写开头。公有类以Q开头(QRgb)，公有函数通常以q开头(qRgb)。

##### **类的成员变量统一以 m_ 开头**  <sup text-green>团队补充</sup>

```C++
class MainWindow : public QMainWindow //, public QAbstractNativeEventFilter
{
    Q_OBJECT

public:

private：

// Correct
QWidget* m_centralWidget;

// Wrong
QWidget* toolWidget;

};
```

##### 空白

- 利用空行将语句恰当地分组
- 总是使用一个空行(不要空多行)
- 总是在每个关键字和大括号前使用一个空格

```TypeScript
 // Wrong 
 if(foo){
 }
 // Correct 
 if (foo) {
 }
```

- 对指针和引用，在类型和*、&之间加一个空格，但在*、&与变量之间不加空格

```TypeScript
char '''x; 
const QString &myString; 
const char''' const y = "hello"; 
```

- 二元操作符前后加空白
- 类型转换后不加空白
- 尽量避免C风格的类型转换

```C++
 // Wrong
 char* blockOfMemory = (char* )
 malloc(data.size());
 // Correct
 char '''blockOfMemory = reinterpret_cast<char'''>(malloc(data.size()));
```

##### 大括号

- 基本原则：左大括号和语句保持在同一行：

```C++
// Wrong 
if (codec) 
{
}
// Correct 
if (codec) {
} 
```

- 例外：函数定义和类定义中，左大括号总是单独占一行：

 

```C++
static void foo(int g)
{ 
    qDebug("foo: %i", g); 
}

class Moo 
{ 
};
```

- 控制语句的body中只有一行时不使用大括号 <sup text-red font-bold>不采纳</sup>。    **，这个规则定的很混乱，且无意义，下面的例外也不采纳，统一使用大括号**

```C++
 // Wrong 
 if (address.isEmpty()) {
     return false;
 }
 
 for (int i = 0; i < 10; +''i) { 
     qDebug("%i", i);
 } 
 
 // Correct 
 if (address.isEmpty()) 
 return false; 
 
 for (int i = 0; i < 10;i) 
 qDebug("%i", i);
```

- 例外1：如果父语句跨多行，则使用大括号

```C++
 // Correct
 if (address.isEmpty() || !isValid() 
 || !codec) { 
     return false; 
 }
```

- 例外2：在if-else结构中，有一处跨多行，则使用大括号

```C++
 // Wrong 
 if (address.isEmpty()) 
     return false; 
 else { 
     qDebug("%s", qPrintable(address));
     it; 
 } 
 
 // Correct 
 if (address.isEmpty()) { 
     return false; 
 } else { 
     qDebug("%s", qPrintable(address));
     it; 
 } 
 
 // Wrong 
 if (a) 
 if (b) 
 … 
 else 
 … 
 
 // Correct 
 if (a) { 
     if (b) 
         … 
     else 
         … 
 }
```

- 如果控制语句的body为空，则使用大括号

```C++
 // Wrong 
 while (a); 
 // Correct 
 while (a) {}
```

##### 圆括号

- 使用圆括号将表达式分组

```C++
// Wrong 
if (a && b || c) 

// Correct 
if ((a && b) || c) 

// Wrong 
a'' b & c
// Correct 
(a + b) & c 
```

##### Switch 语句

- case 和 switch 位于同一列
- 每一个case必须有一个break(或renturn)语句，或者用注释说明无需break

```C++
switch (myEnum) { 
case Value1: 
     doSomething(); 
     break; 
case Value2: 
     doSomethingElse(); 
// fall through 
default: 
    defaultHandling(); 
    break; 
}
```

##### 断行

- 保持每行短于100 个字符，需要时进行断行
- 逗号放一行的结束，操作符放到一行的开头。如果你的编辑器太窄，一个放在行尾的操作符不容易被看到。

```C++
 // Correct 
 if (longExpression
 + otherLongExpression 
 + otherOtherLongExpression) {
 }
 
 // Wrong
 if (longExpression + 
 otherLongExpression + 
 otherOtherLongExpression) {
 }
```

##### 继承与关键字 `virtual`

- 重新实现一个虚函数时，头文件中 *不* 放置 virtual 关键字。

##### 通用例外

- 如果它使你的代码看起来不好，你可以打破任何一个规则 。

[Categories](https://wiki.qt.io/Special:Categories): 

- [Articles needing cleanup](https://wiki.qt.io/Category:Articles_needing_cleanup)
- [Developing Qt::Guidelines](https://wiki.qt.io/Category:Developing_Qt::Guidelines)

### 更新日志

## C/C++ linter 工具

1. C/C++ Advanced Lint

   > 一个用于 c/c++ 开发的 linter vscode 扩展

## 其他规范

参考文章中热心网友总结的其他各类规范：

[:earth_americas: 各大厂 C/C++ 编程规范详解](https://www.cnblogs.com/lucky-bubble/p/16037810.html)

[:earth_africa: Qt的编程风格与规范](https://www.cnblogs.com/lsgxeva/p/7873568.html)
