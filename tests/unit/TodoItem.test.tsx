import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../../app/components/TodoItem";

const mockSubmit = vi.fn();

vi.mock("react-router", () => ({
  useFetcher: () => ({
    submit: mockSubmit,
  }),
}));

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
    
    const checkbox = screen.getByRole("checkbox", { name: "Mark Completed Todo as incomplete" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it("calls submit when checkbox is clicked for incomplete todo", async () => {
    mockSubmit.mockClear();
    const user = userEvent.setup();
    render(<TodoItem todo={incompleteTodo} />);
    
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    
    expect(mockSubmit).toHaveBeenCalledWith(
      {
        todoId: "1",
        completed: "true",
      },
      { method: "post" }
    );
  });

  it("calls submit when checkbox is clicked for completed todo", async () => {
    mockSubmit.mockClear();
    const user = userEvent.setup();
    render(<TodoItem todo={completedTodo} />);
    
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    
    expect(mockSubmit).toHaveBeenCalledWith(
      {
        todoId: "2",
        completed: "false",
      },
      { method: "post" }
    );
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

  it("applies strikethrough styling to completed todos", () => {
    render(<TodoItem todo={completedTodo} />);
    
    const title = screen.getByText("Completed Todo");
    expect(title).toHaveClass("line-through");
    
    const notes = screen.getByText("Completed Notes");
    expect(notes).toHaveClass("line-through");
  });

  it("does not apply strikethrough styling to incomplete todos", () => {
    render(<TodoItem todo={incompleteTodo} />);
    
    const title = screen.getByText("Test Todo");
    expect(title).not.toHaveClass("line-through");
    
    const notes = screen.getByText("Test Notes");
    expect(notes).not.toHaveClass("line-through");
  });
});