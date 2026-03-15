# GATE 2027 Preparation Tracker

A fully static, browser-based dashboard for tracking your GATE 2027 Data Science & AI exam preparation. No backend required — all data is stored in your browser's `localStorage`.

## Features

- **Dashboard** — Overview of total study hours, problems solved, mock scores, syllabus completion, weekly summary, and study streak counter
- **Syllabus Tracker** — Checklist-based progress tracking for all 7 GATE DS&AI subjects with per-subject progress bars
- **Study Log** — Log daily study sessions with subject, hours, problems solved, and notes
- **Problem Tracker** — Track problems by subject and difficulty (Easy/Medium/Hard) with charts
- **Mock Test Tracker** — Record mock test scores and rank estimates, visualize score progression
- **Weak Topic Notebook** — Document mistakes with correct concepts for revision

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) for data visualization
- Browser `localStorage` for persistence
- No frameworks, no backend, no build step

## Running Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/gate-prep-tracker.git
   cd gate-prep-tracker
   ```

2. Open `index.html` in your browser:

   ```bash
   open index.html
   ```

   Or use a simple HTTP server:

   ```bash
   python3 -m http.server 8000
   ```

   Then visit `http://localhost:8000`.

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set source to **Branch: main**, folder: **/ (root)**.
4. Your site will be live at:

   ```
   https://<your-username>.github.io/gate-prep-tracker/
   ```

## Data Storage

All data is stored in `localStorage` under these keys:

| Key | Description |
|-----|-------------|
| `studyLogs` | Array of study session objects |
| `problemLogs` | Array of problem log objects |
| `mockTests` | Array of mock test objects |
| `weakTopics` | Array of weak topic/mistake objects |
| `syllabusProgress` | Object mapping subjects → topic completion |

## License

MIT
