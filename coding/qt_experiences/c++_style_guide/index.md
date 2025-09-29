---
title: C++ 编码规范
description: 软件开发，没有规矩，不成方圆，个人的编码习惯需要通过团队统一的开发规范来约束，不然会给团队开发带来灾难。这里整理了一份 C++ 领域的编码规范。
tag: [c++]
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

   [:book:  谷歌开发规范中文版_github](https://github.com/zh-google-styleguide/zh-google-styleguide)

   [:earth_africa: 谷歌开发规范中文版_网页版](https://zh-google-styleguide.readthedocs.io/en/latest/contents.html)



## C++ Core Guidelines



> [!NOTE]
>
> 简称 CCG，是 **C++ 创始人**对 C++ 代码编写的宏观指导，属于语言级规范体系，全面地阐述了现代 C++ 编程思想，以规则条款的形式明确地指出哪些是要避免的，哪些是值得提倡的，具有权威性，适合开发者学习。
>
> 由于其篇幅宏大细节繁多，可在相应代码审计工具的支持下作为企业的编程规范和审计依据。

1. C++ 作者编写的C++开发规范

   [:writing_hand: CppCoreGuidelines](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)




## C/C++ linter 工具

1. C/C++ Advanced Lint

   > 一个用于 c/c++ 开发的 linter  vscode 扩展
   > 


## 其他规范

参考文章中热心网友总结的其他各类规范：

[:earth_americas: 各大厂 C/C++ 编程规范详解](https://www.cnblogs.com/lucky-bubble/p/16037810.html)



