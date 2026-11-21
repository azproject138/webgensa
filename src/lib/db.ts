import mysql from "mysql2/promise";
import type { PoolOptions } from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getPoolOptions(): PoolOptions {
  const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Environment variable ${key} harus diisi`);
    }
  }

  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS ?? "",
    charset: "utf8mb4",
    connectionLimit: 10,
  };
}

export function getDatabasePool(): mysql.Pool {
  if (pool) {
    return pool;
  }

  const options = getPoolOptions();
  pool = mysql.createPool(options);

  return pool;
}

export function getDatabaseConnection() {
  return getDatabasePool().getConnection();
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  let connection;
  try {
    connection = await getDatabaseConnection();
    await connection.execute("SELECT 1 AS connected");
    return true;
  } catch (error) {
    console.error("[Database] Connection test failed:", error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Prevent multiple pool creation during Next.js hot reload
if (typeof globalThis !== "undefined") {
  const globalWithPool = globalThis as unknown as Record<string, mysql.Pool | undefined>;
  globalWithPool.__gensa_db_pool = globalWithPool.__gensa_db_pool ?? getDatabasePool();
}
