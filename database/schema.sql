PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS decks (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cards (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id       INTEGER NOT NULL,
  target_word   TEXT NOT NULL,
  sentence      TEXT,
  translation   TEXT,
  definitions   TEXT,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
