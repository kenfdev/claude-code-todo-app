import * as schema from "~/database/schema";

import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { ProtectedRoute } from "../components/protected-route";
import { useAuthContext } from "../components/auth-provider";
import { Link } from "react-router";

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
  const { user, logout } = useAuthContext();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            ToDoアプリへようこそ
          </h1>
          <p className="text-gray-600">
            アカウントを作成またはログインしてToDoリストの管理を開始しましょう。
          </p>
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログイン
            </Link>
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              アカウントを作成
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ToDoリスト機能
              </h2>
              <p className="text-gray-600">
                ここにToDoリストの機能が実装されます。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
