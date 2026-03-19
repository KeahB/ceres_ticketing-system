const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { hashPassword, isHashedPassword } = require('../utils/security');

const dbPath = path.resolve(__dirname, '../tickets.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.configure('busyTimeout', 5000);
    initializeSchema().catch((error) => {
      console.error('Database initialization failed:', error.message);
    });
  }
});

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const ensureColumn = async (tableName, columnName, definition) => {
  const columns = await allAsync(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await runAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const migratePlaintextPasswords = async (tableName) => {
  const rows = await allAsync(`SELECT id, password FROM ${tableName}`);

  for (const row of rows) {
    if (!isHashedPassword(row.password)) {
      await runAsync(`UPDATE ${tableName} SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        hashPassword(row.password),
        row.id,
      ]);
    }
  }
};

async function initializeSchema() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      distance REAL NOT NULL,
      passenger_type TEXT NOT NULL,
      fare REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Tickets table initialized.');

  await ensureColumn('tickets', 'conductor_id', 'INTEGER');
  await ensureColumn('tickets', 'conductor_name', 'TEXT');
  await ensureColumn('tickets', 'passenger_name', 'TEXT');
  await ensureColumn('tickets', 'payment_status', "TEXT DEFAULT 'unpaid'");
  await ensureColumn('tickets', 'origin', 'TEXT');
  await ensureColumn('tickets', 'destination', 'TEXT');
  await ensureColumn('tickets', 'route_name', 'TEXT');
  await ensureColumn('tickets', 'updated_at', 'DATETIME');
  await ensureColumn('tickets', 'archived_at', 'DATETIME');
  await ensureColumn('tickets', 'is_archived', 'INTEGER');
  await runAsync(
    `
      UPDATE tickets
      SET payment_status = COALESCE(payment_status, 'unpaid'),
          updated_at = COALESCE(updated_at, created_at),
          is_archived = COALESCE(is_archived, 0)
      WHERE payment_status IS NULL OR updated_at IS NULL OR is_archived IS NULL
    `
  );

  await runAsync(`
    CREATE TABLE IF NOT EXISTS conductors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Conductors table initialized.');

  await runAsync(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Admin users table initialized.');

  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'CERES2024';
  await runAsync(
    `
      INSERT OR IGNORE INTO admin_users (id, username, email, password, full_name, role, status)
      VALUES (1, 'admin', 'admin@ceresliner.com', ?, 'System Administrator', 'admin', 'active')
    `,
    [hashPassword(defaultAdminPassword)]
  );
  console.log('Default admin user ready.');

  await migratePlaintextPasswords('conductors');
  await migratePlaintextPasswords('admin_users');
}

module.exports = db;
