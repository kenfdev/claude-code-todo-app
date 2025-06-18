import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TodoList } from "../../app/components/TodoList";

describe("TodoList", () => {
  const mockTodos = [
    { id: "1", title: "Test Todo 1", description: "Description 1", completed: false },
    { id: "2", title: "Test Todo 2", description: "Description 2", completed: true },
  ];

  it("renders a list of todos", () => {
    render(<TodoList todos={mockTodos} />);
    
    expect(screen.getByRole("list", { name: "Todo list" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders each todo with correct content", () => {
    render(<TodoList todos={mockTodos} />);
    
    expect(screen.getByText("Test Todo 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Test Todo 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("renders empty list when no todos", () => {
    render(<TodoList todos={[]} />);
    
    expect(screen.getByRole("list", { name: "Todo list" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});