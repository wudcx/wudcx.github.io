# 个人博客：从 VuePress 切换到 Vue+Vite 版本

## TL;DR

> **Quick Summary**: 将 GitHub Pages 上的 VuePress 博客备份，然后替换为 `~/code3/workbench` 的 Vue+Vite 版本并重新部署
> 
> **Deliverables**:
> - `vuepress-backup` 分支保存完整的 VuePress 版本
> - main 分支更新为 Vue+Vite 版本并正常部署
> 
> **Estimated Effort**: Small — 简单文件替换
> **Parallel Execution**: NO — 顺序执行
> **Critical Path**: 备份 → 替换代码 → 修改配置 → 提交部署

---

## Context

### Original Request
用户想要：
1. 保存当前部署的 VuePress 版本到分支
2. 使用 ~/code3/workbench 的 Vue+Vite 版本创建新博客
3. 部署到 GitHub Pages

### Interview Summary
- **备份分支**: 需要创建 `vuepress-backup` 分支
- **代码来源**: ~/code3/workbench，只拷贝文件，不带 git 历史
- **部署方式**: GitHub Actions 推送 main 分支自动部署

### Technical Findings
- **当前项目**: VuePress + vuepress-theme-hope，build 输出 `src/.vuepress/dist`
- **新项目**: Vue + Vite + markdown-it，build 输出 `dist`
- **部署配置**: `.github/workflows/deploy-docs.yml` 需要修改

---

## Work Objectives

### Core Objective
完成博客技术栈切换：VuePress → Vue+Vite，同时保留原版本可恢复

### Concrete Deliverables
1. 创建 `vuepress-backup` 分支保存当前完整代码
2. main 分支替换为 ~/code3/workbench 代码
3. 修改 package.json scripts
4. 修改 GitHub Actions workflow 构建命令和输出目录
5. 验证 GitHub Pages 正常部署

### Definition of Done
- [ ] GitHub 显示 `vuepress-backup` 分支存在
- [ ] main 分支包含 Vue+Vite 版本代码
- [ ] GitHub Actions workflow 成功运行
- [ ] GitHub Pages 显示新版本博客

### Must Have
- 原 VuePress 版本完整备份
- 新版本可正常本地运行 `npm run dev`
- GitHub Actions 可正常构建部署

### Must NOT Have
- 不删除远程已有的 `gh-pages` 分支
- 不丢失任何现有文章内容（~/code3/workbench 的内容来自独立来源）

---

## Execution Strategy

### Sequential Steps (不可并行 — 简单替换任务)

```
Step 1: 创建备份分支
Step 2: 备份原 src 目录内容到 backup 位置（如果需要）
Step 3: 替换代码（删除旧文件，拷贝新文件）
Step 4: 修改 package.json（scripts 已正确）
Step 5: 修改 GitHub Actions workflow
Step 6: 提交并推送
Step 7: 验证部署
```

---

## TODOs

- [ ] 1. 创建 vuepress-backup 分支保存当前版本

  **What to do**:
  - 创建分支 `vuepress-backup` 基于当前 HEAD
  - 推送到 origin
  - 验证分支存在

  **Must NOT do**:
  - 不要删除任何现有分支
  - 不要修改任何文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单 git 分支操作
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Step 2
  - **Blocked By**: None

  **References**:
  - `git branch vuepress-backup` — 创建分支命令
  - `git push origin vuepress-backup` — 推送分支

  **Acceptance Criteria**:
  - [ ] `git branch -a | grep vuepress-backup` 显示分支
  - [ ] `git log vuepress-backup --oneline -1` 显示当前 HEAD

  **QA Scenarios**:

  \`\`\`
  Scenario: 验证备份分支创建成功
    Tool: Bash
    Preconditions: 当前仓库干净
    Steps:
      1. Run: git branch vuepress-backup
      2. Run: git push origin vuepress-backup
      3. Run: git branch -a | grep vuepress-backup
    Expected Result: 输出包含 "vuepress-backup"
    Failure Indicators: 分支不存在或推送失败
    Evidence: terminal output showing branch creation
  \`\`\`

  **Commit**: NO

---

- [ ] 2. 替换项目代码为 ~/code3/workbench 版本

  **What to do**:
  - 删除当前 src 目录（旧 VuePress 内容）
  - 复制 ~/code3/workbench/src 到当前目录
  - 删除当前 dist, public, index.html, vite.config.ts（旧配置）
  - 复制 ~/code3/workbench 的 dist, public, index.html, vite.config.ts, package.json, tsconfig.json
  - 保留 .github/workflows（需修改）和 .git 目录

  **Must NOT do**:
  - 不要删除 .github 目录（workflow 在里面）
  - 不要删除 .git 目录
  - 不要删除 node_modules

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 文件复制操作，简单直接
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Step 4
  - **Blocked By**: Step 1

  **References**:
  - `~/code3/workbench/` — 源文件位置
  - 当前目录结构需保留：`.github/`, `.git/`

  **Acceptance Criteria**:
  - [ ] `ls src/` 显示 Vue+Vite 项目结构（App.vue, main.ts 等）
  - [ ] `cat package.json | grep '"name"'` 显示 "vue-blog"
  - [ ] `test -f vite.config.ts` 确认文件存在

  **QA Scenarios**:

  \`\`\`
  Scenario: 验证代码替换成功
    Tool: Bash
    Preconditions: 已执行文件替换
    Steps:
      1. Run: ls src/
      2. Run: test -f src/App.vue && echo "EXISTS"
      3. Run: test -f vite.config.ts && echo "EXISTS"
      4. Run: cat package.json | grep '"name"'
    Expected Result: src/ 包含 App.vue, main.ts 等；package.json name 为 "vue-blog"
    Failure Indicators: 文件缺失或内容不符
    Evidence: terminal output showing correct file structure
  \`\`\`

  **Commit**: NO

---

- [ ] 3. 修改 GitHub Actions workflow 以适配新构建

  **What to do**:
  - 修改 `.github/workflows/deploy-docs.yml`:
    - 构建命令从 `npm run docs:build` 改为 `npm run build`
    - 输出目录从 `src/.vuepress/dist` 改为 `dist`
  - 确保 workflow 其他部分保持不变

  **Must NOT do**:
  - 不要修改 branch 名称（保持 gh-pages）
  - 不要修改 node 版本配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单配置文件修改
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Step 6
  - **Blocked By**: Step 2

  **References**:
  - `.github/workflows/deploy-docs.yml` — 需要修改的文件
  - ~/code3/workbench/package.json scripts — 正确命令参考

  **Acceptance Criteria**:
  - [ ] `grep "npm run build" .github/workflows/deploy-docs.yml` 成功
  - [ ] `grep "folder: dist" .github/workflows/deploy-docs.yml` 成功

  **QA Scenarios**:

  \`\`\`
  Scenario: 验证 workflow 修改正确
    Tool: Bash
    Preconditions: 已修改 workflow 文件
    Steps:
      1. Run: grep -E "npm run (docs:)?build" .github/workflows/deploy-docs.yml
      2. Run: grep "folder:" .github/workflows/deploy-docs.yml
    Expected Result: 显示 "npm run build" 和 "folder: dist"
    Failure Indicators: 仍显示旧命令或旧目录
    Evidence: terminal output showing corrected workflow
  \`\`\`

  **Commit**: NO

---

- [ ] 4. 提交并推送所有更改

  **What to do**:
  - 添加所有更改到 git
  - 创建 commit，message 说明切换到 Vue+Vite 版本
  - 推送到 origin main
  - 触发 GitHub Actions 自动部署

  **Must NOT do**:
  - 不要强制推送
  - 不要修改其他分支

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单 git 操作
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Step 3

  **References**:
  - `git status` — 查看更改
  - `git add . && git commit -m "switch: VuePress → Vue+Vite"` — 提交命令
  - `git push origin main` — 推送命令

  **Acceptance Criteria**:
  - [ ] `git log origin/main --oneline -1` 显示新 commit
  - [ ] GitHub Actions workflow 被触发

  **QA Scenarios**:

  \`\`\`
  Scenario: 验证推送成功
    Tool: Bash
    Preconditions: 已执行 git commit
    Steps:
      1. Run: git push origin main
      2. Run: git log --oneline -1
    Expected Result: 推送成功，显示新 commit
    Failure Indicators: 推送失败或网络错误
    Evidence: terminal output showing successful push
  \`\`\`

  **Commit**: NO

---

- [ ] 5. 验证 GitHub Actions 和 GitHub Pages 部署

  **What to do**:
  - 检查 GitHub Actions 运行状态
  - 等待 deployment 完成
  - 确认 GitHub Pages 显示新版本

  **Must NOT do**:
  - 不要修改任何代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 验证检查
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Step 4

  **References**:
  - https://github.com/wudcx/wudcx.github.io/actions — Actions 页面
  - https://wudcx.github.io — 博客地址

  **Acceptance Criteria**:
  - [ ] GitHub Actions 显示 "deploy-gh-pages" job 成功
  - [ ] GitHub Pages URL 可访问

  **QA Scenarios**:

  \`\`\`
  Scenario: 验证 GitHub Pages 部署成功
    Tool: Bash
    Preconditions: Git push 完成
    Steps:
      1. Run: gh run list --limit 1 (检查最近 workflow)
      2. Wait for deployment to complete
      3. Check if site is accessible via curl or browser
    Expected Result: Workflow 成功，网站可访问
    Failure Indicators: Workflow 失败或网站 404
    Evidence: workflow status and site response
  \`\`\`

  **Commit**: NO

---

## Final Verification Wave

- [ ] F1. **分支完整性检查** — 验证 vuepress-backup 包含所有原始文件
- [ ] F2. **代码替换完整性** — 验证新代码结构正确
- [ ] F3. **Workflow 正确性** — 验证 GitHub Actions 配置
- [ ] F4. **部署验证** — 验证 GitHub Pages 正常显示

---

## Success Criteria

### 验证命令
```bash
git branch -a | grep vuepress-backup  # vuepress-backup 分支存在
ls src/App.vue                         # 新代码存在
cat .github/workflows/deploy-docs.yml | grep "folder: dist"  # workflow 正确
gh run list --limit 1                  # workflow 已触发
```

### Final Checklist
- [ ] vuepress-backup 分支已创建并推送
- [ ] main 分支包含 ~/code3/workbench 代码
- [ ] GitHub Actions workflow 已修改
- [ ] GitHub Pages 正常部署新版本
