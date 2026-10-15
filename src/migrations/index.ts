// Список миграций базы данных.
// Первая миграция создаётся командой `npm run migrate:create initial`
// (Payload сам допишет её в этот файл). См. README.md, раздел «Первый запуск».
export const migrations: {
  name: string
  up: (args: any) => Promise<void>
  down: (args: any) => Promise<void>
}[] = []
