const Database = require('better-sqlite3');
const path = require('path');
const log = require("./modules/logger");

const dbPath = path.join(__dirname, '..', 'dataBase', 'database.db');

let db;

try {
  db = new Database(dbPath);
  log.info('Conectado a SQLite (better-sqlite3)');
  
  db.prepare(`
    CREATE TABLE IF NOT EXISTS guild (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `).run();

} catch (err) {
  log.error('Error al conectar a SQLite', err.message);
}

module.exports = db;
