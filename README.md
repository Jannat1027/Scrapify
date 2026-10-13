# Scrapify

AI-assisted plastic grading and a fair-price recycling marketplace for scrap shops, NGO collection points and recyclers in Bangladesh.

This repository contains the frontend only. It runs on demo data stored in the browser, so no server or database is needed.

## Run it

Open `frontend/index.html` in a browser, or serve the folder:

```
cd frontend
python -m http.server 5500
```

Then visit http://localhost:5500.

## Demo logins

Use the demo buttons on the login page, or any of these emails with a 6+ character password:

| Role     | Email                  |
| -------- | ---------------------- |
| Operator | rahima@greenbin.bd     |
| Recycler | tanvir@polymerloop.com |
| Admin    | admin@scrapify.app     |

Run `S.db.reset()` in the browser console to restore the demo data.

## Tailwind CSS

Tailwind is loaded from its CDN in each page's `<head>`. `js/tailwind.config.js` holds the theme and base styles,
and `js/tailwind.components.js` holds the shared classes (`.glass`, `.btn`, `.panel`, `.page-head`, `.badge` …).

## Structure

```
frontend/
  index.html, info.html, login.html, 404.html   Public pages (register.html opens the sign-up side of login.html)
  operator/  recycler/  admin/                  Workspace pages for each role
  assets/logo.svg                               Logo and favicon
  js/app.js                 Loads everything a page needs; each page names its own script in data-page
  js/core.js, labels.js     Helpers, session, toasts, click actions, English labels
  js/motion.js              Counters, scroll entrances, step bars and SVG animation moves
  js/data.js, db.js         Demo data and the localStorage store
  js/domain.js              Pricing, simulated AI grading, claiming and listing rules
  js/ui.js, cards.js        Shared HTML builders: stats, tables, tabs, badges, listing cards
  js/forms.js, dialogs.js   Form fields with live hints, keypad, modal dialogs
  js/site.js, shell.js      Public navbar and footer, workspace sidebar and top bar
  js/charts.js              Chart.js theme, loaded only on pages with charts
  js/translate.js, lang/    Full Bangla mode
  js/pages/                 One script per page, plus the hero and login animations
```

Each page only describes its own layout and content; anything used twice lives once in `js/`.
