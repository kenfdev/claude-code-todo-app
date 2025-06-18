import type { Route } from "./+types/home";
import { TodoList } from "../components/TodoList";
import { AddTaskButton } from "../components/AddTaskButton";
import { getAllTodos, toggleTodoComplete, getIncompleteTodos, getCompletedTodos } from "../lib/db";
import { useSearchParams } from "react-router";
import type { TabType } from "../types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo App" },
    { name: "description", content: "A modern todo application" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const tabParam = url.searchParams.get("tab");
    const tab: TabType = (tabParam === "completed" || tabParam === "incomplete") ? tabParam : "incomplete";
    
    let todos;
    if (tab === "completed") {
      todos = await getCompletedTodos(context.db);
    } else {
      todos = await getIncompleteTodos(context.db);
    }
    
    return { todos, activeTab: tab };
  } catch (error) {
    console.error("Failed to load todos:", error);
    // Return empty array as fallback
    return { todos: [], activeTab: "incomplete" as TabType };
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const todoId = formData.get("todoId");
  const completed = formData.get("completed") === "true";
  
  if (typeof todoId !== "string") {
    return { error: "Invalid todo ID" };
  }
  
  try {
    await toggleTodoComplete(context.db, todoId, completed);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle todo:", error);
    return { error: "Failed to update todo" };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = loaderData.activeTab || "incomplete";
  
  const handleTabChange = (tab: TabType) => {
    // Use View Transitions API if available for smoother transitions
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setSearchParams({ tab });
      });
    } else {
      setSearchParams({ tab });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#281d1b] dark:text-gray-100">
            Todo App
          </h1>
        </header>
        <main>
          <div className="mb-6">
            <div role="tablist" className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
              <button
                role="tab"
                aria-selected={activeTab === "incomplete"}
                onClick={() => handleTabChange("incomplete")}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === "incomplete"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                未完了
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "completed"}
                onClick={() => handleTabChange("completed")}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === "completed"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                完了
              </button>
            </div>
          </div>
          <TodoList todos={loaderData.todos} activeTab={activeTab} />
        </main>
        <AddTaskButton />
      </div>
    </div>
  );
}