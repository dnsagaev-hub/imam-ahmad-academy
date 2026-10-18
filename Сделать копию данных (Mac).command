#!/bin/bash
cd "$(dirname "$0")"
echo "=== Копия данных сайта (база и загруженные файлы) ==="
if ! docker info >/dev/null 2>&1; then
  echo "[!] Docker Desktop не запущен. Откройте его, дождитесь «Engine running» и запустите файл снова."; read -n1; exit 1
fi
T=$(date +%Y-%m-%d_%H-%M)
mkdir -p backups
docker compose up -d db >/dev/null 2>&1; sleep 5
if ! docker compose exec -T db pg_dump -U academy -d academy > "backups/baza-$T.sql"; then
  echo "[!] Не удалось скопировать базу. Пришлите Claude скриншот этого окна."; read -n1; exit 1
fi
docker compose cp site:/app/media "backups/faily-$T" >/dev/null 2>&1
echo
echo "Готово! Копия лежит в папке backups:"
echo "  baza-$T.sql  — уроки, тесты, статьи, книги"
echo "  faily-$T     — загруженные аудио, PDF и картинки"
open backups 2>/dev/null || true
