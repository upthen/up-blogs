---
title: 基于 `pnpm` + `monorepo` 的前端工程管理实践
description: 本文记录了我在工作中基于 pnpm + monorepo 来管理多个前端项目的工程化实践
draft: true
tags: [fe, monorepo,pnpm, engineering]
---

# 基于 `pnpm` + `monorepo` 的前端工程管理实践

## 背景

我的项目中存在多个技术方案一致的前端项目，各个工程用到的很多资源是可以共用的，比如项目依赖，再比如通用方法，通用组件，通用 `composabes`，等等...。 Eslint, prettier 等配置也存在差别等。

目前各个前端工程在不同仓库各自存储，各自的方案各自实现和维护，一个项目中的方法，只能复制到其他工程使用。

一个方法进行更改优化，其他工程里无法同步生效。项目依赖需要多处安装，且不同工程可能存在版本差异等问题，不利于整体管理和维护，不利于基础能力的积累。

改造为 `monorepo` 仓库对代码进行管理，对通用的依赖，只需全局安装一次，对通用的方法，组件等可以统一维护，多个前端项目统一引用相同依赖项。项目`eslint`, `prettier` 等基础配置统一规范和效果。更加统一的打包流程。

## 什么是`monorepo`

### 概念

**Monorepo**（Monolithic Repository）是一种项目代码管理策略，指在**单个版本控制仓库**中管理多个独立的项目或模块（例如：多个应用、库、工具包）。这些项目虽然共存于一个仓库，但通常通过清晰的目录结构和工具链进行组织和管理，并非简单的代码混合。

### 与 MultiRepo 对比

| 特性        | Monorepo                                                     | MultiRepo                                                    |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 代码可见性  | 所有代码在一个仓库中，全局可见性高，便于跨项目协作和代码复用。 | 代码分散在各个独立仓库，可见性局限于单个项目。               |
| 依赖管理    | 易于统一管理依赖版本。相同依赖可提升到根目录只安装一次，减少冲突和磁盘空间占用。 | 各仓库独立管理依赖，易出现版本不一致、依赖重复安装和冲突问题。 |
| 代码共享    | 极其方便，项目间可以直接通过文件路径或 workspace:协议引用共享代码，简化开发和调试流程。 | 困难，通常需要通过发布到私有仓库再安装，或使用 npm link，流程繁琐。 |
| 工程配置    | 易于统一构建、测试、代码规范等工具和流程，保证项目间的一致性。 | 各项目配置可能不同，维护成本和学习成本较高。                 |
| 构建与CI/CD | 易于实现原子提交和跨项目重构。可利用高级工具进行增量构建、并行构建和远程缓存优化。 | 每个仓库需独立配置CI/CD，跨仓库更改协调成本高。              |
| 权限管理    | 粒度较粗，通常难以精细控制对单个子目录的访问权限。           | 权限控制更精细，可以按仓库分配访问权限。                     |
| 仓库规模    | 仓库会随着项目增加变得庞大，可能影响 git操作（如 clone, pull）的速度。 | 每个仓库体积相对较小，克隆和操作更快。                       |

### 使用场景

Monorepo 非常适合以下情况：

- **大型项目与团队协作**：项目结构复杂，包含多个相互依赖的应用程序、库或服务。
- **微服务架构**：管理多个微服务，并需要共享通用库、配置或工具代码。
- **UI****组件库或工具链开发**：需要同时维护多个相关的包（如 Vue、React 组件库，不同版本的 SDK），并且它们之间存在依赖关系。
- **需要高度统一性的项目**：希望所有项目使用一致的编码规范、构建工具和开发流程。
- **频繁的跨项目****变更**：经常需要同时修改多个项目来完成一个功能或修复。

### 主流 Monorepo 实现方案

实现 Monorepo 有多种方案，主要可分为以下几类：

#### 基于包管理器的方案 (内置工作区支持)

这类方案通常与特定包管理器深度集成，提供基础的 Monorepo 支持，是许多项目的起点。

- **Pnpm Workspaces**: Pnpm **内置**的 Workspace 功能是其一大优势。它通过内容寻址存储和硬链接极大节省磁盘空间和提高安装速度，并通过符号链接严格管理 `node_modules`结构，有效解决“幽灵依赖”问题。其配置文件为 `pnpm-workspace.yaml`。
- **Yarn Workspaces**: Yarn 包管理器**内置**的 Workspace 功能。通过在根目录 `package.json`中配置 `workspaces`字段，可以识别工作区包并将依赖提升到根目录安装，实现依赖共享。
- **Npm Workspaces**: Npm (v7+) 也引入了内置的 Workspace 功能，功能上与 Yarn Workspaces 类似，通过 `npm install -w <package-name>`等方式操作。

#### 构建型与高级管理方案

这类工具在包管理器工作区的基础上，提供了更强大的项目调度、任务运行、缓存和发布管理功能。

- **Turborepo**: 以其**极快的构建速度**著称。核心功能包括**并行****任务执行**、**本地和远程缓存**（避免重复执行相同任务）、**依赖图感知的任务调度**（只构建受影响的项目）。它通常与 Pnpm 或 Yarn 工作区结合使用。

- **Nx**: 提供强大的**代码生成器**、**依赖图可视化**、**分布式****任务执行**（与 Nx Cloud 结合）等功能。它不仅管理构建，还提供一套完整的开发体验，支持多种技术栈。

- **Lerna**: 曾是 JavaScript Monorepo 的**经典工具**，擅长**版本****管理**和**发布**（支持固定模式或独立模式）。现在常与 `pnpm`或 `yarn workspace`结合使用，Lerna 负责发布流程，而包管理器负责依赖安装。

  

## Pnpm 简介

> [pnpm 使用文档](https://pnpm.io/zh/)

### 概述

**Pnpm**（Performance npm）是一个高效的**包管理器**，旨在替代 npm 和 Yarn。其核心优势在于：

- **磁盘空间高效**：使用**内容寻址存储**和**硬链接**，同一版本的包在磁盘上**仅保存一份**，大幅节省空间。
- **安装速度快**：得益于硬链接和高效的缓存机制，依赖安装速度通常快于 npm 和 Yarn。
- **解决幽灵依赖**：使用**符号链接**构建严格的 `node_modules`目录结构，项目只能访问其直接声明的依赖，避免了“幽灵依赖”（未在 package.json 中声明却能使用的依赖）问题。
- **内置 Monorepo 支持**：通过 `pnpm-workspace`提供开箱即用的 Monorepo 管理能力。

### 安装

通过 npm 安装 pnpm：

```Plain
npm install -g pnpm
```

### 使用

Pnpm 的命令与 npm 高度相似，学习成本低：

```Plain
pnpm add <package> # 添加依赖
pnpm install # 安装所有依赖 (可简写为 `pnpm i`)
pnpm update # 更新依赖
pnpm remove <package> # 移除依赖
pnpm run <script> # 运行脚本
```

### 工作空间 (Workspace)

Pnpm 内置了对 **Monorepo** 的原生支持，称为 **Workspace**。

**设置：**

1. 在项目根目录创建 `pnpm-workspace.yaml`文件。
2. 定义工作区包的位置：

```Plain
packages:
  - 'packages/**' # 匹配所有 packages 子目录下的包
  - 'apps/*' # 匹配 apps 目录下的包
  - '!**/test/**' # 排除 test 目录
```

**工作区常用命令：**

```Plain
# 为所有项目安装依赖
pnpm install

# 为指定工作区包 (package-a) 添加外部依赖 (lodash)
pnpm --filter package-a add lodash

# 为指定工作区包 (package-a) 添加内部依赖 (package-b)
pnpm --filter package-a add package-b@workspace:*

# 在所有包中运行 build 脚本
pnpm -r run build

# 仅在 package-a 中运行 dev 脚本
pnpm --filter package-a run dev
```

**工作区协议 (workspace:`)：**

在子包的 `package.json`中，可以通过 `workspace:`协议引用其他本地工作区包，这能确保始终使用工作区内的最新代码：

```Plain
{
  "dependencies": {
    "shared-utils": "workspace:*" // * 表示匹配当前最新版本
    // 或指定明确版本 "shared-utils": "workspace:^1.0.0"
  }
}
```

在发布时，`workspace:*`或 `workspace:^1.0.0`会被自动替换为对应的版本号（例如 `^1.0.0`）。

## 项目 monorepo 实现方案及目录结构

1. ### 实现方案

项目基于 `pnpm` 实现 `monorepo`。

主要改动为将原来的 4 个子项目代码统一迁移到同一个前端工程，并按照合理的目录结构进行代码组织。

基于 `monorepo` 的特性，将 4 个子项目中的项目依赖统一提升到工作空间根目录，进行统一的依赖管理。

并在 `packages` 目录下新增若干个通用方法依赖库，拟对 4 个子项目中用到的通用方法进行总结归纳，实现多项目共用，减少相同功能的重复造轮子操作，同时抹平不同子项目中公共方法的实现差异。

```plaintext
up-monorepo/
├── 项目配置文件/
│   ├── package.json                 # 依赖管理
│   ├── pnpm-workspace.yaml          # 工作空间配置
│   ├── azure-pipelines.yml          # 管道CICD配置
│   ├── .eslintrc.cjs                # eslint 配置
│   ├── .prettierrc.json             # prettier 配置
│   └── .npmrc                       # npm源配置
├── apps/                            # 应用程序目录
│   ├── up-app-1/                         # 视频相关应用
│   │   ├── server/               # laf 服务端
│   │   └── client/                   # 客户端
│   │       ├── client-1/                 # 文件处理模块
│   │       └── client-2/               # 文件上传客户端
│   │       └── ...                   # 支持扩展新客户端
│   ├── up-app-2/                    # 医疗视图应用
│   │   ├── server/     # laf 服务端 (开发工具云)
│   │   └── client/                  # 客户端
│   │       └── triage/              # 分诊业务模块
│   └── ...                          # 支持扩展新应用
├── packages/                        # 共享包目录
│   ├── assets/                      # 公共图片资源
│   ├── components/                  # 公共组件
│   ├── composables/                 # 公共组合式函数
│   ├── utils/                       # 公共工具函数
│   ├── directives/                  # 公共指令
│   ├── plugins/                     # 公共插件
│   ├── vite-plugins/               # 公共自定义vite插件
│   └── floating-ball/              # 悬浮球SDK
└── docs/                           # 文档站点 (预留)
```

#### apps 目录

apps 目录下主要放实际的项目开发代码，不同项目的代码按照文件夹进行区分，根据目前元诊室项目现状，分为四个项目目录：

- up-app-1
  - server：服务端工程
  - Client：客户端工程
    - client-web
    - client-mobile
    - client-miniprogram
- up-app-2
  - server：服务端工程
  - Client：客户端工程
    - client-web
    - client-mobile
    - client-miniprogram
- up-app-3
  - server：服务端工程
  - Client：
    - client-web
    - client-mobile
    - client-miniprogram
- up-app-4
  - server： 服务端工程
  - Client：客户端工程
    - client-web
    - client-mobile
    - client-miniprogram

后续如果有新的项目，按照以上的规则，在 apps 目录下新增文件夹进行项目组织和管理。

#### packages 目录

Packages 目录主要用来放前端开发工程中能够复用的公共依赖。按照不同的依赖类型，进行如下分类：

| 目录                   | 包名                       |
| ---------------------- | -------------------------- |
| packages/components    | @up/components             |
| packages/composables   | @up/composables            |
| packages/utils         | @up/utils                  |
| packages/plugins       | @up/plugins                |
| packages/directives    | @up/directives             |
| packages/assets        | @up/assets                 |
| packages/floating-ball | @up/floating-ball          |
| packages/floating-ball | @up/up-floating-ball-weapp |

后续如果有 apps 下工程可复用的工具，可定期评估并提取到以上的公共包中，积累团队通用能力。

同时，在日常开发中，在提取公共方法时，也需要有更高的要求，尽可能的让我们的**公共方法与具体的项目做到零耦合**，以便相关能力能更多更广的复用到其他工程中，减少重复劳动。

对于当前各个项目中沉淀的通用方法，后续需要**逐步的总结和沉淀成团队方法库**，并定期对各个项目的通用方法进行梳理，**定期总结，持续完善团队方法库**。



## 项目开发指北

### 如何安装依赖？

本项目基于 `pnpm`的方案实现 `monorepo`，因此，启动此项目需使用 `pnpm` 作为包管理器，**不可使用** **`npm`** **或** **`yarn`**

1. 安装 `pnpm`

全局安装 pnpm 包管理工具

```Bash
npm i pnpm -g
```

