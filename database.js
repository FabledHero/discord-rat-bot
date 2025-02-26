const Database = require("better-sqlite3");
const db = new Database("bounty.db");

// Create tables if they don’t exist
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT,
        points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bounties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        proof TEXT,
        status TEXT DEFAULT 'pending'
    );
`);

module.exports = db;
