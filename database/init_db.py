#!/usr/bin/env python3
"""Create and initialize the flashcards SQLite database."""

from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path

DATABASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = DATABASE_DIR / "flashcards.db"
SCHEMA_PATH = DATABASE_DIR / "schema.sql"
SEED_PATH = DATABASE_DIR / "seed.sql"


def run_sql_file(conn: sqlite3.Connection, path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    conn.executescript(sql)


def init_database(
    db_path: Path,
    *,
    seed: bool = False,
    reset: bool = False,
) -> None:
    if reset and db_path.exists():
        db_path.unlink()

    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("BEGIN")
        run_sql_file(conn, SCHEMA_PATH)
        if seed:
            run_sql_file(conn, SEED_PATH)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Initialize the flashcards SQLite database.")
    parser.add_argument(
        "--db",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"Database file path (default: {DEFAULT_DB_PATH})",
    )
    parser.add_argument("--seed", action="store_true", help="Load sample data from seed.sql")
    parser.add_argument("--reset", action="store_true", help="Delete existing database before creating")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        init_database(args.db, seed=args.seed, reset=args.reset)
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except sqlite3.Error as exc:
        print(f"Database error: {exc}", file=sys.stderr)
        return 1

    print(f"Database ready: {args.db}")
    if args.seed:
        print("Seed data loaded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
