import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TodoItem } from "../../app/components/TodoItem";

describe("TodoItem", () => {
  const incompleteTodo = {
    id: "1",
    title: "Test Todo",
    description: "Test Description",
    completed: false,
  };

  const completedTodo = {
    id: "2",
    title: "Completed Todo",
    description: "Completed Description",
    completed: true,
  };

  it("renders todo item with title and description", () => {
    render(<TodoItem todo={incompleteTodo} />);
    
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders checkbox with correct state for incomplete todo", () => {
    render(<TodoItem todo={incompleteTodo} />);
    
    const checkbox = screen.getByRole("checkbox", { name: "Mark Test Todo as complete" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders checkbox with correct state for completed todo", () => {
    render(<TodoItem todo={completedTodo} />);
    
    const checkbox = screen.getByRole("checkbox", { name: "Mark Completed Todo as complete" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it("has proper accessibility attributes", () => {
    render(<TodoItem todo={incompleteTodo} />);
    
    const listItem = screen.getByRole("listitem");
    expect(listItem).toBeInTheDocument();
    
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("id", "todo-1");
    
    const label = screen.getByText("Test Todo");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "todo-1");
  });
});