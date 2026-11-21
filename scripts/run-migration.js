import { execSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MYSQL_BIN = "C:\\xampp\\mysql\\bin\\mysql.exe";
const DB_NAME = "gensa_db";
const DB_USER = "root";
const MIGRATIONS_DIR = join(process.cwd(), "database", "migrations");

function runSql(sql) {
  try {
    execSync(`"${MYSQL_BIN}" -u ${DB_USER} ${DB_NAME}`, {
      input: sql,
      stdio: ["pipe", "inherit", "inherit"],
      encoding: "utf8",
    });
  } catch (error) {
    console.error("Error executing SQL:", error.message);
    process.exit(1);
  }
}

function runMigrationFile(filePath) {
  const sql = readFileSync(filePath, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    if (statement.trim()) {
      runSql(statement + ";");
    }
  }
}

function main() {
  console.log("🚀 Memulai migration database GENSA...");

  // Buat database jika belum ada
  try {
    execSync(
      `"${MYSQL_BIN}" -u ${DB_USER} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`,
      { stdio: ["pipe", "inherit", "inherit"], encoding: "utf8" }
    );
    console.log(`✓ Database ${DB_NAME} siap`);
  } catch (error) {
    console.error("Gagal membuat database:", error.message);
    process.exit(1);
  }

  // Buat tabel tracking migration jika belum ada
  runSql(`
    CREATE TABLE IF NOT EXISTS migration_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // Ambil daftar migration yang sudah dijalankan
  const executedResult = execSync(
    `"${MYSQL_BIN}" -u ${DB_USER} ${DB_NAME} -e "SELECT migration_name FROM migration_history;"`,
    { encoding: "utf8" }
  );
  const executedMigrations = executedResult
    .toString()
    .split("\n")
    .filter((line) => line.trim() && !line.includes("migration_name"))
    .map((line) => line.trim());

  // Ambil semua file migration, urutkan, jalankan yang belum dijalankan
  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f !== "000_master_migration.sql")
    .sort();

  let count = 0;
  for (const file of migrationFiles) {
    if (executedMigrations.includes(file)) {
      console.log(`⏭️  ${file} sudah dijalankan, dilewati`);
      continue;
    }

    console.log(`▶️  Menjalankan ${file}...`);
    try {
      runMigrationFile(join(MIGRATIONS_DIR, file));
      runSql(
        `INSERT INTO migration_history (migration_name) VALUES ('${file}')`
      );
      console.log(`✓ ${file} selesai`);
      count++;
    } catch (error) {
      console.error(`✗ ${file} gagal:`, error.message);
      process.exit(1);
    }
  }

  if (count === 0) {
    console.log("✓ Semua migration sudah terbaru");
  } else {
    console.log(`\n✓ ${count} migration berhasil dijalankan`);
  }

  console.log("🎉 Migration selesai");
}

main();
