# Climate Explorer

Climate Explorer is a full-stack application for exploring 160 years of temperature data from multiple weather stations. The backend normalizes a historical CSV into queryable monthly and annual data, while the frontend provides an analytics dashboard, interactive controls, and D3-powered visualizations.

<img width="853" height="814" alt="Screenshot 2025-11-29 at 6 41 32 PM" src="https://github.com/user-attachments/assets/3e5ac797-3e4c-4141-b021-2702ae77e6ab" />

## Project structure

```
backend/   FastAPI service that exposes data + analytics APIs
frontend/  React + Vite SPA with Tailwind, TanStack Query, and D3.js
```

## Backend

### Requirements
- Python 3.12 or newer (PyO3/Pydantic-core does not yet support Python 3.14)
- `pip`

### Setup & run
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API listens on `http://localhost:8000`. It automatically loads `app/data/temperature_data_extended.csv` at startup.

### Tests
```
cd backend
source .venv/bin/activate
pytest
```

## Frontend

### Requirements
- Node.js 18+
- pnpm 9+

### Setup & run
```
cd frontend
pnpm install
pnpm dev
```

Set `VITE_API_BASE_URL` if the backend is not running at `http://localhost:8000/api`.

### Linting & formatting
```
pnpm lint
pnpm format
```

## Using the app
1. Start the backend (port 8000) and frontend (port 5173).
2. Open http://localhost:5173.
3. Select one or more stations, adjust the year range/zoom/mode, and click **Generate chart**.
4. Review the analytics cards and interactive chart. Annual mode optionally shades the ±1σ band.

## API overview
- `GET /api/stations` – station metadata (id, name, year bounds)
- `POST /api/temperature-data` – monthly or annual series for selected stations/year range
- `POST /api/analytics` – overall and per-station stats for the selection

Errors return `{"error": {"code": "NO_DATA", ...}}` style payloads.
