import { lesson01 } from './lesson-01'
import { lesson02 } from './lesson-02'
import { lesson03 } from './lesson-03'
import { lesson04 } from './lesson-04'
import { lesson05 } from './lesson-05'
import { lesson06 } from './lesson-06'
import { lesson07 } from './lesson-07'
import { lesson08 } from './lesson-08'
import { lesson09 } from './lesson-09'
import { lesson10 } from './lesson-10'
import { lesson11 } from './lesson-11'
import type { LessonSchemes } from './types'

/** Схемы к грамматике по адресу урока. Раздел, подзаголовок которого владелец переименовал, остаётся без схемы. */
export const SCHEMES: Record<string, LessonSchemes> = {
  'arabskiy-urok-1': lesson01,
  'arabskiy-urok-2': lesson02,
  'arabskiy-urok-3': lesson03,
  'arabskiy-urok-4': lesson04,
  'arabskiy-urok-5': lesson05,
  'arabskiy-urok-6': lesson06,
  'arabskiy-urok-7': lesson07,
  'arabskiy-urok-8': lesson08,
  'arabskiy-urok-9': lesson09,
  'arabskiy-urok-10': lesson10,
  'arabskiy-urok-11': lesson11,
}
