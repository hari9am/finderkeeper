import { pool } from "../db";

async function main() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY TABLE_NAME"
    );
    console.log("Tables in DB:");
    for (const r of rows as any[]) console.log("-", (r as any).TABLE_NAME);
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("DB check error:", e?.message || e);
  process.exit(1);
});
