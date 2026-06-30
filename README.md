# ADHD-Suite

An ADHD task-center dashboard that brings focus, planning, and habit tools together in one place. Everything runs in the browser and saves to local storage, so your data stays on your machine.

**Live demo:** https://aasimo13.github.io/ADHD-Suite/

## Features

- **Pomodoro Timer** — focus/break intervals to structure deep-work sessions
- **Daily Planning Prompts** — guided questions to help you set intentions for the day
- **Task Manager** — track to-dos with priorities and break larger tasks down
- **Habit Tracker** — build routines and keep an eye on your streaks
- **Drag-and-Drop Schedule Planner** — block out your day by dragging tasks onto time slots
- **Printable Schedules** — generate a clean, print-friendly version of your plan for offline use
- **Quick Notes** — jot down thoughts without leaving the dashboard

All data is stored locally in your browser via `localStorage`. There is no account or server.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

The production build is output to `dist/`. Pushing to `main` automatically builds and deploys to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.

## Project Structure

```
ADHD-Suite/
├── src/
│   ├── components/   # Feature components (Pomodoro, tasks, habits, scheduler, etc.)
│   ├── context/      # DashboardContext — shared state + localStorage persistence
│   ├── pages/        # Dashboard page
│   ├── styles/       # Global and print styles
│   ├── App.jsx       # Root component
│   └── main.jsx      # App entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Tech Stack

- React
- Vite
- Plain CSS

## Status

Working. All of the features listed above are implemented, and the app is deployed to GitHub Pages.

## License

Released under the [MIT License](LICENSE).
