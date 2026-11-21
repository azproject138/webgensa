import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { readFileSync } from "fs";

function loadEnv() {
  try {
    const envContent = readFileSync(".env", "utf8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join("=").trim();
        }
      }
    }
  } catch {
    // .env file might not exist, continue with existing env
  }
}

loadEnv();

async function main() {
  const args = process.argv.slice(2);
  const name = args[0];
  const email = args[1];
  const password = args[2];

  if (!name || !email || !password) {
    console.log("Usage: node scripts/provision-admin.js <nama> <email> <password>");
    console.log("Example: node scripts/provision-admin.js 'Administrator' 'admin@gensa.id' 'PasswordAman123'");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password minimal 8 karakter");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      database: process.env.DB_NAME || "gensa_db",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
    });

    // Cek apakah sudah ada admin dengan email tersebut
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM admin_users WHERE email = ?",
      [normalizedEmail]
    );
    const count = existing[0].count;

    if (count > 0) {
      console.error(`Admin dengan email ${normalizedEmail} sudah tersedia`);
      process.exit(1);
    }

    // Cek apakah ada admin apa pun di sistem
    const [allAdmins] = await connection.execute("SELECT COUNT(*) as count FROM admin_users");
    const totalCount = allAdmins[0].count;

    if (totalCount > 0) {
      console.error("Admin sudah tersedia. Gunakan fitur manajemen admin.");
      process.exit(1);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Buat admin baru
    const id = crypto.randomUUID();

    await connection.execute(
      "INSERT INTO admin_users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'super_admin', TRUE)",
      [id, name, normalizedEmail, passwordHash]
    );

    console.log(`✓ Admin berhasil dibuat`);
    console.log(`  Nama: ${name}`);
    console.log(`  Email: ${normalizedEmail}`);
    console.log(`  Role: super_admin`);
    console.log("\nCatatan: Simpan password dengan aman. Password tidak dapat diambil kembali.");
  } catch (error) {
    console.error("Gagal membuat admin:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
