# Git 自动提交脚本

## 📝 说明

`git-commit-push.sh` 是一个自动化 Git 提交和推送流程的脚本，简化日常开发中的 Git 操作。

## 🚀 使用方式

### 方式 1：使用 npm script（推荐）

\`\`\`bash
# 自动生成提交信息
pnpm git:commit

# 指定提交信息
pnpm git:commit "feat: 添加新功能"
\`\`\`

### 方式 2：直接运行脚本

\`\`\`bash
# 自动生成提交信息
bash scripts/git-commit-push.sh

# 指定提交信息
bash scripts/git-commit-push.sh "feat: 添加新功能"
\`\`\`

## 🔄 工作流程

1. **显示当前状态** - 展示 Git 工作区状态
2. **添加更改** - 自动执行 `git add .`
3. **显示暂存** - 展示即将提交的更改
4. **生成提交信息** - 根据文件类型智能生成或使用用户提供的信息
5. **确认提交** - 询问用户是否确认提交
6. **询问推送** - **重要：推送前会询问用户确认**
7. **执行推送** - 如果用户确认，则推送到远程仓库

## 🎨 提交信息生成规则

脚本会根据更改的文件类型自动生成提交信息前缀：

| 文件类型 | 前缀 | 说明 |
|---------|------|------|
| `*.vue`, `*.ts`, `*.js` | `feat:` | 功能更新 |
| `*.md` | `docs:` | 文档更新 |
| `*.css`, `*.scss` | `style:` | 样式更新 |
| `*config.*`, `.*rc.*` | `chore:` | 配置更新 |
| 其他 | `update:` | 通用更新 |

## 💡 使用示例

### 示例 1：自动提交

\`\`\`bash
$ pnpm git:commit

ℹ 当前 Git 状态：

On branch main
Changes not staged for commit:
  modified:   README.md

ℹ 添加所有更改...
ℹ 暂存的更改：

 README.md | 2 +-

ℹ 分析更改以生成提交信息...

ℹ 请输入提交信息（留空使用默认值：docs: 更新内容）
feat: 更新 README 文档

ℹ 提交信息：feat: 更新 README 文档

是否确认提交？(y/N) y
✓ 提交成功！

ℹ 是否推送到远程仓库？
输入 'y' 推送，其他键跳过： y
ℹ 推送到远程仓库...
✓ 推送成功！
\`\`\`

### 示例 2：指定提交信息

\`\`\`bash
$ pnpm git:commit "fix: 修复登录bug"

ℹ 当前 Git 状态：
...
✓ 提交成功！
\`\`\`

### 示例 3：跳过推送

\`\`\`bash
$ pnpm git:commit
...
✓ 提交成功！

ℹ 是否推送到远程仓库？
输入 'y' 推送，其他键跳过： n
ℹ 跳过推送。您可以使用 'git push' 手动推送。
\`\`\`

## ⚠️ 注意事项

1. **推送前确认** - 脚本会在推送前询问您，避免误推送到远程仓库
2. **图片检测** - 如果暂存区包含图片文件，会触发 pre-commit hook 阻止提交
3. **提交信息** - 建议遵循项目的 Git 提交规范（`feat:`, `fix:`, `docs:` 等）
4. **取消操作** - 在任何确认步骤输入 `n` 或 `N` 即可取消操作

## 🔧 与 Git Hooks 的配合

脚本与项目的 pre-commit hook 完美配合：

- **图片检测** - 自动阻止图片文件提交
- **跳过检测** - 如需提交图片，使用 `SKIP_IMAGE_CHECK=true pnpm git:commit`

## 📚 相关文档

- [CLAUDE.md - Git 工作流](../CLAUDE.md#git-工作流)
- [Git Hooks 说明](../CLAUDE.md#git-hooks)
