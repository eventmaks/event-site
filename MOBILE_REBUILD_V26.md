# Mobile Rebuild V26 — технический аудит и пересборка

## Что было причиной проблем
Старый `style.css` накопил много последовательных mobile override-блоков из V1–V25.
Одни и те же элементы (`cost-pug`, `about-pattern`, `team-pattern`, contact icons и т.д.)
переопределялись много раз. Поэтому следующий фикс мог визуально ломать предыдущий.

## Что изменено архитектурно
- Desktop `style.css` сохранён.
- Добавлен отдельный `mobile-rebuild.css`, который подключается ПОСЛЕ desktop CSS
  только на экранах до 767px.
- Это один финальный mobile source of truth.
- Больше не добавляем точечные mobile override-блоки в старый `style.css`.

## Принцип мобильной версии
Не отдельный дизайн, а desktop-визуал, адаптированный по:
- масштабу,
- ширине,
- колонкам,
- отступам,
- crop фотографий.

Desktop-механики сохранены:
- Hero typewriter;
- circular Showreel reveal/reverse;
- moving «СОЗДАЮ СОБЫТИЯ»;
- moving «МОЯ КОМАНДА»;
- moving «ПОРТФОЛИО»;
- reversible Benefits;
- Contract pen/heart;
- Pug treat path;
- Reviews scroll motion;
- Flow bridges.

## Ключевые решения
- Team: 3 карточки сверху + 2 снизу, как desktop, только масштабировано.
- Cost: мопс больше не перекрывает карточку — он находится ниже/справа как отдельный декоративный участник.
- Contact: макет телефона уменьшен, app icons выровнены.
- Consent: ключ обновлён до v3, чтобы окно снова можно было проверить один раз после публикации.
- Portfolio markup/photos не изменены.

## Дальше
Следующие изменения мобильной версии надо делать только в `mobile-rebuild.css`,
а не добавлять новые override-слои в `style.css`.
