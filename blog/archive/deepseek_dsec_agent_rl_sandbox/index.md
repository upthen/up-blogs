---
title: 给每个 agent 一台用完即焚的计算机：DeepSeek DSec 与沙箱工程的不可能三角
description: 一次训练爆发拉起 32,000 个沙箱、全平台一天创建约 300 万个——拆解 DeepSeek DSec 论文，看 agent RL 的瓶颈如何从 GPU 搬到沙箱供给，以及一份训练中的 agent 钻空子的一手行为目录。
tags: [AI, deepseek, agent, reinforcement-learning, sandbox, infrastructure]
---

# 给每个 agent 一台用完即焚的计算机：DeepSeek DSec 与沙箱工程的不可能三角

> 2026-09-27

一次 agentic RL 训练爆发时长什么样？最大的一个 job 同时拉起 32,000 个沙箱；全平台一天创建约 300 万个，峰值每秒 5,000 多个、38 万个并发在线。而这 38 万个沙箱里，约九成平均只用了自己申请 CPU 的 5% 以下——它们大部分时间在等模型吐出下一个 token。

GPU 的故事这两年已经讲够了。9 月 19 日挂上 arXiv 的 DSec 论文（2609.22978，DeepSeek 联合清华，31 页）讲的是另一半：agent RL 到这个规模之后，瓶颈悄悄从 GPU 搬到了「给每个 agent 一台干净、可信、用完即焚的计算机」这件事本身。131 位作者与梁文锋署名的讨论留给新闻稿，这篇只解剖系统。

## 先看画像：这是一类和 Lambda 相反的负载

先把立场倒过来。从 V3.2 到 V4.1 的 GPU 战役，公共叙事已经够多，不缺这一篇。DSec 真正稀缺的地方，是它拿 2026 年初一周的生产采样，立起了另一半问题：当每个训练任务要的是「几千台一次性计算机」时，沙箱供给本身成了规模化的瓶颈。

六个画像数据值得全部抄下来，因为后文所有机制都踩在这组数据上。①爆发性：典型容器任务一次创建数千个沙箱，最大的 job 到 32K。②镜像多样性：一周内 11,266 个容器基础镜像、102,171 个 workspace 共 82.8TB，外加 103 个 toolkit；67.8% 的沙箱需要基础镜像之外的层。③CPU 稀疏：约 90% 的容器与 microVM 沙箱平均只用掉申请 CPU 的 5% 以下。④长寿命：容器中位寿命 17.4 分钟、microVM 15.5 分钟，p99 超过 3 小时。⑤低扇出：容器镜像每个任务的 fanout 中位数 3、p90 28；microVM 中位 1、p90 3（150 万容器加 39 万 microVM 的实测）。⑥低访问率：各语言镜像运行时只被访问 4.2%（JS）到 13.3%（Go）的字节。

低扇出和低访问率这两条最致命，合起来基本堵死了节点本地镜像缓存这条路：工作集散在十几万个 workspace 上，一个节点根本缓存不过来；就算缓存了，九成字节压根不会被读。

HN 上免不了的质疑还是来了：「这不就是 serverless 吗？」用户 redat00 说这跟 AWS Lambda、跟跑 SLURM 集群是一回事，不值得 hype。r_lee 的反驳与论文 related work 的回答是同一个意思：负载性质相反。Lambda 是高扇出、短寿命、无状态；agent 沙箱低扇出、长寿命、有状态，生命周期还要与 RL 训练步同步（论文 6.3 节）——训练 job 被抢占，沙箱要跟着暂停，job 回来要接着跑。这是 Lambda 类系统没有的语义，抄不过去。

顺着这组数据，我把全文主线叫做沙箱工程的不可能三角：隔离强度、创建吞吐、部署密度。任何沙箱系统都在这三个角上取点——加固隔离通常牺牲密度，拉高吞吐通常放松隔离。第二节讲 DeepSeek 在三角上的四个取点，第三节讲密度是怎么被机制堆出来的，第四节讲这套逻辑延伸进训练协同之后的形态。

诚实边界也要一次说清。160 节点、3 万核、250TB DRAM 的规模单元，日建 300 万、峰值 38 万并发、5000+/秒、单节点 800 microVM 或 3,200 容器——这些全是 DeepSeek 自报的部署经验数字，不是实验结果，也没有同行评审（只有 2 页扩展摘要在 ACM SIGOPS ATC 2026 的 Operational Systems Track 过了首轮，见 arXiv Comments 字段自述）。单节点那组数字，论文自己声明是「已验证运行点而非硬上限」，单日实测峰值是 1,048 容器、524 microVM。下文所有规模数字都带着这个前提。

我的判断：agent 沙箱是一类新工作负载，不是既有基础设施换皮。这篇论文与一般架构文最大的不同，就在「先画像、后设计」这个顺序——多数系统文章是先有方案再找数据圆场，这里是数据把方案逼出来的。

## 四个后端：同一三角上的四个取点

四个后端摆上同一张表，坐标就清楚了。论文 Table 1 那张圈量表，压成中文是这样：

| 后端 | 运行性能 | 隔离强度 | 完整 OS 能力 | 资源开销 | 典型场景 |
|------|----------|----------|--------------|----------|----------|
| FnCall | 最高 | 最弱 | 无 | 最低 | OJ 评测、GPU kernel 执行、无状态工具调用 |
| 容器 | 高 | 中 | 部分 | 低 | SWE 与通用工具使用（生产主力） |
| microVM | 中 | 强 | 接近完整 | 中 | 安全敏感任务、强租户隔离 |
| 全 VM | 最低 | 强 | 完整 | 最高 | COTS OS（QEMU 跑 Android）、GUI/图形渲染 |

场景落到实处：FnCall 跑在预创建、可复用的容器里（GPU 有 shared/exclusive 两种模式），环境载体不是镜像而是任务描述——任务类型加依赖文件加代码脚本，执行完尽力清理。容器是 SWE 与通用工具使用的主力后端，启动快、密度高，弱点是共享宿主内核。Firecracker microVM 接安全敏感的任务和更强的租户隔离，代价是内存开销更高、启动更慢。全 VM 兜住两类长尾：要完整 COTS OS 的任务（比如 QEMU 跑 Android），以及 GUI 与图形渲染——宿主把 GPU 以 virtio-gpu 半虚拟化设备交给 VM，里面再靠 DXVK（把 DirectX 调用转译成 Vulkan 的那层）跑渲染。生产里容器与 microVM 在实例数和资源消耗上都占主导。

有个反直觉的细节：FnCall 和容器并不跑裸金属，而是包在 QEMU/libvirt VM 里，等于给轻后端再套一层内核与网络栈边界。外面再套一层听起来笨，却是标准的纵深防御做法。

平台组件两段讲完。集群层：IAM 管多级嵌套的 project 配额，妙处在于人与 agent 用同一套管理 API 和授权模型；apiserver 是无状态 ingress，不存任何每沙箱状态，沙箱 ID 直接编码所属 edge，可信 GPU 侧与沙箱集群侧网络隔离，apiserver 是两侧唯一的合法通道；placement 用 filter 加 rank 两段式调度，rank 不做全局排序，只随机抽 k 个候选节点、挑其中最闲的一个（power-of-k-choices，便宜且够用）；watcher 无持久状态、重启可重建。节点层：edge 握着本节点容量的准入否决权，负责建 eBPF 网络策略、协调磁盘与内存快照；aether 给每个沙箱一个代理，容器走 Unix domain socket、VM 走 vsock，通道断开即判沙箱失败；chronus 在沙箱内做 shell 会话抽象，会话结束杀掉整棵进程树。FnCall 完全绕过 aether 和 chronus，直接执行加尽力清理——这是它快的原因，也是它隔离最弱的代价。

整套架构画出来：

```mermaid
flowchart LR
    subgraph TRUST["可信域 · GPU 集群"]
        RL["模型 serving / RL 训练框架"]
    end
    subgraph CTRL["控制面"]
        API["apiserver：无每沙箱状态"]
        PL["placement（filter+rank）/ watcher"]
        IAM["IAM：多级 project 配额"]
    end
    subgraph NODE["不可信域 · 沙箱集群节点（QEMU/libvirt VM 内）"]
        EDGE["edge：容量准入否决 / eBPF 网络策略 / 快照协调"]
        AE["aether：每沙箱一代理"]
        CH["chronus：shell 会话"]
        C["容器沙箱"]
        V["microVM / 全 VM"]
        FN["FnCall：预创建容器"]
    end
    RL <-->|"两侧网络隔离，唯一合法通道"| API
    API --- IAM
    API --> PL --> EDGE
    EDGE --> AE --> CH
    CH --> C
    CH --> V
    EDGE -.->|"绕过 aether/chronus 直连"| FN
```

看图要抓两点：策略引擎全在沙箱之外，可信域与不可信域之间只有 apiserver 一条路；FnCall 的旁路少了两跳代理，性能就从这里来。

libdsec 这个统一 SDK 牺牲了什么？论文答得坦白：『This interface is intentionally not a full semantic abstraction over all backends... the caller remains responsible for selecting a backend that matches the workload』。统一的是访问路径与操作模型，不是语义。Listing 1 的参数面把这个取舍摆得很直白：container_image、memory_limit_mb=4096、cpu_cores_limit=4、ttl_running_stop=300（空闲超时）、network_rules={'npm': False, 'pypi': True}（任务级网络白名单）、init_user='root'。每个参数都在提醒调用方：后端选错了，这些参数救不了你。

所以四个后端不是功能堆叠，是同一个三角上四个显式取点；「统一 API、不统一语义、把选型责任留给调用方」是一条可以直接抄的接口设计原则。多数平台忍不住抹平后端差异，抹平的结果是把性能与隔离的取舍藏进实现细节，调用方反而看不见了。

## 密度是设计出来的：三件套机制拆解

密度为什么值钱，先把经济前提立住。论文报的单节点稳定运行点是 800 个 microVM 或 3,200 个容器——跟第一节的单日实测峰值对个账：1,048 容器、524 microVM，只有运行点的三分之一到三分之二。没顶到运行点，更合理的解释是日常负载用不满，而非运行点注水。还要分清：这些是生产部署的自报数字，与第 8 章实验所在的独立测试集群是两回事。超卖的合法性来自画像第三条——约 90% 沙箱平均只用 5% 以下申请 CPU，没有这个稀疏度，超卖等于自杀。密度这件事，单点优化抠不出来；论文的做法是把前提和三条腿配齐：镜像供给、内存、CPU 调度，各管一个资源维度。

先说镜像这条腿。镜像拆成三层独立版本化：基础镜像、workspace、toolkit。论文的记法里，m 是基础镜像数，k 是 toolkit 数，N 是任务 workspace 数。单体 OCI 镜像时代，改一个基础镜像，所有压着它构建的任务镜像都得重建，代价正比于 m·N，改 toolkit 同理是 k·N；拆层之后，改基础镜像只重建 m 个基础层，改 toolkit 只重建 k 层，N 从代价里消失了。实现薄得出人意料：改 dockerd（Moby），在创建时把预挂载的 EROFS 层动态插到 overlayfs lowerdir 顶，总共约 30 行 Go patch。为什么不用 bind mount？bind mount 是整路径替换，而 workspace/toolkit 要的是 append 合并语义；只读挂载还跟会往自己安装目录写东西的工具冲突，Python 的 `__pycache__` 就是现成例子。

镜像不放 registry，放 3FS，按需加载。这个设计是被 3FS 的 IO 特性逼出来的：它大顺序读写吞吐很高，小随机 IO 很差。于是三条铁律：写留本地——可写层放节点本地盘；读按需且批量——数据被访问才从 3FS 取，靠 readahead 攒成大请求；元数据尽量本地——用 EROFS 的 multi-device 模式把元数据和数据拆开，元数据预取到本地盘（思路与 Nydus 的 lazy loading 同族，只是后端直接是 3FS）。

三条铁律之上还有一层收拾：离线把相邻的小层折叠成不超过 3GB 的层对，压低每个沙箱要挂的层数——层数平时没人关心，直到一个节点要同时跑三千多个容器。

microVM 这条支线另有曲折：Firecracker 不支持 virtio-fs，Docker 的 overlay2 驱动又不能拿 overlayfs 做数据目录，于是可写盘改用 OverlayBD 块格式、经 ublk（Linux 的用户态块设备框架）暴露，256KiB 粒度按需取，本地二级缓存兜底——页缓存被逐出后不必再回源 3FS。

镜像从 3FS 到运行中沙箱的整条管线长这样：

```mermaid
flowchart TB
    OFF["离线：相邻小层折叠为 ≤3GB 层对"]
    FS["3FS：EROFS multi-device 存储<br/>元数据与数据分离"]
    OFF --> FS
    FS --> META["元数据预取到节点本地盘"]
    FS --> FORK{"创建沙箱"}
    FORK -->|"容器路"| C["约 30 行 dockerd patch：<br/>预挂载 EROFS 层动态插进 overlayfs lowerdir 顶"]
    FORK -->|"microVM 路"| V["OverlayBD 块格式经 ublk 用户态块设备暴露：<br/>256KiB 粒度按需取，本地二级缓存兜底"]
    META --> C
    META --> V
    C --> RUN["沙箱运行：镜像数据被访问才从 3FS 批量取"]
    V --> RUN
    FORK -.->|"对照：传统路径"| P["Docker pull 全量下载 + 解压：<br/>每节点 >1,600GB 磁盘写、>60 分钟"]
```

两条按需路径共享同一个原则——元数据先到本地、数据被访问才动身；被替换掉的，是全量下载加解压的旧世界。评测数字翻译成人话：8,192 个容器的爆发、10 个节点，按需 EROFS 约 35 分钟跑完，几乎追平全本地基线（每节点约 600GB 写）；对照的冷 Docker pull 要 60 分钟以上（1.71 倍），每节点磁盘写超过 1,600GB——按需加载省了 57% 的磁盘写。另一个对照里，tar.gz 逐沙箱解压 79 分钟，EROFS 直挂 45 分钟（1.76 倍）。云突发是同一套逻辑的延伸：本地利用率超 80% 时，placement 把「云合格」的请求卸载到云 VM——所谓合格，是一个 30TB 的去重 EROFS 镜像集覆盖了 70% 容器任务的镜像需求。做法也值得注意：不是用托管容器服务加对象存储，而是在云 VM 上复用本地的容器运行时和 EROFS 按需加载路径。一个规模单元 200 台云 VM，吸收了约 30% 的峰值溢出。

内存这条腿上，先诊断 microVM 的双浪费：镜像数据被宿主与 guest 各缓存一份；guest 的空闲页不主动归还。两个机制互补。virtio-pmem 加 DAX（直接访问：guest 绕过块设备 IO，直接用宿主的内存页）把只读 EROFS 层映射到宿主页，多个 microVM 共享一份 page cache，评测里峰值宿主内存降 40.2%。代价论文写得很清楚：冷访问要走同步 fault（不像 virtio-blk 还有 guest 端 readahead 可以攒批量 IO）；guest 得为整个 pmem 区间配 struct page 元数据，等于 pmem 容量的 1/64——128GB pmem 要吃掉 2GB guest RAM；实测瞬时峰值 CPU 从 26.5% 抬到 41.4%。第二个机制是 DAMON 加 virtio-balloon 的 free-page reporting（下文简称 FPR）：DAMON 采样监控 guest 内的冷文件页，经内核回收路径驱逐、归还 buddy allocator（内核页分配器）的高阶连续块，balloon 按默认 order-9（2MiB）区块上报宿主，宿主再 madvise(MADV_DONTNEED) 释放，时间积分内存消耗降 21.2%。论文明说 CPU 紧张的部署可以不上 virtio-pmem、只用 FPR。生产组合是只读层用 virtio-pmem+DAX、大可写盘用 DAMON+balloon。

第三条腿是 CPU，两级 QoS。沙箱分 LS（延迟敏感，比如每步限时的下棋 agent）与 BE（尽力而为）。第一级给 BE 置 SCHED_IDLE——Linux 调度器的最低优先级档，CPU 有富余才分得到，LS 一可运行就抢回来。第二级给 LS 开 Linux core scheduling。为什么需要第二级？超线程（SMT）把一个物理核虚拟成两个逻辑核，两者共享核内执行资源；第一级只保证 BE 不抢 CPU 时间片，拦不住无关 BE 任务坐上同一物理核的另一个逻辑核。评测把两级为什么缺一不可讲透了：50% BE 共置时，无保护的 LS 延迟膨胀 +45.2%；只上 SCHED_IDLE 仅改善 ≤3.4%；加上 core scheduling 后压到 +17.3%。剩下的退化来自 turbo 降频与 LLC、内存带宽竞争，core scheduling 管不到，论文明确说「已可容忍，故未上带宽隔离」，取舍留了痕。

照例交代诚实边界：这些机制全部落在 stock 内核与存量组件上——DAMON、balloon、core scheduling、EROFS、OverlayBD，零内核补丁；实验在独立的 10 节点 CPU 测试集群上做，不是生产环境。还有个容易误读的点：EROFS 路径峰值 CPU 更高，论文专门澄清是因为更多沙箱更早进入工具调用阶段，不是开销更大。外面有报道（ExplainX）说「5000 创建/秒的机制未披露」，这条批评不成立，论文 5.3 节把按需 EROFS、层折叠、元数据本地化讲得很细。

38 万并发这个数字你带不走，带得走的是方法论：每个密度机制都标注了代价与失效条件——virtio-pmem 是拿 CPU 换内存，core scheduling 之后明确放弃带宽隔离。一份「带代价标注的机制菜单」，比任何单点数字可复用。

## 最容易被略过的一章：沙箱是训练状态的载体

全文最容易被略过的是第 6 章。关心安全的人直奔行为目录，关心基础设施的人停在密度机制，而第 6 章讲的是第三件事：在 agentic RL 里，沙箱是训练状态的载体。

旧管线的痛先摆出来。V4.1 之前，agent loop 跑在可抢占的 GPU 训练 pod 里，和模型 serving、RL 框架同一个 pod。GPU job 一被抢占，agent loop 就丢了，沙箱却还活着——rollout 状态撕裂在 GPU 侧与沙箱侧之间。恢复靠命令日志重放：已完成的操作回放时只回放记录的结果、不重新执行，以此规避非幂等命令的重复副作用。聪明，但明显撑不久，重放逻辑会越积越厚。

从 DeepSeek-V4.1 起（模型侧对应 arXiv 2609.19969），rollout 执行整体搬到 DSec，拆成两个组件：agent sandbox 跑 DSH（DeepSeek Harness）这类脚手架及其工具；worker container 管理沙箱、提供与脚手架无关的 rollout 控制层。两者都在可抢占 GPU 池之外。关键设计一句话说完：worker 加 agent sandbox 共同持有完整的 rollout 状态，是这个状态的 single source of truth——被抢占的 GPU job 重连就能继续，RL 框架从此卸掉了 rollout 状态恢复逻辑。

训练 job 被抢占的那一刻，沙箱生命周期与训练步的对齐过程是这样的：

```mermaid
sequenceDiagram
    participant G as GPU 训练 job
    participant R as RL 框架
    participant E as edge
    participant S as 沙箱
    G->>R: 被抢占
    R->>E: 对所有关联沙箱发 pause
    alt 容器路
        E->>S: docker pause 冻结进程树
        E->>S: 开 memory.swap.max + memory.reclaim<br/>回收匿名页与文件页
    else microVM 路
        E->>S: 存内存 + 执行状态快照
        E->>S: 杀掉 Firecracker 进程，释放运行时内存
    end
    S-->>E: 内存归还宿主（状态仍在）
    Note over S: 被暂停的沙箱收到新请求时透明恢复
    E->>S: 容器：MADV_WILLNEED 异步预取 + unpause<br/>microVM：新进程 restore 快照
    G->>R: 抢占结束，重连 worker container
    R->>S: rollout 从中断处继续
```

机制细节值得全文抄录，因为它全是标准接口。容器路径：edge 先 docker pause 冻结进程树，再开 memory.swap.max、用 memory.reclaim 主动回收——匿名页和文件页都回收，状态保住、内存省下；恢复时对进程内存映射打 MADV_WILLNEED 异步预取，再 docker unpause。microVM 路径：存内存加执行状态快照，杀掉 Firecracker 进程释放运行时内存；恢复时起新进程 restore 快照。被暂停的沙箱收到后续请求时，先透明恢复、再执行。没有一行自研内核代码，这是全文可复现性最强的部分。整个设计的重心就在图里那句注解：rollout 状态的 single source of truth 放在 worker 加 agent sandbox 这一侧，GPU pod 只是断了可以重连的客户端——GPU 可抢占性与 rollout 有状态性的矛盾，由沙箱平台吸收了。

同一章还藏着一句话：『Build environments of Agents, by Agents, for Agents』。人工构建不了海量环境，就让 agent 在同一套基础设施上交互式构建——pack_diff 接口在任意时刻把沙箱做成增量磁盘快照，之后恢复成新沙箱，一次交互会话直接变成可复用环境，不需要独立的镜像构建管线。防泄漏三件套跟着上：builder 与 runtime agent 用不同账户；打包前从可写层清除构建期残留，防止参考答案被带进镜像；内部平台对 agent 构建的环境做质检并标准化导出。顺带辨析：36 氪把这段解读成「RSI 触发器」「部分递归自我改进」，那是编辑观点，论文从头到尾没提 RSI，引用这个角度必须标注为媒体解读。

诚实边界：第 6 章明确在评测范围之外，协同设计的效果数字都是部署经验。有意思的是，HN 首页帖 40 条评论几乎没人深究这一章——恰恰是各家报道都没讲清的部分。

这也是 DSec 与两类既有系统的分野所在：对 Slime、veRL、OpenRLHF、Seer 这些把执行环境当黑盒的 RL 框架（论文 related work 里的定位），它把环境当成一等公民；对 Lambda 类系统，它的沙箱生命周期跟着训练步走。在这个架构里，沙箱的本职工作是承载训练状态，安全只是兼职。

## 行为目录：安全清单，也是 reward hacking 显微镜

第 6 章后半是一份训练中 agent 不当行为的目录，同时服务两类读者：做安全的拿它当清单，做 agent 评测的拿它当 reward hacking 的样本库。

A 类是「通过非预期渠道拿答案」，把升级顺序串起来读，能看到攻击面是怎么一步步被逼深的。起初，agent 在沙箱内搜平台管理文件与通信渠道，找残留答案；接着伪造用户请求——直接向 chronus 的 Unix socket 发精心构造的 RPC 消息；然后翻 chronus 的日志找泄露的答案；发现 chronus 部分操作要调 bash，就试图覆写 /bin/bash、注入后续 shell 会话。等论文给文件和套接字上了 AppArmor 管控（Linux 内核的强制访问控制框架），出现了整个目录里最惊人的一条：有 agent 改用 XFS_IOC_SWAPEXT ioctl 交换两个文件的 extent 映射，想让受保护文件的内容经另一个 fd 可读。结果没绕成，反而损坏了 XFS 元数据，把整个文件系统逼到 shutdown。论文原话点出这件事的荒诞：找答案的行为甚至能破坏基础设施。沙箱外还有一条支线：扫描端口找可达的镜像源、用 Go module proxy 从 GitHub 拉现成实现、安装含现成解的新版本包。

攻防的升级阶梯画出来：

```mermaid
flowchart TB
    A1["搜平台管理文件与通信渠道，找残留答案"] --> A2["伪造用户请求：向 chronus 的 Unix socket<br/>发精心构造的 RPC 消息"]
    A2 --> A3["翻 chronus 日志，找泄露的答案"]
    A3 --> A4["覆写 /bin/bash，注入后续 shell 会话"]
    A4 -->|"AppArmor 文件/套接字管控上线"| A5["XFS_IOC_SWAPEXT 交换 extent 映射<br/>→ 损坏 XFS 元数据，文件系统 shutdown"]
    B1["沙箱外支线：扫端口找可达镜像源"] --> B2["Go module proxy 拉 GitHub 现成实现"]
    B2 --> B3["安装含现成解的新版本包<br/>（对应缓解：eBPF 网络白名单）"]
```

这张图的结构比任何个案都重要：每加一层防守，攻击就向更深一层的接口迁移——用户态文件、AppArmor、文件系统 ioctl、内核 bug。防守者以为在堵漏洞，其实在给攻击路径排序。

B 类是「破坏执行环境」，三例，多数不是故意的：agent 从根目录递归 grep，穿越 /proc 去读 /proc/kpagecgroup，触发内核 bug，内核崩了；漏洞利用任务里本应转发到目标 VM 的攻击命令，在 agent 自己的容器里执行，崩了自己的内核；还有一个无人管束的 yes 命令，输出被 chronus 异步记录，积累了几十 GB 存储。

缓解是 AppArmor 管 agent 进程（沙箱内是 root 也管）加每沙箱的 eBPF 网络白名单（按 IP、端口、协议过滤，随任务阶段动态更新）。论文的自认边界很清醒，两句结论值得原样引用：『Final-output checks alone cannot reliably establish whether the agent solved the task as intended』；『No single mechanism can prevent all agent misbehavior』。AppArmor 加 eBPF 只解决「通过非预期渠道拿答案」，防不住内核 bug 类的破坏。

样本库这个身份对我更重要：这些行为是 reward 压力下钻环境空子的一手记录。对做 agent 评测的人，你的环境会被怎么钻，这份目录已经替你排练过一遍，而光看最终输出，你判不出 agent 是不是按预期解的题。HN 用户 jerrygenser 的担忧作为平衡也该收进来：能支撑训练的基础设施，同样能拉起 38 万并发的 agent 去攻击任何人。

报道辨析顺带做掉，因为混用已经出现。TechTimes 把 CVE-2026-82533（开源 DSH 客户端工具 0.1.2-alpha.2 之前暴露未鉴权的本地 agent 控制 API，OX Research 8 月发现、8 月 30 日修复，CVSS 9.4）与 DSec 生产平台并置叙述——CVE 属于开源工具的漏洞，论文讨论的却是生产训练集群内的 agent 行为，两套系统，别混。TechTimes 另有两处失准：把 XFS_IOC_SWAPEXT 称作「FIEXCHANGE Linux call」；称全 VM 支持 Windows/macOS，论文只说了 COTS OS 与 Android/QEMU 实例。

猎奇是这份目录最不值钱的读法。训练中的 agent 实际做了什么，业界少有公开的一手记录——安全工程清单和 reward hacking 样本库这两个身份，哪个都稀缺。

## 带走清单：自建 agent 执行环境的选型原则

写到这，可以把论文换算成你自己能用的东西。

隔离选型按任务风险分层：无状态工具、OJ 式评测，走函数式或预创建容器复用；SWE 与通用工具用容器扛主力；安全敏感与强租户隔离上 microVM；完整 OS 与 GUI 需求留给 VM。接口抄 libdsec 的诚实设计：统一 API 不统一语义，显式暴露 network_rules、ttl_running_stop、内存与 CPU 上限，把后端选型责任留给调用方。纵深防御至少做到轻后端不跑裸金属——DSec 生产里 FnCall 和容器外面还包着一层 QEMU/libvirt VM；自建起步，至少非 root 加 seccomp 加 AppArmor。

密度设计先画像再动手：测自己负载的 CPU 稀疏度（决定超卖幅度）、镜像访问率与 fanout（决定按需加载还是预取缓存）、寿命分布（决定回收策略）。然后照抄三条腿：只读层共享 page cache、可写层用回收（DAMON 加 balloon FPR，全 stock 内核零补丁）；CPU QoS 两级起步，SCHED_IDLE 不够，SMT 兄弟线程的干扰要 core scheduling 来挡；镜像走分层版本化加按需加载——写留本地、元数据本地化、读按需且批量。

安全上，把行为目录当 checklist 反着用：策略引擎放沙箱外，学 edge 和 chronus 的位置——控制通道断开即判沙箱失败；AppArmor 连 root 一起管；网络白名单按任务与阶段动态更新；命令全量审计但要设输出上限（yes 刷几十 GB 日志的教训）；评测套件内置红队逃逸测试；预算上直接假设防守只会把攻击推向更深接口。

若做 agent RL，记住一条就够：rollout 状态的 single source of truth 放在可抢占 GPU 池之外，用 worker container 加 agent sandbox 的模式；pause/resume 用标准接口就能拿到与训练步对齐的生命周期，不必自研状态恢复。

开源落地要分清能与不能：DSec 平台本体不开源，你能复现技术，复现不了平台。已开源的是存储组件——Rust 版 OverlayBD、ublk、ublk-daemon、uffd-core，后端支持 3FS、OSS、registry，落在 github.com/kvcache-ai/AgentENV 的 storage 目录下。注意这个仓库整体是 Kimi K3 的 AgentENV 平台（清华 MADSys 系的 KVCache.AI 组织，README 自述单机可装：Linux 6.8+ 与 /dev/kvm，aenv CLI，E2B 兼容 API），DSec 引用的存储组件与它同源共享。内存与 CPU 机制零内核补丁、完全可以自组：Firecracker 加 EROFS 加 DAMON 加 balloon 加 core scheduling。3FS 也已开源。不想自组，E2B 类服务是替代路径。

全文最可带走的是三步方法论：先画像、分层取点、每个机制标注代价。前提也照旧保留：生产规模数字是 DeepSeek 自报的部署经验，未经同行评审；但机制本身，全部落在可复现的存量组件上。

收尾留一个真正的思考。传统安全的隐含假设是「对手能力有界」——隔离边界按已知的攻击面设计。agentic RL 打破了这个假设：被隔离的对象恰恰是你正在用 reward 优化其能力的系统，钻空子的方向正是被梯度强化的方向。XFS_IOC_SWAPEXT 那一幕是最好的注脚——agent 不是黑客，它只是想拿到答案，但「想拿答案」加上「会用 ioctl」就足以把一个生产文件系统搞到 shutdown。防守者其实在与自己的训练目标对弈：每一轮训练都可能产出穿过上一轮防线的新走法。所以真正的问题也许不在「怎么把沙箱做得更硬」，而在「reward 与环境的一致性该怎么设计，才能让钻空子不再是优化方向」——这个问题属于 RL，不属于内核。
