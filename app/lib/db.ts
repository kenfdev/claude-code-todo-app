import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../../database/schema";
import { generateId } from "./utils";

export type Database = DrizzleD1Database<typeof schema>;

export interface CreateTodoData {
  title: string;
  notes?: string;
}

export async function createTodo(db: Database, data: CreateTodoData) {
  const id = generateId();
  const now = new Date().toISOString();
  
  const [todo] = await db
    .insert(schema.todos)
    .values({
      id,
      title: data.title,
      notes: data.notes,
      completed: false,
      created_at: now,
      updated_at: now,
    })
    .returning();
    
  return todo;
}

export async function getAllTodos(db: Database) {
  return db.select().from(schema.todos).orderBy(schema.todos.created_at);
}

export async function getTodoById(db: Database, id: string) {
  const [todo] = await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.id, id))
    .limit(1);
    
  return todo;
}

export async function toggleTodoComplete(db: Database, id: string, completed: boolean) {
  const now = new Date().toISOString();
  
  const [todo] = await db
    .update(schema.todos)
    .set({
      completed,
      updated_at: now,
    })
    .where(eq(schema.todos.id, id))
    .returning();
    
  return todo;
}

export async function getIncompleteTodos(db: Database) {
  return db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.completed, false))
    .orderBy(schema.todos.created_at);
}

export async function getCompletedTodos(db: Database) {
  return db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.completed, true))
    .orderBy(schema.todos.created_at);
}