import * as SQLite from 'expo-sqlite';

let db;
let schemaReady = false;

const safeExec = async (sql) => {
  try {
    await db.execAsync(sql);
  } catch (error) {
    // Ignore duplicate-column and unsupported-alter cases during migration.
  }
};

const safeRun = async (sql, params = []) => {
  try {
    await db.runAsync(sql, params);
  } catch (error) {
    // Ignore best-effort backfill failures during migration.
  }
};

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('ceres_tickets.db');
  }

  if (schemaReady) {
    return db;
  }
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      conductor_id INTEGER,
      conductor_name TEXT,
      passenger_name TEXT,
      payment_status TEXT DEFAULT 'unpaid',
      origin TEXT,
      destination TEXT,
      route_name TEXT,
      distance REAL NOT NULL,
      passenger_type TEXT NOT NULL,
      fare REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0
    );
  `);

  await safeExec(`
    ALTER TABLE tickets ADD COLUMN passenger_name TEXT;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN payment_status TEXT;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN conductor_id INTEGER;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN conductor_name TEXT;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN origin TEXT;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN destination TEXT;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN route_name TEXT;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN updated_at DATETIME;
  `);

  await safeRun(
    `
      UPDATE tickets
      SET payment_status = COALESCE(payment_status, 'unpaid'),
          updated_at = COALESCE(updated_at, created_at)
      WHERE payment_status IS NULL OR updated_at IS NULL
    `
  );

  schemaReady = true;
  
  return db;
};

export const saveTicket = async (ticket) => {
  const database = await initDatabase();
  const {
    ticket_id,
    conductor_id,
    conductor_name,
    passenger_name,
    payment_status,
    origin,
    destination,
    route_name,
    distance,
    passenger_type,
    fare,
  } = ticket;
  
  const result = await database.runAsync(
    `
      INSERT INTO tickets (
        ticket_id,
        conductor_id,
        conductor_name,
        passenger_name,
        payment_status,
        origin,
        destination,
        route_name,
        distance,
        passenger_type,
        fare
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      ticket_id,
      conductor_id,
      conductor_name,
      passenger_name,
      payment_status,
      origin,
      destination,
      route_name,
      distance,
      passenger_type,
      fare,
    ]
  );
  
  return result;
};

export const getAllTickets = async () => {
  const database = await initDatabase();
  return await database.getAllAsync('SELECT * FROM tickets ORDER BY created_at DESC');
};

export const getUnsyncedTickets = async () => {
  const database = await initDatabase();
  return await database.getAllAsync('SELECT * FROM tickets WHERE synced = 0');
};

export const markAsSynced = async (id) => {
  const database = await initDatabase();
  await database.runAsync('UPDATE tickets SET synced = 1 WHERE id = ?', [id]);
};

export const updateTicketDetails = async (id, updates) => {
  const database = await initDatabase();
  try {
    await database.runAsync(
      `
        UPDATE tickets
        SET passenger_name = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [updates.passenger_name, updates.payment_status, id]
    );
  } catch (error) {
    if (!String(error.message).includes('updated_at')) {
      throw error;
    }

    await database.runAsync(
      `
        UPDATE tickets
        SET passenger_name = ?, payment_status = ?
        WHERE id = ?
      `,
      [updates.passenger_name, updates.payment_status, id]
    );
  }
};

export const getUnsyncedTicketSummary = async () => {
  const database = await initDatabase();
  const rows = await database.getAllAsync(`
    SELECT payment_status, COUNT(*) as count
    FROM tickets
    WHERE synced = 0
    GROUP BY payment_status
  `);

  return rows.reduce(
    (summary, row) => {
      const key = row.payment_status || 'unpaid';
      return {
        ...summary,
        total: summary.total + row.count,
        [key]: row.count,
      };
    },
    { total: 0, paid: 0, unpaid: 0, void: 0 }
  );
};

export const getEarningsReport = async () => {
  const database = await initDatabase();
  return await database.getAllAsync(
    'SELECT DATE(created_at) as date, SUM(fare) as total_earnings FROM tickets GROUP BY date ORDER BY date DESC'
  );
};
