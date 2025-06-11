export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
}

export type TodoPriority = "low" | "medium" | "high";