# Monster Energy App — unofficial concept

A website for a self-directed UI/UX concept: a Monster Energy rewards app where you
scan cans for XP, catch limited flavour drops, find events nearby and keep your
caffeine in check.

Designed by **Qudsiya Mehmood** (QK Creatives).

> **Unofficial concept.** Monster Energy, its flavour names, claw mark and can artwork
> are trademarks of Monster Energy Company. This project is not affiliated with,
> endorsed by or connected to Monster Energy, and the app does not exist.

## What's here

| Page | What it is |
| --- | --- |
| `index.html` | The website: what the app does, the prototype embedded, all 12 screens, the design system and the responsible-design thinking. |
| `app.html` | The clickable prototype itself — 12 working screens with a tab bar, a scan flow, XP, rewards and a caffeine tracker. |

## Folder structure

```
monster-energy-app/
├── index.html          website (landing page)
├── app.html            clickable prototype
├── css/
│   ├── site.css        website styles
│   └── app.css         prototype styles
├── js/
│   ├── site.js         scroll reveals
│   └── app.js          prototype logic: routing, scan flow, XP, caffeine
├── assets/
│   ├── cans/           can photos used inside the app
│   ├── screens/        the 12 designed screens + can line-up
│   └── source/         the original concept board
├── devserver.js        tiny local server for previewing
└── README.md
```

## Run it locally

```bash
node devserver.js
```

Then open <http://localhost:4176>. Any static server works — the site is plain
HTML, CSS and JavaScript with no build step and no dependencies.

## The prototype

Everything is clickable and the state is shared across screens:

- **Scan** a can for +50 XP — capped at 3 scans a day
- **XP** updates the home screen, the level bar and what you can afford in Rewards
- **Redeem** a reward and the XP is spent
- **Caffeine** from each scan logs against the 400mg daily guide; the ring turns red if you go over
- **Flavour drop** counts down live, with a notify button
- **Reset demo** puts everything back to the starting state

On a phone the prototype fills the screen like a real app; on a desktop it sits in
a phone frame.

## Credits

- Can photography: my own photos, cut out by hand
- Type: [Inter](https://fonts.google.com/specimen/Inter)
- No frameworks, no trackers, no cookies
