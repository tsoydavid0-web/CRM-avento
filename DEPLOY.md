# Деплой Avento (GitHub → Vercel)

Рабочий цикл после настройки:
**правка у Claude → commit → push в GitHub → Vercel редеплоит сам.**

Репозиторий: https://github.com/tsoydavid0-web/Avento-global
Приложение живёт в корне репозитория (папка `site/`).

---

## Разовая настройка (делает Давид, ~5 минут)

### Шаг 1. Авторизация GitHub на этой машине
Нужна, чтобы push работал. Токен сохранится в связке ключей macOS —
после этого Claude пушит автоматически.

1. Создать токен: GitHub → Settings → Developer settings →
   Personal access tokens → **Tokens (classic)** → Generate new token (classic) →
   срок 90+ дней, галочка **`repo`** → Generate → **скопировать** токен.
2. В своём терминале один раз выполнить:
   ```bash
   cd "/Users/davidtsoy/Desktop/Avento Site Global/site"
   git push -u origin main
   # Username: tsoydavid0-web
   # Password: <вставить токен>   ← сохранится в keychain
   ```

### Шаг 2. Подключить Vercel к репозиторию
1. vercel.com → **Add New… → Project → Import Git Repository** → выбрать
   `tsoydavid0-web/Avento-global`.
2. Framework Preset: **Next.js** (определится сам). Root Directory: `./`.
3. **Environment Variables** — добавить (см. ниже) → **Deploy**.

После этого каждый push в `main` → авто-деплой на прод-URL;
каждая ветка/PR → отдельный preview-URL.

---

## Переменные окружения (Vercel → Settings → Environment Variables)

### Сейчас (превью для ревью команды)
| Ключ | Значение | Зачем |
|------|----------|-------|
| `LEAD_ALLOW_STUB` | `1` | форма заявки показывает «успех» без отправки письма (чтобы команда не репортила ошибку 502) |

### Позже (боевой запуск, когда подключим Resend)
| Ключ | Значение |
|------|----------|
| `RESEND_API_KEY` | ключ Resend |
| `LEAD_NOTIFY_TO` | почта, куда падают заявки |
| `LEAD_NOTIFY_FROM` | верифицированный отправитель |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (когда будет) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel (когда будет) |

На боевом проде **убрать** `LEAD_ALLOW_STUB` — тогда неверная настройка почты
падает громко, а не теряет заявки молча.

---

## Ежедневный цикл правок
1. Давид пишет Claude, что и где поправить.
2. Claude правит код и делает `git commit && git push`.
3. Vercel автоматически пересобирает и обновляет сайт (~1–2 мин).

## Что сейчас ещё заглушки (предупредить команду)
- Тексты лонгридов районов (7) и статей журнала (10) — черновики (бейдж «Черновик»).
- Контакты, номер AMI, домен — плейсхолдеры.
- Заявка/подписка отправляются в «заглушку» (письма не уходят до Resend).
