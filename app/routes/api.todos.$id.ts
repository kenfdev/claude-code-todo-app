// import type { Route } from "./+types/api.todos.$id";
import { TodoService } from "../services/todo";
import { validateUpdateTodo } from "../utils/validation";
import { requireAuth, createErrorResponse, createSuccessResponse } from "../utils/auth-middleware";

export async function action({ request, context, params }: any) {
  const method = request.method;
  const todoId = params.id;

  if (!todoId) {
    return createErrorResponse("TodoのIDが必要です", 400);
  }

  try {
    switch (method) {
      case "GET":
        return await handleGetTodo(request, context, todoId);
      case "PATCH":
        return await handleUpdateTodo(request, context, todoId);
      case "DELETE":
        return await handleDeleteTodo(request, context, todoId);
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

export async function loader({ request, context, params }: any) {
  const todoId = params.id;

  if (!todoId) {
    return createErrorResponse("TodoのIDが必要です", 400);
  }

  try {
    return await handleGetTodo(request, context, todoId);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    
    console.error("API Error:", error);
    return createErrorResponse("内部サーバーエラーが発生しました", 500);
  }
}

async function handleGetTodo(request: Request, context: any, todoId: string) {
  const authContext = await requireAuth(request, context);

  try {
    const todoService = new TodoService(context.cloudflare.env.DB);
    const todo = await todoService.getTodoById(todoId, authContext.user.id);

    if (!todo) {
      return createErrorResponse("指定されたTodoが見つかりません", 404);
    }

    return createSuccessResponse(todo);
  } catch (error: any) {
    console.error("Todo retrieval error:", error);
    return createErrorResponse("Todoの取得中にエラーが発生しました", 500);
  }
}

async function handleUpdateTodo(request: Request, context: any, todoId: string) {
  const authContext = await requireAuth(request, context);

  let requestData: any;
  try {
    requestData = await request.json();
  } catch {
    return createErrorResponse("無効なJSONデータです", 400);
  }

  const validation = validateUpdateTodo(requestData);
  if (!validation.isValid) {
    return createErrorResponse(
      `バリデーションエラー: ${validation.errors.map(e => e.message).join(", ")}`,
      400
    );
  }

  try {
    const todoService = new TodoService(context.cloudflare.env.DB);
    const todo = await todoService.updateTodo(todoId, authContext.user.id, {
      title: requestData.title,
      description: requestData.description,
      completed: requestData.completed,
      priority: requestData.priority,
      dueDate: requestData.dueDate,
    });

    return createSuccessResponse(todo);
  } catch (error: any) {
    console.error("Todo update error:", error);
    
    if (error.message === "TODO_NOT_FOUND") {
      return createErrorResponse("指定されたTodoが見つかりません", 404);
    }
    
    if (error.message === "TODO_UPDATE_FAILED") {
      return createErrorResponse("Todoの更新に失敗しました", 500);
    }
    
    return createErrorResponse("Todoの更新中にエラーが発生しました", 500);
  }
}

async function handleDeleteTodo(request: Request, context: any, todoId: string) {
  const authContext = await requireAuth(request, context);

  try {
    const todoService = new TodoService(context.cloudflare.env.DB);
    await todoService.deleteTodo(todoId, authContext.user.id);

    return createSuccessResponse({ message: "Todoを削除しました" });
  } catch (error: any) {
    console.error("Todo deletion error:", error);
    
    if (error.message === "TODO_NOT_FOUND") {
      return createErrorResponse("指定されたTodoが見つかりません", 404);
    }
    
    return createErrorResponse("Todoの削除中にエラーが発生しました", 500);
  }
}