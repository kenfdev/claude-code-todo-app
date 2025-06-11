import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { todos } from "../../database/schema";
import { nanoid } from "nanoid";
import type { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest,
  TodoListResponse 
} from "../types/todo";

export class TodoService {
  private db: ReturnType<typeof drizzle>;

  constructor(database: D1Database) {
    this.db = drizzle(database);
  }

  async createTodo(userId: string, data: CreateTodoRequest): Promise<Todo> {
    const todoId = nanoid();
    const now = new Date().toISOString();

    await this.db.insert(todos).values({
      id: todoId,
      userId: userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      completed: false,
      priority: data.priority || "medium",
      dueDate: data.dueDate || null,
      createdAt: now,
      updatedAt: now,
    });

    const todo = await this.db
      .select()
      .from(todos)
      .where(eq(todos.id, todoId))
      .get();

    if (!todo) {
      throw new Error("TODO_CREATION_FAILED");
    }

    return {
      id: todo.id,
      userId: todo.userId,
      title: todo.title,
      description: todo.description || undefined,
      completed: Boolean(todo.completed),
      priority: todo.priority as "low" | "medium" | "high",
      dueDate: todo.dueDate || undefined,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }

  async getTodos(userId: string, offset: number = 0, limit: number = 50): Promise<TodoListResponse> {
    const todoList = await this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId));

    const formattedTodos: Todo[] = todoList.map(todo => ({
      id: todo.id,
      userId: todo.userId,
      title: todo.title,
      description: todo.description || undefined,
      completed: Boolean(todo.completed),
      priority: todo.priority as "low" | "medium" | "high",
      dueDate: todo.dueDate || undefined,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));

    return {
      todos: formattedTodos,
      total: totalCount.length,
    };
  }

  async getTodoById(todoId: string, userId: string): Promise<Todo | null> {
    const todo = await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
      .get();

    if (!todo) {
      return null;
    }

    return {
      id: todo.id,
      userId: todo.userId,
      title: todo.title,
      description: todo.description || undefined,
      completed: Boolean(todo.completed),
      priority: todo.priority as "low" | "medium" | "high",
      dueDate: todo.dueDate || undefined,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }

  async updateTodo(todoId: string, userId: string, data: UpdateTodoRequest): Promise<Todo> {
    const existingTodo = await this.getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error("TODO_NOT_FOUND");
    }

    const now = new Date().toISOString();
    const updateData: any = {
      updatedAt: now,
    };

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate || null;
    }

    await this.db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

    const updatedTodo = await this.getTodoById(todoId, userId);
    if (!updatedTodo) {
      throw new Error("TODO_UPDATE_FAILED");
    }

    return updatedTodo;
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    const existingTodo = await this.getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error("TODO_NOT_FOUND");
    }

    await this.db
      .delete(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
  }

  async markCompleted(todoId: string, userId: string): Promise<Todo> {
    return this.updateTodo(todoId, userId, { completed: true });
  }

  async markIncomplete(todoId: string, userId: string): Promise<Todo> {
    return this.updateTodo(todoId, userId, { completed: false });
  }

  async getCompletedTodos(userId: string): Promise<Todo[]> {
    const todoList = await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.completed, true)))
      .orderBy(desc(todos.updatedAt));

    return todoList.map(todo => ({
      id: todo.id,
      userId: todo.userId,
      title: todo.title,
      description: todo.description || undefined,
      completed: Boolean(todo.completed),
      priority: todo.priority as "low" | "medium" | "high",
      dueDate: todo.dueDate || undefined,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));
  }

  async getIncompleteTodos(userId: string): Promise<Todo[]> {
    const todoList = await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.completed, false)))
      .orderBy(desc(todos.createdAt));

    return todoList.map(todo => ({
      id: todo.id,
      userId: todo.userId,
      title: todo.title,
      description: todo.description || undefined,
      completed: Boolean(todo.completed),
      priority: todo.priority as "low" | "medium" | "high",
      dueDate: todo.dueDate || undefined,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));
  }
}