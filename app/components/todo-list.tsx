import { TodoItem } from "./todo-item";
import type { Todo } from "../types/todo";

interface TodoListProps {
  todos: Todo[];
  loading?: boolean;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoList({ 
  todos, 
  loading = false, 
  onToggleComplete, 
  onUpdate, 
  onDelete 
}: TodoListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Todoがありません</h3>
        <p className="mt-1 text-sm text-gray-500">
          新しいTodoを作成して始めましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}