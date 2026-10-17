@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Академия имама Ахмада: запуск локальной версии ===
echo.
docker info >nul 2>&1
if errorlevel 1 (
  echo [!] Docker Desktop не запущен или ещё загружается.
  echo     Откройте Docker Desktop, дождитесь надписи "Engine running" внизу слева
  echo     и запустите этот файл ещё раз.
  pause
  exit /b 1
)
echo [1/3] Собираю сайт. Первый раз это занимает 5-15 минут, не закрывайте окно...
docker compose up -d --build > "журнал-запуска.txt" 2>&1
if errorlevel 1 (
  echo [!] Сборка не удалась. Пришлите Claude файл "журнал-запуска.txt" из этой папки.
  pause
  exit /b 1
)
echo [2/3] Сайт стартует и заполняет базу (до 3 минут)...
set /a tries=0
:wait
set /a tries+=1
curl -s -o nul -m 5 http://localhost:3000/ && goto ready
if %tries% GEQ 60 goto fail
timeout /t 3 >nul
goto wait
:ready
echo [3/3] Готово! Открываю http://localhost:3000
start http://localhost:3000
echo Админка: http://localhost:3000/admin
pause
exit /b 0
:fail
docker compose ps > "журнал-сайта.txt" 2>&1
docker compose logs --tail 200 >> "журнал-сайта.txt" 2>&1
echo [!] Сайт не ответил. Пришлите Claude файл "журнал-сайта.txt" из этой папки.
pause
exit /b 1
