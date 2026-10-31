@echo off
chcp 65001 >nul
title 一键部署 - 打开 Netlify Drop
echo 正在打开浏览器和站点文件夹...
start "" "https://app.netlify.com/drop"
start "" explorer.exe "%~dp0"
echo.
echo 请把整个文件夹或 campus-app-site.zip 拖到刚打开的网页中。
echo 成功后会显示 https://xxx.netlify.app 链接。
echo.
pause