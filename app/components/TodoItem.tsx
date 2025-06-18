import type { Todo } from "./TodoList";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div
      className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      role="listitem"
    >
      <input
        type="checkbox"
        id={`todo-${todo.id}`}
        checked={todo.completed}
        readOnly
        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#4e3cdb] focus:ring-[#4e3cdb] focus:ring-2"
        aria-label={`Mark ${todo.title} as complete`}
      />
      <div className="flex-1">
        <label
          htmlFor={`todo-${todo.id}`}
          className="block text-[#281d1b] dark:text-gray-100 font-medium cursor-pointer"
        >
          {todo.title}
        </label>
        {todo.notes && (
          <p className="mt-1 text-sm text-[rgba(46,24,20,0.62)] dark:text-gray-400">
            {todo.notes}
          </p>
        )}
      </div>
    </div>
  );
}