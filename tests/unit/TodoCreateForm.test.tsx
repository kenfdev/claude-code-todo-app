import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock React Router components for testing
vi.mock("react-router", () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

import { TodoCreateForm } from "../../app/components/TodoCreateForm";

describe("TodoCreateForm", () => {
  it("renders form with all fields", () => {
    render(<TodoCreateForm />);
    
    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByText("Task Name")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText("Enter task name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add notes")).toBeInTheDocument();
    
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("renders with default values", () => {
    const defaultValues = {
      title: "Default Title",
      notes: "Default Notes",
    };
    
    render(<TodoCreateForm defaultValues={defaultValues} />);
    
    const titleInput = screen.getByDisplayValue("Default Title");
    const notesInput = screen.getByDisplayValue("Default Notes");
    
    expect(titleInput).toBeInTheDocument();
    expect(notesInput).toBeInTheDocument();
  });

  it("renders errors when provided", () => {
    const errors = {
      title: "Title is required",
      notes: "Notes too long",
      general: "Something went wrong",
    };
    
    render(<TodoCreateForm errors={errors} />);
    
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Notes too long")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("updates form fields when user types", () => {
    render(<TodoCreateForm />);
    
    const titleInput = screen.getByPlaceholderText("Enter task name");
    const notesInput = screen.getByPlaceholderText("Add notes");
    
    fireEvent.change(titleInput, { target: { value: "New Task" } });
    fireEvent.change(notesInput, { target: { value: "Some notes" } });
    
    expect(titleInput).toHaveValue("New Task");
    expect(notesInput).toHaveValue("Some notes");
  });

  it("has proper form attributes", () => {
    const { container } = render(<TodoCreateForm />);
    
    const form = container.querySelector("#create-todo-form");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("id", "create-todo-form");
    
    const titleInput = screen.getByPlaceholderText("Enter task name");
    expect(titleInput).toHaveAttribute("name", "title");
    expect(titleInput).toHaveAttribute("required");
    
    const notesInput = screen.getByPlaceholderText("Add notes");
    expect(notesInput).toHaveAttribute("name", "notes");
    expect(notesInput).not.toHaveAttribute("required");
  });

  it("has proper accessibility attributes", () => {
    const errors = {
      title: "Title error",
      notes: "Notes error",
    };
    
    render(<TodoCreateForm errors={errors} />);
    
    const titleInput = screen.getByPlaceholderText("Enter task name");
    expect(titleInput).toHaveAttribute("aria-describedby", "title-error");
    
    const notesInput = screen.getByPlaceholderText("Add notes");
    expect(notesInput).toHaveAttribute("aria-describedby", "notes-error");
    
    expect(screen.getByRole("button", { name: "Add" })).toHaveAttribute("form", "create-todo-form");
  });
});