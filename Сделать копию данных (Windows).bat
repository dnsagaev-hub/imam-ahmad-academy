@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Копия данных сайта (база и загруженные файлы) ===
docker info >nul 2>&1
if errorlevel 1 (
  echo [!] Docker Desktop не запущен. Откройте его, дождитесь "Engine running" и запустите файл снова.
  pause
  exit /b 1
)
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set T=%%i
if not exist backups mkdir backups
docker compose up -d db >nul 2>&1
timeout /t 5 >nul
docker compose exec -T db pg_dump -U academy -d academy > "backups\baza-%T%.sql"
if errorlevel 1 (
  echo [!] Не удалось скопировать базу. Пришлите Claude скриншот этого окна.
  pause
  exit /b 1
)
docker compose cp site:/app/media "backups\faily-%T%" >nul 2>&1
echo.
echo Готово! Копия лежит в папке backups:
echo   baza-%T%.sql   - уроки, тесты, статьи, книги
echo   faily-%T%      - загруженные аудио, PDF и картинки
pause
