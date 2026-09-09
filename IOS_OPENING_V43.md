# iOS Opening V43

Mobile-only website opening inspired by the supplied reference video.

Implementation:
- Uses a live DOM clone of the site's own current Hero as the browser preview card.
- Starts as a centered app-switcher/browser card.
- Adds blurred multitasking background and partial side cards.
- Smoothly scales and moves the exact website preview to full screen.
- Removes card radius/browser bar/side cards continuously.
- Reveals the real unchanged website underneath at the end.
- Existing site content after the opening is unchanged.
- Desktop opening remains unchanged.
- Existing cookie and floating "Рассчитать стоимость" fixes from V42 are preserved.

Note:
A webpage cannot control or animate the real iOS/Yandex/Safari operating-system app switcher UI.
This implementation recreates that visual behavior inside the website viewport.
