#!/bin/bash
cd "$(dirname "$0")"
echo "Запускаю сайт... Первый запуск занимает 5–10 минут."
if ! docker compose up -d --build; then
  echo; echo "Не получилось. Проверьте, что Docker Desktop установлен и запущен."; read -n1; exit 1
fi
echo "Сайт запускается, открываю браузер..."
sleep 15
open http://localhost:3000
