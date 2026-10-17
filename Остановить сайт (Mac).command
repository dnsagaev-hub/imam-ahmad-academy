#!/bin/bash
cd "$(dirname "$0")"
docker compose stop
echo "Сайт остановлен. Данные сохранены."
