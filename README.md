# Flashcards

Personal flashcard app (Anki-style): SQLite database, ASP.NET Core API, and Angular UI.

## Backend (`back/`)

API:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/decks` | List all decks, ordered by name |
| `GET` | `/api/decks/{id}` | One deck with all its cards |
| `GET` | `/api/decks/{id}/count` | Number of cards in a deck |
| `POST` | `/api/decks` | Create a deck |
| `POST` | `/api/decks/{deckId}/cards` | Create a card |


