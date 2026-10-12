@echo off
chcp 65001 >nul
title 推送到 Gitee / GitHub（公网部署）
cd /d "%~dp0"

echo ============================================
echo   把展示站推送到你的仓库（手机电脑都能开）
echo ============================================
echo.
echo 前提：已在 Gitee 或 GitHub 建好空仓库（开源，无 README）
echo 公网地址一般在推送 + 开启 Pages 后生效。
echo.
set /p REPO=请粘贴仓库 HTTPS 地址:
if "%REPO%"=="" (
  echo [取消] 未输入地址。
  pause
  exit /b 1
)

echo.
echo 正在初始化并推送...
if exist .git (
  git remote remove origin 2>nul
) else (
  git init
)

git add index.html
git add css
git add js
git add netlify.toml
git add .nojekyll
git add 部署说明.md
git add 公网部署三步.md
git add serve-local.js
git add -f .github 2>nul

git commit -m "Campus app online site" 2>nul
git branch -M main
git remote add origin "%REPO%"
git push -u origin main

echo.
if errorlevel 1 (
  echo [失败] 请检查仓库地址、网络，或是否需要登录账号。
) else (
  echo [成功] 代码已推送！
  echo.
  echo 下一步：
  echo   Gitee: 仓库页 - 服务 - Gitee Pages - 启动
  echo   GitHub: Settings - Pages - Deploy from branch - main/root
  echo.
  echo 得到的 https://... 链接可发手机/电脑直接打开。
)
echo.
pause