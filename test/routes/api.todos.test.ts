import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestDatabase, cleanupTestDatabase } from "../setup";
import { AuthService } from "../../app/services/auth";

describe("Todo API Routes", () => {
  let db: D1Database;
  let authService: AuthService;
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    authService = new AuthService(db);

    // Create and login test user
    const user = await authService.register({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    
    const loginResult = await authService.login({
      username: "test@example.com",
      password: "password123",
    });
    
    accessToken = loginResult.accessToken;
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe("POST /api/todos", () => {
    it("should create a new todo successfully", async () => {
      const todoData = {
        title: "Test Todo",
        description: "Test description",
        priority: "high",
        dueDate: "2024-12-31",
      };

      const request = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(todoData),
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { action } = await import("../../app/routes/api.todos");
      const response = await action({ request, context, params: {} } as any);
      
      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result.title).toBe("Test Todo");
      expect(result.description).toBe("Test description");
      expect(result.priority).toBe("high");
      expect(result.dueDate).toBe("2024-12-31");
      expect(result.completed).toBe(false);
      expect(result.id).toBeDefined();
    });

    it("should reject todo creation without authentication", async () => {
      const todoData = {
        title: "Test Todo",
      };

      const request = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { action } = await import("../../app/routes/api.todos");
      const response = await action({ request, context, params: {} } as any);
      
      expect(response.status).toBe(401);
    });

    it("should reject todo creation with empty title", async () => {
      const todoData = {
        title: "",
        description: "Test description",
      };

      const request = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(todoData),
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { action } = await import("../../app/routes/api.todos");
      const response = await action({ request, context, params: {} } as any);
      
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.error).toContain("バリデーションエラー");
    });

    it("should reject todo creation with invalid priority", async () => {
      const todoData = {
        title: "Test Todo",
        priority: "invalid",
      };

      const request = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(todoData),
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { action } = await import("../../app/routes/api.todos");
      const response = await action({ request, context, params: {} } as any);
      
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/todos", () => {
    beforeEach(async () => {
      // Create test todos
      const createTodo = async (title: string, completed = false) => {
        const request = new Request("http://localhost/api/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ title }),
        });

        const context = { cloudflare: { env: { DB: db } } };
        const { action } = await import("../../app/routes/api.todos");
        const response = await action({ request, context, params: {} } as any);
        const todo = await response.json();

        if (completed) {
          // Mark as completed
          const updateRequest = new Request(`http://localhost/api/todos/${todo.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ completed: true }),
          });

          const { action: updateAction } = await import("../../app/routes/api.todos.$id");
          await updateAction({ 
            request: updateRequest, 
            context, 
            params: { id: todo.id } 
          } as any);
        }

        return todo;
      };

      await createTodo("Todo 1", false);
      await createTodo("Todo 2", true);
      await createTodo("Todo 3", false);
    });

    it("should get all todos for authenticated user", async () => {
      const request = new Request("http://localhost/api/todos", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { loader } = await import("../../app/routes/api.todos");
      const response = await loader({ request, context, params: {} } as any);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.todos).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it("should filter completed todos", async () => {
      const request = new Request("http://localhost/api/todos?filter=completed", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { loader } = await import("../../app/routes/api.todos");
      const response = await loader({ request, context, params: {} } as any);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].completed).toBe(true);
    });

    it("should filter incomplete todos", async () => {
      const request = new Request("http://localhost/api/todos?filter=incomplete", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { loader } = await import("../../app/routes/api.todos");
      const response = await loader({ request, context, params: {} } as any);
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.todos).toHaveLength(2);
      expect(result.todos.every((todo: any) => !todo.completed)).toBe(true);
    });

    it("should reject unauthorized requests", async () => {
      const request = new Request("http://localhost/api/todos", {
        method: "GET",
      });

      const context = {
        cloudflare: { env: { DB: db } },
      };

      const { loader } = await import("../../app/routes/api.todos");
      const response = await loader({ request, context, params: {} } as any);
      
      expect(response.status).toBe(401);
    });
  });
});