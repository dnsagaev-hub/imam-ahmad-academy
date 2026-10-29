/** Схемы к разделам грамматики уроков арабского (задача 50). Арабские примеры — только из текста урока владельца. */
export type Tone = 'a' | 'b' | 'c'
/** label — роль слова («подлежащее (مُبْتَدَأٌ)»), ar — арабский, ru — перевод или пояснение */
export type SItem = { label?: string; ar?: string; ru?: string; tone?: Tone }
export type SBlock =
  /** Формула — как арабское предложение: первая часть справа. '→' рисуется стрелкой в сторону чтения. */
  | { kind: 'formula'; parts: (SItem | '+' | '=' | '→')[]; note?: string }
  | { kind: 'compare'; cols: { title: string; tone?: Tone; items: SItem[] }[]; note?: string }
  | { kind: 'rules'; items: string[]; note?: string }
export type Scheme = { title: string; blocks: SBlock[] }
/** Схемы урока: ключ — подзаголовок раздела («## …») без «## » */
export type LessonSchemes = Record<string, Scheme>
