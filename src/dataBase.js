const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const log = require("./modules/logger");

const dbPath = path.join(__dirname, '..', 'database', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) log.error('Error al conectar a SQLite', err.message);
  else log.info('Conectado a SQLite');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS guild (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
});

module.exports = db;
