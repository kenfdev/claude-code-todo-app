import type { Route } from "./+types/new";
import { redirect } from "react-router";
import { TodoCreateForm } from "../components/TodoCreateForm";
import { createTodoSchema } from "../lib/validations";
import { createTodo } from "../lib/db";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Task - Todo App" },
    { name: "description", content: "Create a new todo task" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = {
    title: formData.get("title"),
    notes: formData.get("notes"),
  };

  // Validate the data
  const result = createTodoSchema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      if (error.path.length > 0) {
        errors[error.path[0] as string] = error.message;
      }
    });
    
    return {
      errors,
      defaultValues: {
        title: typeof data.title === "string" ? data.title : "",
        notes: typeof data.notes === "string" ? data.notes : "",
      },
    };
  }

  try {
    // Create the todo
    await createTodo(context.db, {
      title: result.data.title,
      notes: result.data.notes || undefined,
    });

    // Redirect to home page
    return redirect("/");
  } catch (error) {
    console.error("Failed to create todo:", error);
    return {
      errors: {
        general: "Failed to create task. Please try again.",
      },
      defaultValues: {
        title: result.data.title,
        notes: result.data.notes || "",
      },
    };
  }
}

export default function NewTodo({ actionData }: Route.ComponentProps) {
  return (
    <TodoCreateForm 
      errors={actionData?.errors}
      defaultValues={actionData?.defaultValues}
    />
  );
}