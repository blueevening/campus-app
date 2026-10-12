---
feature: campus-showcase-dark
status: delivered
updated: 2026-09-22
branch: session-local
commits: n/a
---

# 作品展示站 · 深色科技产品页

## Report

**What was built** — 推倒旧展示站，按 Linear / Apple Event 深色产品页重写：Hero 大标题 + CSS 手机预览、指标条、能力 Bento、管理员/班长/学生权限三列、工程质量四卡、访问入口（平台 + 本页 + 账号 + 本地源码说明）。纯静态 HTML/CSS/JS，双端响应式。

**Verification** — `node --check js/app.js` PASS；结构锚点 hero/capabilities/roles/quality/access 均存在；评审 2 项 critical（指标含路由/双端、Access 含本地源码）已修复并重新发布。Surge `campus-platform-demo.surge.sh` SUCCESS。

**Journey log**
- 旧站信息层级弱，改大标题 + Bento + 权限三列后扫描路径更清晰。
- 页内可点 demo 与完整平台重复且易脏，本版只保留静态手机预览 + 外链。
- 评审要求指标条用「模块 / 路由 / 学年 / 叐端」，与规格保持一致。

## [S1] Problem
原展示站信息堆砌、层级弱、手机壳演示抢戏，整体不像专业毕设作品页。

## [S2] Design
### 视觉
- 锚点：Linear / Apple Event 深色产品页
- 色板：底 `#070B14`/`#0C1526`，正文 `#E8EEF9`，弱字 `#8B9BB4`，主蓝 `#6BA3FF`，金 `#F0C75E`
- 大标题 clamp 40–72px；圆角 16–24px；细描边与光斑

### 结构
1. 顶栏 CTA「进入服务平台」
2. Hero + CSS 手机框
3. 指标：模块 / 路由 / 学年 / 双端
4. 能力 Bento（2 大 + 4 小）
5. 角色权限三列
6. 工程质量四卡
7. 访问：两链接 + 账号 + 本地源码说明
8. 页脚

### 交互
锚点滚动、粘性顶栏、移动菜单、卡片 hover；无页内登录 demo。

## [S3] Out of Scope
完整 Vue 平台重做、页内 mock 登录、真实截图/视频。

## Tasks
- [x] T1: 重写 index.html (covers: S2)
- [x] T2: 重写 css/styles.css (covers: S2)
- [x] T3: 最小 js 导航 (covers: S2)
- [x] T4: 校验并发布 campus-platform-demo (covers: S1,S2)
