import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function fixHash() {
  const password = "gensa123";
  const hash = await bcrypt.hash(password, 12);
  console.log("New hash:", hash);

  const conn = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    database: "gensa_db",
    user: "root",
    password: "",
  });

  await conn.execute(
    "UPDATE admin_users SET password_hash = ? WHERE email = ?",
    [hash, "gensa@admin.id"]
  );

  console.log("Password hash updated for gensa@admin.id");

  const [rows] = await conn.execute("SELECT email, password_hash FROM admin_users");
  console.table(rows);

  await conn.end();
}

fixHash().catch(console.error);