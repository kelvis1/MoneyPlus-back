import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDb() {
  return open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
}

openDb().then(db => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});


