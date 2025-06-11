import * as schema from "~/database/schema";

import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { ProtectedRoute } from "../components/protected-route";
import { useAuthContext } from "../components/auth-provider";
import { useSession } from "../hooks/use-session";
import { Link, Navigate } from "react-router";
import { useState } from "react";
import { TodoForm } from "../components/todo-form";
import { TodoList } from "../components/todo-list";
import { useTodos } from "../hooks/use-todos";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  let name = formData.get("name");
  let email = formData.get("email");
  if (typeof name !== "string" || typeof email !== "string") {
    return { guestBookError: "Name and email are required" };
  }

  name = name.trim();
  email = email.trim();
  if (!name || !email) {
    return { guestBookError: "Name and email are required" };
  }

  try {
    await context.db.insert(schema.guestBook).values({ name, email });
  } catch (error) {
    return { guestBookError: "Error adding to guest book" };
  }
}

export async function loader({ context }: Route.LoaderArgs) {
  const guestBook = await context.db.query.guestBook.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return {
    guestBook,
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <ProtectedRoute>
      <HomeContent actionData={actionData} loaderData={loaderData} />
    </ProtectedRoute>
  );
}

function HomeContent({ actionData, loaderData }: Route.ComponentProps) {
  const { user, logout } = useSession();
  const { todos, loading, error, createTodo, updateTodo, deleteTodo, toggleComplete, clearError } = useTodos();
  const [showForm, setShowForm] = useState(false);

  // Add safety check for user
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleCreateTodo = async (todoData: any) => {
    try {
      await createTodo(todoData);
      setShowForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await toggleComplete(id, completed);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateTodo = async (id: string, updates: any) => {
    try {
      await updateTodo(id, updates);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">ToDoアプリ</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                こんにちは、{user.firstName} {user.lastName}さん
              </span>
              <button
                onClick={logout}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <div>
              <span>エラーが発生しました</span>
              <div className="text-sm mt-1">{error}</div>
            </div>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Todo Form */}
          <div>
            {showForm ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">新しいTodo</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <TodoForm
                  onSubmit={handleCreateTodo}
                  loading={loading}
                  error={error}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Todoを作成</h3>
                <p className="text-gray-500 mb-4">新しいタスクを追加して管理を始めましょう</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  新しいTodoを作成
                </button>
              </div>
            )}
          </div>

          {/* Todo List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Todoリスト ({todos.length})
              </h2>
              {todos.length > 0 && (
                <div className="text-sm text-gray-500">
                  完了: {todos.filter(t => t.completed).length} / {todos.length}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow">
              {todos.length === 0 && !loading ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Todoがありません</h3>
                  <p className="mt-1 text-sm text-gray-500">最初のTodoを作成してみましょう。</p>
                </div>
              ) : (
                <div className="p-4">
                  <TodoList
                    todos={todos}
                    loading={loading}
                    onToggleComplete={handleToggleComplete}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
