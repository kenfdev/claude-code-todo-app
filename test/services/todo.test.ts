import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TodoService } from "../../app/services/todo";
import { AuthService } from "../../app/services/auth";
import { createTestDatabase, cleanupTestDatabase } from "../setup";
import type { CreateTodoRequest } from "../../app/types/todo";

describe("TodoService", () => {
  let db: D1Database;
  let todoService: TodoService;
  let authService: AuthService;
  let testUserId: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    todoService = new TodoService(db);
    authService = new AuthService(db);

    // Create a test user
    const user = await authService.register({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe("createTodo", () => {
    it("should create a new todo successfully", async () => {
      const todoData: CreateTodoRequest = {
        title: "Test Todo",
        description: "Test description",
        priority: "medium",
        dueDate: "2024-12-31",
      };

      const todo = await todoService.createTodo(testUserId, todoData);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.userId).toBe(testUserId);
      expect(todo.title).toBe("Test Todo");
      expect(todo.description).toBe("Test description");
      expect(todo.priority).toBe("medium");
      expect(todo.dueDate).toBe("2024-12-31");
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });

    it("should create a todo with minimal data", async () => {
      const todoData: CreateTodoRequest = {
        title: "Simple Todo",
      };

      const todo = await todoService.createTodo(testUserId, todoData);

      expect(todo).toBeDefined();
      expect(todo.title).toBe("Simple Todo");
      expect(todo.description).toBeUndefined();
      expect(todo.priority).toBe("medium"); // default
      expect(todo.dueDate).toBeUndefined();
      expect(todo.completed).toBe(false);
    });

    it("should trim whitespace from title and description", async () => {
      const todoData: CreateTodoRequest = {
        title: "  Trimmed Todo  ",
        description: "  Trimmed description  ",
      };

      const todo = await todoService.createTodo(testUserId, todoData);

      expect(todo.title).toBe("Trimmed Todo");
      expect(todo.description).toBe("Trimmed description");
    });
  });

  describe("getTodos", () => {
    beforeEach(async () => {
      // Create test todos
      await todoService.createTodo(testUserId, { title: "Todo 1", priority: "high" });
      await todoService.createTodo(testUserId, { title: "Todo 2", priority: "low" });
      await todoService.createTodo(testUserId, { title: "Todo 3", priority: "medium" });
    });

    it("should retrieve all todos for a user", async () => {
      const result = await todoService.getTodos(testUserId);

      expect(result.todos).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.todos[0].title).toBe("Todo 3"); // Most recent first
      expect(result.todos[1].title).toBe("Todo 2");
      expect(result.todos[2].title).toBe("Todo 1");
    });

    it("should support pagination", async () => {
      const result = await todoService.getTodos(testUserId, 1, 2);

      expect(result.todos).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it("should return empty list for user with no todos", async () => {
      // Create another user
      const anotherUser = await authService.register({
        email: "another@example.com",
        password: "password123",
        firstName: "Another",
        lastName: "User",
      });

      const result = await todoService.getTodos(anotherUser.id);

      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("getTodoById", () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await todoService.createTodo(testUserId, {
        title: "Test Todo",
        description: "Test description",
      });
      todoId = todo.id;
    });

    it("should retrieve a todo by id", async () => {
      const todo = await todoService.getTodoById(todoId, testUserId);

      expect(todo).toBeDefined();
      expect(todo!.id).toBe(todoId);
      expect(todo!.title).toBe("Test Todo");
    });

    it("should return null for non-existent todo", async () => {
      const todo = await todoService.getTodoById("non-existent", testUserId);

      expect(todo).toBeNull();
    });

    it("should return null for todo belonging to another user", async () => {
      // Create another user
      const anotherUser = await authService.register({
        email: "another@example.com",
        password: "password123",
        firstName: "Another",
        lastName: "User",
      });

      const todo = await todoService.getTodoById(todoId, anotherUser.id);

      expect(todo).toBeNull();
    });
  });

  describe("updateTodo", () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await todoService.createTodo(testUserId, {
        title: "Original Title",
        description: "Original description",
        priority: "low",
      });
      todoId = todo.id;
    });

    it("should update todo fields", async () => {
      const updatedTodo = await todoService.updateTodo(todoId, testUserId, {
        title: "Updated Title",
        description: "Updated description",
        priority: "high",
        completed: true,
      });

      expect(updatedTodo.title).toBe("Updated Title");
      expect(updatedTodo.description).toBe("Updated description");
      expect(updatedTodo.priority).toBe("high");
      expect(updatedTodo.completed).toBe(true);
      expect(updatedTodo.updatedAt).not.toBe(updatedTodo.createdAt);
    });

    it("should update only specified fields", async () => {
      const originalTodo = await todoService.getTodoById(todoId, testUserId);
      const updatedTodo = await todoService.updateTodo(todoId, testUserId, {
        title: "New Title",
      });

      expect(updatedTodo.title).toBe("New Title");
      expect(updatedTodo.description).toBe(originalTodo!.description);
      expect(updatedTodo.priority).toBe(originalTodo!.priority);
    });

    it("should throw error for non-existent todo", async () => {
      await expect(
        todoService.updateTodo("non-existent", testUserId, { title: "New Title" })
      ).rejects.toThrow("TODO_NOT_FOUND");
    });
  });

  describe("deleteTodo", () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await todoService.createTodo(testUserId, { title: "To Delete" });
      todoId = todo.id;
    });

    it("should delete a todo", async () => {
      await todoService.deleteTodo(todoId, testUserId);

      const todo = await todoService.getTodoById(todoId, testUserId);
      expect(todo).toBeNull();
    });

    it("should throw error for non-existent todo", async () => {
      await expect(
        todoService.deleteTodo("non-existent", testUserId)
      ).rejects.toThrow("TODO_NOT_FOUND");
    });
  });

  describe("markCompleted and markIncomplete", () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await todoService.createTodo(testUserId, { title: "Toggle Todo" });
      todoId = todo.id;
    });

    it("should mark todo as completed", async () => {
      const updatedTodo = await todoService.markCompleted(todoId, testUserId);

      expect(updatedTodo.completed).toBe(true);
    });

    it("should mark todo as incomplete", async () => {
      await todoService.markCompleted(todoId, testUserId);
      const updatedTodo = await todoService.markIncomplete(todoId, testUserId);

      expect(updatedTodo.completed).toBe(false);
    });
  });

  describe("getCompletedTodos and getIncompleteTodos", () => {
    beforeEach(async () => {
      // Create mix of completed and incomplete todos
      const todo1 = await todoService.createTodo(testUserId, { title: "Todo 1" });
      const todo2 = await todoService.createTodo(testUserId, { title: "Todo 2" });
      await todoService.createTodo(testUserId, { title: "Todo 3" });

      await todoService.markCompleted(todo1.id, testUserId);
      await todoService.markCompleted(todo2.id, testUserId);
    });

    it("should get only completed todos", async () => {
      const completedTodos = await todoService.getCompletedTodos(testUserId);

      expect(completedTodos).toHaveLength(2);
      expect(completedTodos.every(todo => todo.completed)).toBe(true);
    });

    it("should get only incomplete todos", async () => {
      const incompleteTodos = await todoService.getIncompleteTodos(testUserId);

      expect(incompleteTodos).toHaveLength(1);
      expect(incompleteTodos.every(todo => !todo.completed)).toBe(true);
      expect(incompleteTodos[0].title).toBe("Todo 3");
    });
  });
});