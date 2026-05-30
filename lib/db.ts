import mysql from "mysql2/promise";

// Re-use a single connection pool for the entire Next.js process lifetime.
// Next.js hot-reloading creates new module instances; storing on globalThis
// prevents exhausting MySQL connections during development.
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "travel_app",
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  });
}

export const db: mysql.Pool =
  globalThis._mysqlPool ?? (globalThis._mysqlPool = createPool());
