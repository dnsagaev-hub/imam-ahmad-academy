#!/bin/bash
cd "$(dirname "$0")"
echo; echo "=== Академия имама Ахмада: запуск локальной версии ==="; echo
if ! docker info >/dev/null 2>&1; then
  echo "[!] Docker Desktop не запущен или ещё загружается."
  echo "    Откройте Docker Desktop, дождитесь «Engine running» и запустите этот файл ещё раз."
  read -n1; exit 1
fi
echo "[1/3] Собираю сайт. Первый раз это занимает 5–15 минут, не закрывайте окно..."
if ! docker compose up -d --build > "журнал-запуска.txt" 2>&1; then
  echo "[!] Сборка не удалась. Пришлите Claude файл «журнал-запуска.txt» из этой папки."
  read -n1; exit 1
fi
echo "[2/3] Сайт стартует и заполняет базу (до 3 минут)..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null -m 5 http://localhost:3000/; then
    echo "[3/3] Готово! Открываю http://localhost:3000  (админка: /admin)"
    open http://localhost:3000; exit 0
  fi
  sleep 3
done
{ docker compose ps; docker compose logs --tail 200; } > "журнал-сайта.txt" 2>&1
echo "[!] Сайт не ответил. Пришлите Claude файл «журнал-сайта.txt» из этой папки."
read -n1; exit 1
