import { TodoItem } from "./TodoItem";

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <div className="space-y-4" role="list" aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}