@echo off
chcp 65001 >nul
title 打开 Gitee 注册与建仓库
echo 正在打开 Gitee 注册页和新建仓库页...
start "" "https://gitee.com/signup"
timeout /t 2 >nul
start "" "https://gitee.com/projects/new"
echo.
echo 注册登录后，新建仓库 campus-app-demo（开源，不要初始化 README）
echo 然后复制 HTTPS 地址，运行 部署到GiteePages.bat
echo.
pause