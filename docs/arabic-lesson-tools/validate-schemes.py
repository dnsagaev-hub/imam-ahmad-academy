# Проверка схем урока: python3 -I docs/arabic-lesson-tools/validate-schemes.py src/data/arabic/schemes/lesson-NN.ts <путь к gNN.txt>
# Ключ схемы = подзаголовок «## …» грамматики (буква в букву); каждое ar: есть в тексте грамматики; note начинается с русской буквы.
import re, sys
t = open(sys.argv[1], encoding='utf-8').read(); g = open(sys.argv[2], encoding='utf-8').read()
heads = [l[3:] for l in g.splitlines() if l.startswith('## ')]
bad = 0
for k in re.findall(r"^  '(.+?)': \{", t, re.M):
    if k not in heads: print('КЛЮЧ НЕ НАЙДЕН:', k); bad += 1
for a in re.findall(r"ar: '(.+?)'", t):
    if a not in g: print('НЕТ В ГРАММАТИКЕ:', a); bad += 1
for n in re.findall(r"note: '(.+?)'", t):
    if not re.match('[А-Яа-яЁё]', n): print('NOTE НЕ С РУССКОЙ БУКВЫ:', n); bad += 1
print('ошибок:', bad)
