# Qt 开发FQA

## 1. Qt 依赖包地址配置

![image-20250910104402079](./image-20250910104402079.png)

![image-20250910104441257](./image-20250910104441257.png)

## 2. 报对某文件的访问被拒绝

```bash
>C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V140\Microsoft.CppClean.targets(76,5): warning : 对路径“d:\project\xxx\bin\debug_x86\xxx.exe”的访问被拒绝。
```

这个错误提示在 Qt 项目编译过程中很常见，通常是由于目标文件被占用或权限不足导致的。

- **关闭正在运行的程序**

- **检查文件权限**

  - 右键`xxx.exe`文件，选择 "属性"

  - 切换到 "安全" 选项卡，确保当前用户有 "修改" 和 "写入" 权限

- **清理并重建项目**

- **以管理员身份运行**

- **检查是否被其他程序占用**

- **修改输出目录权限**

  - 右键`debug_x86`文件夹，选择 "属性"

  - 在 "安全" 选项卡中给当前用户添加完全控制权限

## 3. visualStudio 添加新的.cpp 和 .h 文件时，需要在工作空间点击菜单添加，或修改项目下的 .vcxproj 文件添加

- visualStudio 添加

![image-20250911104306587](./image-20250911104306587.png)

- .vcxproj 文件添加

![image-20250911104537406](./image-20250911104537406.png)

![image-20250911104557661](./image-20250911104557661.png)

- .vcxproj.filters 添加

![image-20250911110558755](./image-20250911110558755.png)

![image-20250911110626492](./image-20250911110626492.png)

:warning:不添加会报这个错误：

```tex
错误 LNK2019 无法解析的外部符号 "public: __thiscall AudioMeter::AudioMeter(class QWidget *)" (??0AudioMeter@@QAE@PAVQWidget@@@Z)，该符号在函数 "public: __thiscall MainWindow::MainWindow(class QWidget *)" (??0MainWindow@@QAE@PAVQWidget@@@Z) 中被引用 uai_clinical_aid 
```





