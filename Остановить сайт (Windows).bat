@echo off
chcp 65001 >nul
cd /d "%~dp0"
docker compose stop
echo Сайт остановлен. Данные сохранены.
pause
