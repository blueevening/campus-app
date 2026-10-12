@echo off
chcp 65001 >nul
title 校园综合服务App - 本地网址预览
cd /d "%~dp0"
echo 正在启动本地服务器...
echo 浏览器将打开 http://127.0.0.1:5173/
echo 关闭本窗口即停止服务。
echo.
node "%~dp0serve-local.js" 5173
pause