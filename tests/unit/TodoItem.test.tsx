import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TodoItem } from "../../app/components/TodoItem";

describe("TodoItem", () => {
  const incompleteTodo = {
    id: "1",
    title: "Test Todo",
    notes: "Test Notes",
    completed: false,
  };

  const completedTodo = {
    id: "2",
    title: "Completed Todo",
    notes: "Completed Notes",
    completed: true,
  };

  it("renders todo item with title and notes", () => {
    render(<TodoItem todo={incompleteTodo} />);
    
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
    expect(screen.getByText("Test Notes")).toBeInTheDocument();
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

  it("does not render notes when not provided", () => {
    const todoWithoutNotes = {
      id: "3",
      title: "Todo without notes",
      completed: false,
    };
    
    render(<TodoItem todo={todoWithoutNotes} />);
    
    expect(screen.getByText("Todo without notes")).toBeInTheDocument();
    expect(screen.queryByText("Test Notes")).not.toBeInTheDocument();
  });
});