# git-commit-push

自动化 Git 提交和推送流程。

## 功能

1. 自动执行 `git add .` 添加所有更改
2. 根据更改内容自动生成或使用用户提供的提交信息
3. **在推送前询问用户确认**
4. 如果用户确认，执行 `git push`

## 使用方式

\`\`\`bash
# 方式1：自动生成提交信息
/git-commit-push

# 方式2：指定提交信息
/git-commit-push "feat: 添加新功能"
\`\`\`

## 工作流程

1. 执行 `git status` 查看当前状态
2. 执行 `git add .` 添加所有更改
3. 执行 `git diff --staged` 查看暂存的更改
4. 分析更改内容，生成提交信息建议
5. 执行 `git commit` 创建提交
6. **询问用户是否推送到远程仓库**
7. 如果用户确认，执行 `git push`

## 提交信息生成规则

根据更改的文件类型自动生成提交信息：

- **Vue/TS/JS 文件**：`feat:` / `fix:` / `refactor:`
- **Markdown 文档**：`docs:` / `chore:`
- **样式文件**：`style:`
- **配置文件**：`chore:`

## 安全特性

- Push 前必须用户确认
- 支持跳过 pre-commit hooks（使用 `--no-verify`）
- 遵循项目的 Git 提交规范
