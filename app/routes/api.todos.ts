// import type { Route } from "./+types/api.todos";
import { TodoService } from "../services/todo";
import { validateCreateTodo, validateUpdateTodo } from "../utils/validation";
import { requireAuth, createErrorResponse, createSuccessResponse } from "../utils/auth-middleware";

export async function action({ request, context }: any) {
  const method = request.method;

  try {
    switch (method) {
      case "POST":
        return await handleCreateTodo(request, context);
      case "GET":
        return await handleGetTodos(request, context);
      default:
        return createErrorResponse("サポートされていないメソッドです", 405);
    }
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    
    console.error("API Error:", error);
    return createErrorResponse("内部サーバーエラーが発生しました", 500);
  }
}

export async function loader({ request, context }: any) {
  try {
    return await handleGetTodos(request, context);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    
    console.error("API Error:", error);
    return createErrorResponse("内部サーバーエラーが発生しました", 500);
  }
}

async function handleCreateTodo(request: Request, context: any) {
  const authContext = await requireAuth(request, context);
  
  let requestData: any;
  try {
    requestData = await request.json();
  } catch {
    return createErrorResponse("無効なJSONデータです", 400);
  }

  const validation = validateCreateTodo(requestData);
  if (!validation.isValid) {
    return createErrorResponse(
      `バリデーションエラー: ${validation.errors.map(e => e.message).join(", ")}`,
      400
    );
  }

  try {
    const todoService = new TodoService(context.cloudflare.env.DB);
    const todo = await todoService.createTodo(authContext.user.id, {
      title: requestData.title,
      description: requestData.description,
      priority: requestData.priority,
      dueDate: requestData.dueDate,
    });

    return createSuccessResponse(todo, 201);
  } catch (error: any) {
    console.error("Todo creation error:", error);
    
    if (error.message === "TODO_CREATION_FAILED") {
      return createErrorResponse("Todoの作成に失敗しました", 500);
    }
    
    return createErrorResponse("Todoの作成中にエラーが発生しました", 500);
  }
}

async function handleGetTodos(request: Request, context: any) {
  const authContext = await requireAuth(request, context);
  
  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
  const filter = url.searchParams.get("filter"); // "completed", "incomplete", or null for all

  try {
    const todoService = new TodoService(context.cloudflare.env.DB);
    
    let todos;
    if (filter === "completed") {
      const completedTodos = await todoService.getCompletedTodos(authContext.user.id);
      todos = {
        todos: completedTodos.slice(offset, offset + limit),
        total: completedTodos.length,
      };
    } else if (filter === "incomplete") {
      const incompleteTodos = await todoService.getIncompleteTodos(authContext.user.id);
      todos = {
        todos: incompleteTodos.slice(offset, offset + limit),
        total: incompleteTodos.length,
      };
    } else {
      todos = await todoService.getTodos(authContext.user.id, offset, limit);
    }

    return createSuccessResponse(todos);
  } catch (error: any) {
    console.error("Todo retrieval error:", error);
    return createErrorResponse("Todoの取得中にエラーが発生しました", 500);
  }
}