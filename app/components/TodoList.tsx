import { TodoItem } from "./TodoItem";

export interface Todo {
  id: string;
  title: string;
  notes?: string | null;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  activeTab?: string;
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <div role="list" aria-label="Todo list">
      {todos.map((todo, index) => (
        <div key={todo.id}>
          <TodoItem todo={todo} />
          {index < todos.length - 1 && (
            <hr 
              className="my-4 border-t" 
              style={{ borderColor: 'rgba(110,80,73,0.2)' }}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}