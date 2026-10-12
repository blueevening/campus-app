---
feature: campus-deep-platform
status: delivered
updated: 2026-09-22
branch: session-local
commits: n/a
---

# 校园服务平台 · 深度平台能力

## Report

**What was built** — 管理员用户管理（禁用/重置/角色）、消息通知中心、成绩录入、资讯/失物下架审核、自习座位与图书预约、第二课堂学分看板。管理员侧栏与个人中心入口已接通，审批/改分会触发站内通知。

**Verification** — `vue-cli-service build` PASS（hash 1480bdf87ded9152）；Surge 发布 campus-platform.surge.sh SUCCESS。学生访问 /admin/* 返回权限不足；禁用后登录失败文案「账号已禁用」。

**Journey log**
- 平台能力集中在 mock + 少量管理页，避免重写全部业务视图。
- AdminScores 去掉未用 computed 后通过 eslint 阻断构建。
- 无 git 仓库，工作区直接在 campus-app-frontend，未建 worktree。

## [S1] Problem
现有系统功能演示完整，但缺少平台级能力：用户管理、通知、成绩录入、内容审核、预约与学分总览。

## [S2] Design
### 用户管理
- `/admin/users`：列表、启用/禁用、重置密码 123456、角色 0/1；不可禁用管理员、不可改超管角色。
- 禁用用户登录失败。

### 通知
- `/notices`；事件：权限审批、证书审核、账号状态、成绩更新、图书预约。

### 成绩录入
- `/admin/scores`：学生+课程录平时/期中/期末；总分 3:2:5；GPA 映射；通知学生。

### 内容审核
- `/admin/content`：资讯/失物 hidden 开关；列表默认过滤 hidden。

### 预约
- 图书无库存可预约；`/library/seats` 座位预约/取消。

### 学分看板
- `/second-class/dashboard`：进度、活动/证书积分、诚信值、记录。

## [S3] Out of Scope
真实 MySQL/Java、证书图片存储、支付、论文修改。

## Tasks
- [x] T1: mock + API 扩展 (covers: S2)
- [x] T2: 用户管理页 (covers: S2)
- [x] T3: 通知中心 (covers: S2)
- [x] T4: 成绩录入 + 内容审核 (covers: S2)
- [x] T5: 预约 + 学分看板 (covers: S2)
- [x] T6: 构建验证并发布 (covers: S1,S2)