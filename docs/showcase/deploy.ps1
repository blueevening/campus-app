# 校园综合服务App 一键部署
$ErrorActionPreference = 'Stop'
$site = $PSScriptRoot
Set-Location $site

function Write-Title($t) {
  Write-Host ''
  Write-Host '============================================' -ForegroundColor Cyan
  Write-Host "  $t" -ForegroundColor Cyan
  Write-Host '============================================' -ForegroundColor Cyan
}

function New-ZipPackage {
  $zip = Join-Path $site 'campus-app-site.zip'
  if (Test-Path $zip) { Remove-Item $zip -Force }
  $temp = Join-Path $env:TEMP ("campus-site-" + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $temp | Out-Null
  Copy-Item (Join-Path $site 'index.html') $temp
  Copy-Item (Join-Path $site 'css') (Join-Path $temp 'css') -Recurse
  Copy-Item (Join-Path $site 'js') (Join-Path $temp 'js') -Recurse
  $toml = Join-Path $site 'netlify.toml'
  if (Test-Path $toml) { Copy-Item $toml $temp }
  Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $zip -Force
  Remove-Item $temp -Recurse -Force
  Write-Host "打包完成: $zip" -ForegroundColor Green
  return $zip
}

Write-Title '校园综合服务App · 一键部署'
Write-Host '请选择部署方式：'
Write-Host '  [1] 打开 Netlify Drop（浏览器拖文件夹，最快）'
Write-Host '  [2] Netlify CLI 自动发布（需登录一次）'
Write-Host '  [3] Vercel CLI 自动发布（需登录一次）'
Write-Host '  [4] 仅打包 zip'
Write-Host '  [5] 打开站点文件夹'
Write-Host '  [0] 退出'
$choice = Read-Host '输入编号'

if ($choice -eq '1') {
  Write-Title 'Netlify Drop'
  $null = New-ZipPackage
  Write-Host '正在打开浏览器和文件夹...'
  Start-Process 'https://app.netlify.com/drop'
  Start-Process explorer.exe $site
  Write-Host '把文件夹或 campus-app-site.zip 拖进网页即可。' -ForegroundColor Yellow
  Write-Host '成功后会得到 https://xxx.netlify.app 链接。'
}
elseif ($choice -eq '2') {
  Write-Title 'Netlify CLI'
  Write-Host '首次会打开浏览器登录...'
  npx --yes netlify-cli login
  Write-Host '开始发布...'
  npx --yes netlify-cli deploy --dir . --prod
  Write-Host '完成。使用输出中的 URL。' -ForegroundColor Green
}
elseif ($choice -eq '3') {
  Write-Title 'Vercel CLI'
  Write-Host '首次会打开浏览器登录...'
  npx --yes vercel login
  Write-Host '开始发布...'
  npx --yes vercel --prod --yes
  Write-Host '完成。使用输出中的 URL。' -ForegroundColor Green
}
elseif ($choice -eq '4') {
  Write-Title '打包'
  $zip = New-ZipPackage
  Start-Process explorer.exe -ArgumentList "/select,`"$zip`""
}
elseif ($choice -eq '5') {
  Start-Process explorer.exe $site
}
else {
  Write-Host '已取消。'
}