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

  it("renders separator lines between todos", () => {
    const { container } = render(<TodoList todos={mockTodos} />);
    
    const separators = container.querySelectorAll("hr");
    expect(separators).toHaveLength(1); // One separator for two todos
    
    const separator = separators[0];
    expect(separator).toHaveStyle({ borderColor: "rgba(110,80,73,0.2)" });
    expect(separator).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render separator after last todo", () => {
    const singleTodo = [mockTodos[0]];
    const { container } = render(<TodoList todos={singleTodo} />);
    
    const separators = container.querySelectorAll("hr");
    expect(separators).toHaveLength(0);
  });

  it("renders correct number of separators for multiple todos", () => {
    const threeTodos = [...mockTodos, { id: "3", title: "Test Todo 3", description: "Description 3", completed: false }];
    const { container } = render(<TodoList todos={threeTodos} />);
    
    const separators = container.querySelectorAll("hr");
    expect(separators).toHaveLength(2); // Two separators for three todos
  });
});