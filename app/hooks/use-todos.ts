import { useState, useEffect, useCallback } from "react";
import type { Todo, CreateTodoRequest, TodoListResponse } from "../types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem("accessToken");
  }, []);

  const createAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No access token found");
    }
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }, [getAuthToken]);

  const handleApiError = useCallback((error: any) => {
    if (error.message === "No access token found") {
      setError("認証が必要です。ログインしてください。");
      return;
    }
    
    if (error.status === 401) {
      setError("認証が無効です。再ログインしてください。");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return;
    }
    
    setError("エラーが発生しました。");
    console.error("API Error:", error);
  }, []);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/todos", {
        headers: createAuthHeaders(),
      });
      
      if (!response.ok) {
        throw { status: response.status, message: await response.text() };
      }
      
      const data: TodoListResponse = await response.json();
      setTodos(data.todos);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [createAuthHeaders, handleApiError]);

  const createTodo = useCallback(async (todoData: CreateTodoRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: createAuthHeaders(),
        body: JSON.stringify(todoData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || "Todo作成に失敗しました");
      }
      
      const newTodo: Todo = await response.json();
      setTodos(prev => [newTodo, ...prev]);
      return newTodo;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createAuthHeaders]);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: createAuthHeaders(),
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || "Todo更新に失敗しました");
      }
      
      const updatedTodo: Todo = await response.json();
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
      return updatedTodo;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createAuthHeaders]);

  const deleteTodo = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || "Todo削除に失敗しました");
      }
      
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createAuthHeaders]);

  const toggleComplete = useCallback(async (id: string, completed: boolean) => {
    return updateTodo(id, { completed });
  }, [updateTodo]);

  // Load todos on hook initialization
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchTodos();
    }
  }, [fetchTodos, getAuthToken]);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    clearError: () => setError(null),
  };
}