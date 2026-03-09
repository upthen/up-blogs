#!/bin/bash

# git-commit-push - 自动化 Git 提交和推送流程
# 使用方式：
#   ./scripts/git-commit-push.sh [提交信息]
#
# 示例：
#   ./scripts/git-commit-push.sh
#   ./scripts/git-commit-push.sh "feat: 添加新功能"

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 检查是否在 Git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是 Git 仓库"
    exit 1
fi

# 显示当前状态
print_info "当前 Git 状态："
echo ""
git status
echo ""

# 检查是否有更改（包括未跟踪的文件）
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    print_warning "没有检测到任何更改"
    exit 0
fi

# 添加所有更改
print_info "添加所有更改..."
git add .

# 显示暂存的更改
print_info "暂存的更改："
echo ""
git diff --staged --stat
echo ""

# 生成或使用提供的提交信息
COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
    # 分析更改并生成提交信息
    print_info "分析更改以生成提交信息..."

    # 获取更改的文件列表
    CHANGED_FILES=$(git diff --cached --name-only)

    # 分析文件类型
    HAS_VUE=false
    HAS_TS=false
    HAS_MD=false
    HAS_CSS=false
    HAS_CONFIG=false

    while IFS= read -r file; do
        if [[ "$file" == *.vue ]]; then
            HAS_VUE=true
        elif [[ "$file" == *.ts ]]; then
            HAS_TS=true
        elif [[ "$file" == *.md ]]; then
            HAS_MD=true
        elif [[ "$file" == *.css ]] || [[ "$file" == *.scss ]]; then
            HAS_CSS=true
        elif [[ "$file" == *config.* ]] || [[ "$file" == .*rc.* ]]; then
            HAS_CONFIG=true
        fi
    done <<< "$CHANGED_FILES"

    # 生成提交信息前缀
    if [ "$HAS_VUE" = true ] || [ "$HAS_TS" = true ]; then
        TYPE="feat"
    elif [ "$HAS_MD" = true ]; then
        TYPE="docs"
    elif [ "$HAS_CSS" = true ]; then
        TYPE="style"
    elif [ "$HAS_CONFIG" = true ]; then
        TYPE="chore"
    else
        TYPE="update"
    fi

    # 生成默认提交信息
    DEFAULT_MSG="${TYPE}: 更新内容"

    # 提示用户输入提交信息
    echo ""
    print_info "请输入提交信息（留空使用默认值：${DEFAULT_MSG}）"
    read -r USER_INPUT

    if [ -z "$USER_INPUT" ]; then
        COMMIT_MSG="$DEFAULT_MSG"
    else
        COMMIT_MSG="$USER_INPUT"
    fi
fi

# 显示提交信息
echo ""
print_info "提交信息：${COMMIT_MSG}"
echo ""

# 确认提交
read -p "是否确认提交？(y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "取消提交"
    exit 0
fi

# 执行提交
print_info "创建提交..."
git commit -m "$COMMIT_MSG"

print_success "提交成功！"

# 询问是否推送
echo ""
print_info "是否推送到远程仓库？"
read -p "输入 'y' 推送，其他键跳过： " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "推送到远程仓库..."
    git push
    print_success "推送成功！"
else
    print_info "跳过推送。您可以使用 'git push' 手动推送。"
fi
