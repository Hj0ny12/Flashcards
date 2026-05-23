# Flashcards

Personal flashcard app (Anki-style): SQLite database, ASP.NET Core API, and Angular UI.

## Prerequisites

- Python 3.x (database setup)
- .NET 9 SDK (backend)
- Node.js 20+ and npm (frontend)

## Database

From the project root:

```bash
python database/init_db.py --seed
```

The database file is `database/flashcards.db`.

| Side  | Column(s) |
|-------|-----------|
| Front | `target_word` |
| Back  | `sentence`, `translation`, `definitions` |

## Backend (`back/`)

```bash
cd back
dotnet run
```

API: `http://localhost:5074`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/decks` | List all decks, ordered by name |
| `GET` | `/api/decks/{id}` | One deck with all its cards |
| `GET` | `/api/decks/{id}/count` | Number of cards in a deck |
| `POST` | `/api/decks` | Create a deck |
| `POST` | `/api/decks/{deckId}/cards` | Create a card |

CORS is enabled for `http://localhost:4200` (Angular dev server).

## Frontend (`front/`)

Angular app: deck list with card counts, deck view with card list and detail panel.

Run the API first, then in another terminal:

```bash
cd front
npm install
npm start
```

Open `http://localhost:4200`. Requests to `/api/*` are proxied to the backend (`front/proxy.conf.json`).

### UI flow

1. **Home** — all decks by name, each with card count (`/api/decks` + `/api/decks/{id}/count`)
2. **Deck** — cards listed top-down showing target word and definitions
3. **Card click** — right panel shows sentence and translation
