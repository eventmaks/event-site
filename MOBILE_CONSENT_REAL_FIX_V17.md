# Mobile Consent Real Fix V17

Найдена реальная причина.

В V15 для мобильного окна было добавлено:
`display:grid!important`

При нажатии JS ставил `hidden=true`, но на Safari это состояние могло
оставаться визуально открытым из-за принудительного `display:grid!important`.
То есть обработчик кнопки мог срабатывать, но пользователь видел то же окно
и казалось, что кнопки не работают.

V17:
- `.entry-consent[hidden] { display:none!important; }`
- закрытие дополнительно жёстко выставляет inline `display:none!important`;
- при открытии inline display снимается;
- сохраняются кнопки согласия / отказа / крестик;
- сохранён fallback для touch/pointer;
- после нажатия значение сохраняется в localStorage;
- backdrop также может закрывать окно.

Добавлен cache bust ?v=17.
Desktop и Portfolio не менялись.
