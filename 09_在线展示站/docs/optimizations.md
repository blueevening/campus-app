# 源码优化清单（已落地 + 建议）

对应在线展示站「优化」区块，及 `02_源码` 实际改动。

## 已在源码中修复

| 优先级 | 问题 | 修复位置 | 说明 |
|--------|------|----------|------|
| 高 | Token 可伪造 | `campus-app-backend/server.js` | 改为 HMAC-SHA256 签名 + `exp` 过期校验；密钥用 `TOKEN_SECRET` |
| 高 | 注册 ID 冲突 | 同上 | `max(id)+1`，避免与 admin(id=7) 冲突 |
| 高 | CORS 全开 | 同上 | 支持 `CORS_ORIGIN`，默认 `*` 便于本机演示 |
| 中 | 空成绩 GPA/平均分 NaN | 同上 | 空列表返回 0 |
| 中 | 注册缺字段校验 | 同上 | 学号/用户名/密码必填，密码 ≥6 位 |
| 中 | 外链占位图 | `frontend/src/utils/mediaDefaults.js` 及各视图 | 本地 SVG data URI |
| 中 | History 路由静态托管难 | `frontend/src/router/index.js` | 改为 Hash 路由 |
| 中 | API 地址说明 | `frontend/src/api/index.js` | 注明 `VUE_APP_API_URL` |
| 低 | 启动文档端口不清 | `README.md` / `启动教程.md` | 标明 8080/3000 与代理关系 |

## 建议后续处理（未改代码）

1. **密码哈希**：演示仍用 MD5。生产改为 bcrypt/argon2，并强制改默认测试密码。
2. **Java 与 Node 双轨**：论文写 Spring Boot，演示跑 Node mock。答辩前统一口径，或把 Java 接到同一 API 契约。
3. **数据持久化**：mock 重启即清空。演示前导出关键操作，或接 MySQL（`04_数据库/campus_app.sql`）。
4. **登录防爆破**：为 `/api/user/login` 加速率限制与失败锁定。
5. **HTTPS / 安全响应头**：上线加 HSTS、CSP、X-Frame-Options。
6. **前端状态管理**：Vuex 可迁 Pinia；非阻塞。
7. **构建体积**：检查是否同时引入 Element Plus 与 Vant，按需裁剪。
8. **无障碍与真机适配**：补 focus 样式与 iPhone 安全区。

## 环境变量速查

```bash
# 后端
set TOKEN_SECRET=请改成足够长的随机串
set CORS_ORIGIN=https://your-site.example.com

# 前端构建
set VUE_APP_API_URL=https://api.example.com/api
# 或同源部署时可用 /api
```
