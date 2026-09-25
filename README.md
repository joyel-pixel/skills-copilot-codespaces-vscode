# Football Player Statistics Dashboard

A simple and modern college mini-project built with **React + Vite + Tailwind CSS + Chart.js**.

## 1) Create/install project

```bash
npm install
npm run dev
```

## 2) Main features implemented

- Dashboard summary (total players, goals, assists, average rating, top scorer)
- Player cards with full stats
- Add/Edit/Delete/View player management
- Search by player name
- Filters (position, team)
- Sorting (goals, assists, rating)
- Charts:
  - Top 5 goal scorers
  - Top 5 assist providers
  - Average rating by position
- Top players ranking table
- LocalStorage persistence (no backend/database)
- Responsive football-themed UI with sidebar + dashboard header

## 3) Important files

- `src/App.jsx`  
  Contains the full dashboard UI and logic:
  - sample player data
  - localStorage read/write
  - dashboard calculations
  - form validation
  - add/edit/delete/view handlers
  - search/filter/sort logic
  - chart and table rendering

- `src/index.css`  
  Tailwind CSS import and minimal global styles.

- `vite.config.js`  
  Vite config with React plugin and Tailwind Vite plugin.

## 4) Build check

```bash
npm run build
```

This verifies the app compiles successfully.
