import { useFetcher } from "react-router";
import type { Todo } from "./TodoList";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const fetcher = useFetcher();
  
  const handleToggle = () => {
    fetcher.submit(
      {
        todoId: todo.id,
        completed: String(!todo.completed),
      },
      { method: "post" }
    );
  };
  
  return (
    <div
      className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      role="listitem"
    >
      <input
        type="checkbox"
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onChange={handleToggle}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#4e3cdb] focus:ring-[#4e3cdb] focus:ring-2 cursor-pointer"
        aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1">
        <label
          htmlFor={`todo-${todo.id}`}
          className={`block font-medium cursor-pointer transition-all ${
            todo.completed
              ? "text-gray-500 dark:text-gray-500 line-through"
              : "text-[#281d1b] dark:text-gray-100"
          }`}
        >
          {todo.title}
        </label>
        {todo.notes && (
          <p className={`mt-1 text-sm transition-all ${
            todo.completed
              ? "text-gray-400 dark:text-gray-600 line-through"
              : "text-[rgba(46,24,20,0.62)] dark:text-gray-400"
          }`}>
            {todo.notes}
          </p>
        )}
      </div>
    </div>
  );
}