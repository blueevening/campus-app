# 全局 Bug 清单与修复记录

> 排查范围：`02_源码/campus-app-frontend` + `02_源码/campus-app-backend`
> 状态：`[x]` 已修复 · `[ ]` 待修复

## 一、前后端接口不对齐（P0）

前端 `src/api/index.js` 封装约 50 个接口，后端 `server.js` 原先只实现约 30 个，页面调用会 404。

| # | 问题 | 预期 | 状态 |
|---|------|------|------|
| 1 | 缺少 `PUT /user/update` | 改资料可保存 | [x] 已补 |
| 2 | 缺少 `POST /user/change-password` | 改密可提交 | [x] 已补 |
| 3 | 缺少 `GET /course/list`、`POST /course/select/:id`、`POST /course/drop/:id`、`GET /course/current-semester` | 选课/退课可用 | [x] 已补 |
| 4 | 缺少 `POST /book/reserve/:id`、`GET /book/reservations` | 图书预约可用 | [x] 已补 |
| 5 | 缺少失物招领详情/发布/改状态/删除 | 发布与管理可用 | [x] 已补 |
| 6 | 缺少第二课堂 cancel / check-in / complete | 报名-签到-完成闭环 | [x] 已补 |
| 7 | 缺少 `permission/*` | 权限信息可读取 | [x] 已补 |
| 8 | 缺少 `admin/*` 全套 | 管理端三页可用 | [x] 已补 |
| 9 | 缺少 `notifications/*` | 消息通知页可用 | [x] 已补 |

## 二、文案与数据不一致（P1）

| # | 问题 | 预期 | 状态 |
|---|------|------|------|
| 10 | 登录页页脚写「Vue.js + Spring Boot + MySQL」，实际为 Node.js 模拟 API | 文案与真实技术栈一致 | [x] 已改为 Vue.js 3 + Vant 4 + Node.js |
| 11 | 后端残留 Spring Boot `pom.xml`、异常 `package-lock.json`、Java `src/` 骨架 | 清理无用残留 | [x] 已删除 pom/lock，Java 骨架归档为 `_unused_java_backend` |
| 12 | 密码为 MD5 存储（演示可接受） | README 标明「仅演示」 | [x] README 已注明 |
| 13 | 通知字段不统一（`content` vs `body`，`list` vs `records`） | 前后端/ mock 字段一致 | [x] 已统一为 `body` + `list` |
| 14 | 学期不一致（store `2025-2026-1` vs 课程 `2024-2025-2`） | 全局统一学期 | [x] 统一为 `2024-2025-2` |

## 三、业务逻辑（P1）

| # | 问题 | 预期 | 状态 |
|---|------|------|------|
| 15 | 新注册用户无初始通知/积分数据 | 注册后初始化积分与欢迎通知 | [x] 已补 |
| 16 | `course/schedule` 返回全部课程，未按学生选课过滤 | 已选课学生只看已选课程 | [x] 已过滤（无选课时返回全部便于演示） |
| 17 | 借阅日期/应还日期用完整 ISO，与示例 `YYYY-MM-DD` 不统一 | 时间格式统一 | [x] 新借阅统一 `YYYY-MM-DD` |
| 18 | 管理端保存成绩未自动算 GPA | 保存时联动计算 | [x] 已按 30/20/50 权重自动计算 |

## 四、UI / 体验（P0，随全量重构处理）

| # | 问题 | 预期 | 状态 |
|---|------|------|------|
| 19 | Vant + Element Plus 混用（依赖里有 Element Plus） | 统一 Vant 4 | [x] 已移除 element-plus 依赖，设计令牌统一 |
| 20 | 页面间距/卡片/按钮风格不统一 | 现代校园风统一设计系统 | [x] 新增 `global.css` 设计令牌（卡片/按钮/标签/表单） |
| 21 | 桌面侧栏与移动端底栏切换较生硬 | 响应式布局顺滑 | [ ] 细节打磨 |
| 22 | 表单校验错误提示风格不一 | 统一 toast / field 错误样式 | [ ] 细节打磨 |

## 五、工程化（P1）

| # | 问题 | 预期 | 状态 |
|---|------|------|------|
| 23 | 主项目无 Git / 无 `.gitignore` | 初始化并排除 `node_modules`、`dist` | [x] `.gitignore` 已补；Git 待推送 |
| 24 | README 技术栈描述过时 | 更新为当前真实栈 | [x] 已重写 README |
