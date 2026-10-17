@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Запускаю сайт... Первый запуск занимает 5-10 минут.
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo Не получилось. Проверьте, что Docker Desktop установлен и запущен.
  pause
  exit /b 1
)
echo Сайт запускается, открываю браузер...
timeout /t 15 >nul
start http://localhost:3000
pause
