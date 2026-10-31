@echo off
title Pack site zip
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path index.html,css,js,netlify.toml -DestinationPath campus-app-site.zip -Force; Write-Host ZIP_OK"
start "" explorer.exe /select,"%~dp0campus-app-site.zip"
pause