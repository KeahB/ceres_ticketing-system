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
      archived_at DATETIME,
      is_archived INTEGER DEFAULT 0,
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
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN archived_at DATETIME;
  `);
  await safeExec(`
    ALTER TABLE tickets ADD COLUMN is_archived INTEGER;
  `);

  await safeRun(
    `
      UPDATE tickets
      SET payment_status = COALESCE(payment_status, 'unpaid'),
          updated_at = COALESCE(updated_at, created_at),
          is_archived = COALESCE(is_archived, 0)
      WHERE payment_status IS NULL OR updated_at IS NULL OR is_archived IS NULL
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
  return await database.getAllAsync('SELECT * FROM tickets WHERE COALESCE(is_archived, 0) = 0 ORDER BY created_at DESC');
};

export const getUnsyncedTickets = async () => {
  const database = await initDatabase();
  return await database.getAllAsync('SELECT * FROM tickets WHERE synced = 0 AND COALESCE(is_archived, 0) = 0');
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
    WHERE synced = 0 AND COALESCE(is_archived, 0) = 0
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
    `
      SELECT
        DATE(created_at) as date,
        SUM(CASE WHEN payment_status = 'paid' THEN fare ELSE 0 END) as total_earnings,
        SUM(CASE WHEN payment_status = 'unpaid' THEN fare ELSE 0 END) as total_unpaid
      FROM tickets
      WHERE COALESCE(is_archived, 0) = 0
      GROUP BY date
      ORDER BY date DESC
    `
  );
};

export const getActiveShiftSummary = async () => {
  const database = await initDatabase();
  const rows = await database.getAllAsync(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
      SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid,
      SUM(CASE WHEN payment_status = 'void' THEN 1 ELSE 0 END) as void,
      SUM(CASE WHEN payment_status = 'paid' THEN fare ELSE 0 END) as paid_earnings,
      SUM(CASE WHEN payment_status = 'unpaid' THEN fare ELSE 0 END) as unpaid_earnings
    FROM tickets
    WHERE COALESCE(is_archived, 0) = 0
  `);

  const row = rows[0] || {};
  return {
    total: row.total || 0,
    paid: row.paid || 0,
    unpaid: row.unpaid || 0,
    void: row.void || 0,
    paidEarnings: row.paid_earnings || 0,
    unpaidEarnings: row.unpaid_earnings || 0,
  };
};

export const getSyncedActiveTicketIds = async () => {
  const database = await initDatabase();
  const rows = await database.getAllAsync(`
    SELECT ticket_id
    FROM tickets
    WHERE synced = 1 AND COALESCE(is_archived, 0) = 0
  `);

  return rows.map((row) => row.ticket_id).filter(Boolean);
};

export const archiveLocalShiftTickets = async () => {
  const database = await initDatabase();
  await database.runAsync(
    `
      UPDATE tickets
      SET is_archived = 1, archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE synced = 1 AND COALESCE(is_archived, 0) = 0
    `
  );
};
