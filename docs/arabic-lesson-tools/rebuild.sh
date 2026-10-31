# Сборка и запуск собранного сайта на тестовой базе (не база владельца!) для проверок check-lesson.cjs / check-schemes.cjs.
# Нужен локальный Postgres с базой academy2 (service postgresql start) и выполненный npm run migrate.
set -e
cd "$(dirname "$0")/../.."
export DATABASE_URL=${DATABASE_URL:-postgres://academy:academy@localhost:5432/academy2} PAYLOAD_SECRET=${PAYLOAD_SECRET:-dev-only-secret-dev-only-secret-12345} PAYLOAD_DB_PUSH=false
npm run build > /tmp/build.log 2>&1 || { tail -30 /tmp/build.log; exit 1; }
pkill -f "node server.js" || true; pkill -f next-server || true; sleep 1
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
cd .next/standalone && (HOSTNAME=127.0.0.1 PORT=3000 nohup node server.js >/tmp/srv.log 2>&1 &)
sleep 6; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/lessons/arabskiy-urok-1
