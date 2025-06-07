import { sql } from "drizzle-orm";
import { db } from "../db/index";

export const clearDb = async (): Promise<void> => {
  const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

  const tables = await db.execute(query);

  for (let table of tables.rows) {
    console.log(table.table_name);
    const query = sql.raw(`TRUNCATE TABLE ${table.table_name} CASCADE;`);
    await db.execute(query);
  }
};
