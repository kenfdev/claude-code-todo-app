import type { Route } from "./+types/home";
import { TodoList } from "../components/TodoList";
import { AddTaskButton } from "../components/AddTaskButton";
import { getAllTodos } from "../lib/db";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo App" },
    { name: "description", content: "A modern todo application" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const todos = await getAllTodos(context.db);
    return { todos };
  } catch (error) {
    console.error("Failed to load todos:", error);
    // Return empty array as fallback
    return { todos: [] };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#281d1b] dark:text-gray-100">
            Todo App
          </h1>
        </header>
        <main>
          <TodoList todos={loaderData.todos} />
        </main>
        <AddTaskButton />
      </div>
    </div>
  );
}