import type { Route } from "./+types/home";
import { TodoList } from "../components/TodoList";
import { AddTaskButton } from "../components/AddTaskButton";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo App" },
    { name: "description", content: "A modern todo application" },
  ];
}

const todos = [
  { id: "1", title: "Grocery Shopping", description: "Buy vegetables and fruits", completed: false },
  { id: "2", title: "Finish Report", description: "Due by EOD", completed: false },
  { id: "3", title: "Call Plumber", description: "Fix kitchen sink", completed: false },
  { id: "4", title: "Workout", description: "1 hour of cardio", completed: false },
  { id: "5", title: "Read Book", description: "Chapter 5 of 'Atomic Habits'", completed: false }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#281d1b] dark:text-gray-100">
            Todo App
          </h1>
        </header>
        <main>
          <TodoList todos={todos} />
        </main>
        <AddTaskButton />
      </div>
    </div>
  );
}