# Mobile/Desktop parity audit V19

## Root cause of the weak mobile version
The mobile build was not only resized. Several older `phone-lite` layers intentionally disabled the desktop visual system:

- hero portrait motion was forced to `animation:none`;
- almost all `СОЗДАЮ СОБЫТИЯ` rows were frozen/hidden;
- About scroll parallax was disabled on phone;
- team typography was mostly frozen and the bottom marquee was hidden;
- team card reveal was overridden with `opacity:1; transform:none`;
- Reviews scene progress was fixed to a static value;
- FAQ and Contact scene progress was fixed to `1`;
- all section bridge progress was fixed to `1`;
- Contact wave transform was explicitly forced to `none`.

That made the phone version feel like a simplified static copy rather than the desktop site adapted to a narrow viewport.

## V19 approach
V19 starts from stable V17 (not the rejected V18 patch) and restores the desktop visual mechanisms while keeping phone-safe geometry.

### Hero
- keeps the centered V13 photo crop;
- restores gentle photo breathing.

### Showreel
- keeps the already-approved mobile circular reveal V10.

### About / `СОЗДАЮ СОБЫТИЯ`
- left visual panel is a full phone viewport;
- pattern container covers the actual viewport instead of using an oversized cropped canvas;
- 15 rows are available to fill the screen;
- every visible row moves continuously, alternating directions and speeds;
- background and photo receive reversible scroll-linked movement;
- photo, tape, 8+ and 100+ keep the desktop composition language.

### Team
- repeated background typography moves again;
- card entrance reveal works again;
- bottom `МОЯ КОМАНДА` marquee is restored on phone;
- mobile 2+1+2 photo layout is preserved for readability.

### Portfolio
- content/order/markup remain frozen and unchanged.

### Quiz
- existing readable mobile composition and form behavior remain unchanged.

### Benefits
- existing reversible desktop-style scroll reveal remains enabled.

### Contract
- existing reversible pen/heart animation remains enabled.

### Cost / pug
- existing mobile treat trajectory/timing remains enabled.

### Reviews
- horizontal phone carousel stays usable;
- living wave and small scroll-linked card motion are restored.

### FAQ / Contact
- desktop scene-progress logic now runs on phone;
- FAQ note and Contact wave/phone movement are restored in scaled form.

### Section transitions
- flow bridges are scroll-driven again rather than permanently forced to their final state.

### Consent
- V17 real close/click fix is inherited unchanged.

Cache bust: `?v=19`.
