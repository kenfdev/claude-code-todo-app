import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text().primaryKey(),
  title: text().notNull(),
  notes: text(),
  completed: integer({ mode: "boolean" }).notNull().default(false),
  created_at: text().notNull().default("CURRENT_TIMESTAMP"),
  updated_at: text().notNull().default("CURRENT_TIMESTAMP"),
});
