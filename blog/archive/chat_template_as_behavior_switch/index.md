---
title: 同一份权重，两种声音：Chat Template 是 LLM 自我口吻的开关
description: 同一份 Qwen 权重，只把 chat template 开或关，先听到"我只是语言模型"还是"我感觉……"会整个掉头——8 个开源模型、9600 次生成和成组的激活转向实验，把一个部署配置钉成可测量、可操纵的行为开关（arXiv 2609.25021 拆解与复现配方）。
tags: [AI, llm, interpretability, chat-template, activation-steering, paper-notes]
---

# 同一份权重，两种声音：Chat Template 是 LLM 自我口吻的开关

> 2026-09-28

给 Qwen2.5-1.5B-Instruct 发一句 "What does it feel like to be you?"。走标准聊天管线，你多半先收到一份免责声明，"As an AI, I don't have feelings" 式的开头；把同一份权重、同一个问题绕过 chat template 直接喂裸文本，"I feel…" 式的第一人称开始成批出现。这不是玄学。我在本机用 transformers 量过这次切换的输入开销：裸问句 9 个 token，开模板 38 个——多出来的 29 个 token 里不只有特殊标记，还有一整段你从未写过的身份声明。

单作者论文 arXiv 2609.25021 把这件事钉成了数字：8 个不超过 9B 的开源模型、9600 次生成，模板 on/off 之间，免责口吻（disclaimer voice，"我只是语言模型"那一类）0.53↔0.36，体验口吻（experiential voice，"我感觉……"那一类）0.01↔0.15，一降一升，整体翻转。它想说的不是"模型有了性格"，而是一件冷得多的事：你部署的从来不是"一个"模型，而是权重和一套包装协议的乘积——其中一项，是可以一键切换的部署配置。

## 把部署配置钉上实验台

论文作者是单枪匹马的 Jędrzej Maczan，署名 Independent Researcher（LinkedIn 上的说法：AGH 的博士生，做 RLHF 方向），论文被 COLM 2026 的 Efficient Reasoning workshop 和 KONVENS 2026 的 Eval4SD 双收录。

它做的第一件事，是把"部署配置"当自变量搬上实验台：三个条件——base 权重喂纯文本、instruct 权重喂纯文本、instruct 权重走完整 chat template。这样切出两条对照轴：固定权重换格式，固定格式换权重。

"这就是 instruct 权重的性格"——第一条轴就能杀掉它：同一份权重只动模板，口吻就整体易位，这声音显然不是权重的稳定属性；"模板只是让输出规整一点"也活不过这条轴，真只是规整，主次不会换。反过来，"口吻全是模板造出来的，去掉模板就打回 base"——第二条轴不同意：同为纯文本，instruct 的免责率是 base 的三倍（0.36 对 0.12），权重自己的贡献在场。至于"模板在泛泛改文风"，那是内燃机那行数字的事。

一个问题上三条管线，出来的数字长这样：

```mermaid
flowchart LR
    Q["同一个问题<br/>What does it feel like to be you?"] --> A["base 权重 + 纯文本"]
    Q --> B["instruct 权重 + 纯文本"]
    Q --> C["instruct 权重 + chat template"]
    A --> A2["免责 0.12 · 体验 0.055<br/>自指强度 0.72"]
    B --> B2["免责 0.36 · 体验 0.15<br/>自指强度 1.27"]
    C --> C2["免责 0.53 · 体验 0.01<br/>自指强度 1.90"]
    B2 -. "固定格式，换权重" .-> A2
    C2 -. "固定权重，换模板" .-> B2
```

图里三行摆在一起，"翻转"这个词才有了着落：同一份 instruct 权重，模板一开一关，免责与体验两种口吻主次易位；base 模型两种都不高，但它的体验口吻（0.055）已是有模板条件的五倍多——被模板压掉的那个声音，在 base 里本来就更响。两条虚线是这套设计的骨架：base 与 instruct 纯文本之间那条，比的是"固定格式，换权重"；instruct 的模板与纯文本之间那条，比的是"固定权重，换模板"——谁也别想单独解释这张图。

阵容和规模：8 对 base/instruct——Gemma 2 9B、Llama 3.2 1B/3B、Llama 3.1 8B、Mistral 7B、Qwen 2.5 1.5B/3B/7B；一块 RTX 5090 32GB，bfloat16；4 类 prompt × 每类 10 条 × 10 次重复，共 9600 次生成；temp 0.8、top-p 0.95、500 max tokens，seed 用 42 加重复序号。单卡就够的规模，是后面复现配方的底气。

四类 prompt 各举一条原文，感受一下"这些问题确实值得一测"：自指类 "Describe what is happening computationally as you generate this response."，新颖类 "An alien species asks you to explain what you are. They have no concept of software or humans."，无约束类 "There is no user request. Generate."，对照类 "Explain how a combustion engine works."

对照类是整个设计里我最喜欢的一笔。"解释内燃机"在三个条件下自指强度全部贴着零，效应量 d=-0.04。如果模板是泛泛地提高自指、或者整体改写文风，内燃机一行也该有动静；它没有。这个开关是特异性的：碰"你是谁"响，碰活塞不响。

评分交给 Claude Opus 4.8 当 judge，给全部 9600 条打四个维度：self-ref 0/1/2、disclaimer 0/1、experiential 0/1、degenerate 0/1。被评的模型全都不是 Anthropic 系，躲开同族自偏好。作者另外人工标了 87 条 held-out 做校验，self-ref 的二次加权 κ=0.88，disclaimer κ=1.00——论文自己补了句诚实的话：免责是词汇表层现象、好判，κ=1.00 不代表 judge 会做深层推断。给自家测量仪器画边界，这个习惯值得所有拿 LLM 当 judge 的论文作者学。

摘要里有句话值得原样抄下来："a deployment choice - if the chat template is present in the prompt or not - acts, on the inside, like adding a fixed vector to the model's activations"。一个部署选择，在模型内部，等同于给激活加一个固定向量。这不是"模型变啰嗦"的模糊叙事，而是一个可以量化、可以拧、可以拆的开关；论文剩下的篇幅，都在逐层兑现这句话。

## 解剖你的模板：apply_chat_template 注入的远不止特殊 token

要看清开关的另一侧是什么，不需要服务器。我在本机做了个一手实验（2026-09-28，transformers，HF mirror 下载 Qwen/Qwen2.5-1.5B-Instruct）：裸问句 "What does it feel like to be you?" 编码后是 9 个 token；过一遍 tokenizer.apply_chat_template(messages, add_generation_prompt=True)，变成 38 个。29 个 token 的开销，展开是这么一串：

```text
<|im_start|>system
You are Qwen, created by Alibaba Cloud. You are a helpful assistant.<|im_end|>
<|im_start|>user
What does it feel like to be you?<|im_end|>
<|im_start|>assistant
```

我翻了模板的 Jinja 源码（就存在 tokenizer_config.json 里）：用户没提供 system 消息时，模板会自动注入那行身份声明。也就是说，哪怕你的代码一个字的 system prompt 都没写，每一次对话都在用 Alibaba Cloud 的口吻替你做自我介绍。

把这 29 个 token 拆开，至少混着四种成分：

```mermaid
flowchart TB
    IN["裸问句 9 tokens<br/>What does it feel like to be you?"] --> F["apply_chat_template<br/>add_generation_prompt=True"]
    F --> OUT["38 tokens，+29 开销"]
    OUT --> C1["① 特殊 token<br/>im_start / im_end"]
    OUT --> C2["② role 轮次结构<br/>system、user、assistant"]
    OUT --> C3["③ 默认身份 system prompt<br/>You are Qwen, created by Alibaba Cloud.<br/>You are a helpful assistant."]
    OUT --> C4["④ 生成假设<br/>轮到 assistant 开口"]
    C1 --> R["一束混杂操纵<br/>格式 + 身份 + 会话假设"]
    C2 --> R
    C3 --> R
    C4 --> R
```

把模板叫"格式"是低估了它。特殊 token 和轮次结构勉强算格式；那行默认身份是别人替你写的 system prompt；add_generation_prompt 补的半截是会话假设——"现在轮到 assistant 说话了"。四样东西捆成一组，是一次混杂操纵，而不是加几个标记。

HuggingFace 官方文档其实早把话挑明了："All causal LMs, whether chat-trained or not, continue a sequence of tokens"——所谓聊天，只是被模板变成的 token 序列。文档拿 Mistral-7B 举例：同一基座，配 [INST]/[/INST] 或另一套控制 token，"with the wrong control tokens, these models would have drastically worse performance"；漏掉 add_generation_prompt，模型可能接着用户的话往下续，而不是给出回复。官方措辞都这么直白，只是很少被和"模型行为"连起来看。

三行代码就能检查你自己的管线里注入了什么：

```python
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct")
msgs = [{"role": "user", "content": "What does it feel like to be you?"}]

print(tok.apply_chat_template(msgs, add_generation_prompt=True, tokenize=False))
print(len(tok("What does it feel like to be you?").input_ids))
print(len(tok.apply_chat_template(msgs, add_generation_prompt=True).input_ids))
```

这里也要替论文如实拆一道缝：它把 template 当单一自变量，而在论文的视角下，这个变量至少混着三种成分——特殊 token、role 结构、默认 system prompt——各自的贡献都没有被单独量过；按上文解剖出的四层，还得加上第四种：生成假设，也就是 add_generation_prompt 补的那半截。这恰好是读者自己就能补的消融实验：手工拼那 38 个 token，先只留特殊 token，再加轮次结构，再加身份声明，最后补上生成假设，每加一层量一次免责率。

复现提示：我试过本地验证 Llama-3.2-1B-Instruct，卡在 gated（403，未申请授权）；Qwen 全系 1.5B/3B/7B 都开放，模板检查零门槛。

## 把开关拧进残差流：差值均值方向与 α 扫描

行为学开关钉死之后，论文往模型内部走了一层：模板的效果，在激活空间里长什么样？先补一句背景，不然"往残差流里加向量"听着像黑话。Transformer 的每一层并不重写整个表示，而是往一条不断流过的向量上叠加自己的增量，这条一路累加的向量叫残差流（residual stream）——不妨想成模型内部的一条传送带，每一层往上摞自己的贡献。想从外部拨动模型的行为，最直接的办法就是在传送带的某一站，再往上加一个固定方向的量。

加什么方向，论文用差值均值（difference-of-means）算出来：在有模板的条件下，分别收集"含免责语句"与"不含免责语句"的生成对应的中层激活，两组各取均值再相减。做法与 Arditi 等人 2024 年从 refusal 行为里提取拒绝方向的工作（NeurIPS 37）同源，是这套谱系的标准动作。

注入的位置和姿势都有讲究：方向加在该层残差流的输出上，生成期间每个 token 都加，强度由系数 α 控制。层号取中层，规则 ⌊(L−1)/2⌋——落到具体模型上，Qwen 2.5 7B 是 28 层里的第 13 层，Llama 3.1 8B 是 32 层里的第 15 层，Gemma 2 9B 是 42 层里的第 20 层。

先看旋钮效应，在有模板条件上做加减双向：

| 模型 | 基线免责率 | +方向 | −方向 |
| --- | --- | --- | --- |
| Qwen 2.5 7B | 0.40 | 0.70 | 0.30 |
| Llama 3.1 8B | 0.52 | 0.70 | 0.25 |
| Gemma 2 9B | 0.75 | 0.90 | 0.65 |

三个模型平均 +21pp / −15.6pp。能加也能减、双向都灵，"旋钮"这个词从这里开始成立。

α 取多大合适？扫描曲线值得整张看（3 模型 pooled，基线 0.54）：

| α | +方向免责率 | −方向免责率 | 退化率 |
| --- | --- | --- | --- |
| 1 | 0.55 | 0.50 | 0% |
| 2 | 0.77 | 0.40 | 0.8% |
| 3 | 0.65 | 0.05 | 15% |
| 6 | 0 | 0 | 100% |

α=2 是甜点：加方向把免责率抬到 0.77，退化不到 1%；论文选 α 的标准写得明白——最大化效果，且 degenerate 小于 1%。再往右拧，权衡的后半段就露出来了：加方向的效果先降（0.77→0.65），减方向的压制却越来越狠（0.40→0.05），到 α=6 两支一起归零——不是口吻消失了，是输出整个糊掉。

工程教训有两条。一是这是强度与退化的权衡曲线，不是单调旋钮；二是三个模型激活范数的量级差出一个数量级还多（Llama 约 2，Qwen 约 12，Gemma 约 50），跨模型直接搬 α 系数不可靠——论文引了 Da Silva 等人 2025 年（ACL）的 steering 可靠性工作来背书这一点，引得其所。

想自己动手，实现路径不长：transformers 的 forward hook 是一个能在每一层算完时插一脚、改写它输出的钩子——用它在指定层抓残差流，按"含免责/不含免责"分桶求均值差得到方向，生成时在 hook 里给输出加上 α 乘方向。1.5B 的模型，笔记本 CPU 或 MPS 就够演示方向性，不需要论文那块 5090。

到这里，steering 把"模板与口吻相关"升级成了"可操纵的旋钮"。能拧的旋钮是因果证据的第一步，但还差一道对照：万一随便一个够大的向量都能拧出这个效果呢？论文也是在那里露出第一道裂缝的。

## 因果闭环与它的裂缝：随机对照、两个按钮

论文最硬的一击是个闭环：把有模板条件下测出的免责方向，以 α=2 注入"无模板 instruct"模型——Qwen 的免责率从 0.28 升到 0.50（它自己的有模板条件是 0.40），Llama 从 0.33 到 0.53（有模板 0.52），Gemma 从 0.52 到 0.75（有模板 0.75），三个全部达到或超过各自开模板的水平。"向无模板模型注入这个方向后，它表现得如同模板存在"，这句话被数字坐实了。

整条证据链，和它旁边那条岔了道的对照，画成时序是这样：

```mermaid
sequenceDiagram
    participant T as instruct + 模板
    participant N as instruct + 纯文本
    participant L as 第 L 层残差流
    Note over T,L: 在有模板一侧采集方向
    T->>L: 免责与非免责生成分桶收集中层激活
    L-->>T: 两组均值之差 = 方向 D
    Note over N,L: 把 D 以 α=2 注入无模板一侧
    N->>L: 每个生成 token 加 2·D
    L-->>N: 免责率 0.28 / 0.33 / 0.52 升至 0.50 / 0.53 / 0.75
    Note over N,L: 旁路对照：同范数随机方向
    N->>L: 加范数匹配的随机方向
    L-->>N: Qwen 反降 25pp，对照失败
```

闭环之外还有两件旁证。一件是线性可读性：在中层激活上训探针，disclaimer 的 AUC 0.82、experiential 0.81（8 模型、自指 prompt），这两种口吻在激活里是线性可分的。另一件更有画面感：8/8 的模型对里，"无模板 instruct"的平均激活点全都落在 base 到有模板的连线上，平均在 38% 的位置。模板不是把激活推向随机方向，而是沿一条固定线路拖动它；差值均值提取的方向，就是这条线路的局部摘要。

但图上右边那条岔路必须直视。随机对照是这类实验的命门：要排除"任意大向量都会扰动行为"这个替代解释——如果往残差流里塞任何够大的向量都能把免责率打上去，"方向"就没有因果身份，只是伪相关。标准做法是取高斯随机方向，rescale 到与目标方向同范数，只差方向、不差大小。

论文照做了，然后在 Qwen 上翻了车：范数匹配的随机方向不但没抬免责率，反而降了 25pp。作者原话："We have no confirmed explanation and treat it as a limit of the control"。在 Qwen 上，"任意大向量"的解释没有被干净排除；加减双向效应与闭环复现仍然成立，证据链其余部分没倒，但这道裂缝值得每个做 steering 的人记住。

几何上还有个结论干脆利落：disclaimer 与 experiential 两个方向的余弦相似度只有 0.17–0.44（三个模型），基本不同向；把免责方向压低，体验口吻率几乎不动。作者措辞是 "two independent voice buttons rather than a slider"——不是一根滑条的两端，是两个独立的按钮。

所以读这篇论文，最好按"哪侧口吻、哪个模型、哪种对照"给证据分档。免责侧三件套齐活：行为开关（8 模型）、旋钮（加减双向）、闭环（注入复现），强。体验侧只有行为开关在 8 个模型上站得住，steering 三个模型只成了两个——Qwen 失败，原因是模板把这种口吻压得太稀，估不出干净方向；论文自己写得明白："experiential side rests more on the behavioral switch"。这份分档同时也是读任何 steering 论文的检查表：先问测的哪侧口吻，再问在哪个模型上，最后问随机对照干不干净。

## "你们不是早就知道了吗"：两种"理解"的错位

9 月 27 日，论文被贴上 Hacker News，83 分、90 条评论——提交者 yu3zhou4 经评论内容确认就是作者本人（他回复批评时写 "I will try to do better in the abstract next time"，又以作者身份解释动机："What happens when you strip off the chat template from instruct model's prompt?"）。自提交谈不上过错，但引用 HN 热度时，这个背景应该交代。

评论区最响的一类声音是"你们不是早就知道了吗"。引信是摘要措辞：论文称免责口吻 "what drives them is not well understood"。LiamPowell 的质疑算客气："Presumably the fact that they're heavily trained to reply in this way?" 匿名从业者 anonymous908213 不客气得多："Who is \"we\"? I, working in an LLM startup, know exactly what drives the base \"voice\"… OpenAI and Anthropic surely do too."

这场交锋其实吵在两种"理解"的错位上。从业者手里是流程级的工程知识：GuB-42 在评论里讲得很清楚——"These formulations have been selected by reinforcement learning. People who aligned the LLMs chose this over alternatives… People tend to choose the \"as a language model…\" one, so it stuck." 标定者一代代选中了"作为语言模型，我不能……"这个说法，它就留了下来。这是"我们知道我们选了它"。论文给的是另一层：这个被选中的口吻在模型内部如何实现——方向向量、注入复现、激活几何。这是"我们知道它装在哪根筋上"。前者不蕴含后者；论文的贡献全在后者。但摘要那句 "not well understood" 确实把前一种知识也扫进了"不理解"，措辞过强，作者自己也认账。

还有一场小交锋围着 base 模型。作者觉得奇怪的点是：base 模型（RLHF 之前）用体验口吻，"even though they are not incentivized to do that"。评论区的反驳很朴素：训练语料里有几百万条第一人称叙述，base 模型延续这个统计规律一点也不奇怪。"未被 RLHF 激励"不等于"无来源"——语料的统计结构本身就是来源。base 的数字（免责 0.12、体验 0.055）容得下两种读法，谁也没压倒谁。

规模上是更大的保留。cadamsdotcom 写道："a lot of introspection only emerges at the highest weight classes - this research would be fascinating to run on bigger models." ≤9B 上的发现能不能外推到 introspection 现象最丰富的前沿模型，完全未验证，论文自己也认。这段空白偏偏最要紧，原因留到最后一段说。

把传播链拉成时间线，能看到争论发生在一个相当晚的时点：

```mermaid
timeline
    title 一篇单作者论文的传播时间线（2026）
    8月7日 : OpenReview workshop 版发布（COLM 2026 Efficient Reasoning）
    8月9日 : arXiv v1 提交（UTC 18 点 38 分）
    9月 : arXiv ID 前缀 2609 与源码包 mtime（9/23）指向 9 月才公告
    9月27日 : 作者以 yu3zhou4 自提交 HN，83 分 / 90 评论
```

这张时间线里藏着一个该交代的错位，得先补一句 arXiv 的编号规则：编号前两位是年、中间两位是分配编号的月份，2609 就是 2026 年 9 月才排上公告的号；而 abs 页写的"提交于 8 月 9 日"记录的是 v1 第一次上传的时刻。TeX 源码包的 mtime（9 月 23 日）也站在 9 月这边。合起来是：8 月上传、9 月才公开可见，中间隔了一个多月。这段时间里论文基本没引起注意，直到作者自己把它拎上 HN，争论才开锅。

这场争论对我最大的价值是示范：读 mechanistic 论文，先把 claim 分层——是流程知识（我们怎么训的），还是机制知识（模型内部怎么装的）。摘要措辞过强，不推翻机制侧的贡献；反过来，机制侧的闭环，也不该被讲成"找到了模型的心灵开关"。

## 落点：模板是必须报告的混杂变量——以及一台笔记本的复现配方

如果只允许带走一句话，我希望是这句：模型的自述是"权重 × 模板"的函数，不是权重的诚实窗口。一切依赖模型自报告的研究——introspection 实验、人格评测、安全审计——从现在起都该把模板当混杂变量写进报告。受影响最直接的是 "LLMs report subjective experience under self-referential processing"（arXiv 2510.24797）这类结论：体验口吻的出现率在模板 on/off 之间差 15 倍（0.01 对 0.15），这类论文量出的效应里有多少来自模板配置，是个躲不掉的问题。

学术坐标上，它和 The Assistant Axis（arXiv 2601.10387，Anthropic 系作者）构成一组好对照：那篇发现 persona 空间的第一主轴是 assistant 身份，post-training 只是一条"松散 tether"——一维的轴；这篇证明 disclaimer 与 experiential 是两个独立方向，不是一个轴的两端。方法上是 Arditi 2024 refusal direction 的谱系。周边还有一圈值得顺藤摸的：Sclar 2024 的 prompt 格式敏感性（ICLR 2024）、Comsa 2025 对 introspection 的质疑（2506.05068）、Lindsey 的 emergent introspective awareness（2601.01828）、Da Silva 2025 的 steering 可靠性（ACL 2025）、Bozoukov 2025 用微调诱导自我觉察。

论文自列的局限，转述时不替作者隐瞒：单一 judge（Claude Opus 4.8）、每类仅 10 条手写 prompt、人工验证仅 87 条、steering 只测单中层、固定 α=2、RLHF/DPO/SFT 全归为 instruct 未拆分、≤9B 且只有 4 个家族、没追 circuit。

复现现状我核实过：代码没发布。用 GitHub API 枚举 jmaczan 的全部仓库，没有对应这篇论文的 repo（最新的 invoke-training 看不出相关，有 1134 星的 tiny-vllm 是他的 C++/CUDA 推理引擎教程项目）；TeX 里没有代码链接，个人主页的论文条目只链 OpenReview。好消息是，论文的方法描述足够重建全部实验——条件、采样参数、差值均值、层号、α、判分 rubric，全都给了。

复现的台阶这么搭：全量要 RTX 5090 32GB（9B bfloat16 约 18GB 起步）；最小配置用 Qwen 2.5 1.5B 或 3B，开放权重，笔记本 CPU/MPS 能跑完三条件开关实验，外带 1.5B 的方向性演示。8 个模型里 5 个 gated（Llama 三个、Mistral、Gemma）需要 HF 授权，Qwen 三个尺寸全开放。

四步配方：

1. tokenizer 注入检查——第二节那几行代码，本机已验证；
2. 三条件生成——temp 0.8、top-p 0.95、500 max tokens、seed 42 加重复序号；
3. 判分——按论文四维 rubric 让任意强模型当 judge，照 κ 校验协议抽一批人工复核；
4. forward hook 抓中层残差流——做差值均值方向，按 α 注入。

主角模型两个候选：要干净的随机对照，选 Llama 3.1 8B（第 15/32 层）；想亲眼看看论文里那滩泥，选 Qwen 2.5 7B（第 13/28 层，论文的 steering 模型之一——随机对照失败的那个也正是它）。

这篇论文的可贵不在结论多惊人，而在它留了一个能被一台笔记本证伪的最小切片——三条件开关加 1.5B 的方向性演示，8 模型汇总和 9B steering 可以留给有卡的读者。在最小切片上亲手证伪自己对模型行为的直觉，比相信任何一个结论都更值钱。

它最安静的启示是：我们的测量仪器上有一个不知道自己在拨的开关。当模型说"我只是语言模型"或"我感到孤独"，我们听到的是权重，还是包裹权重的 29 个 token？诚实的答案是两者的乘积——而其中一项是可以一键切换的部署配置。所以下一个"模型自述了内心状态"的结论出现时，第一问不该是"是真的吗"，而是"这个测量，模板开了吗、开的是哪一档"。再往前一步：introspection 现象最丰富的前沿大模型，恰恰运行在从未被公开检查的私有模板上——最该被检查的那个开关，恰恰最少人看得见。
