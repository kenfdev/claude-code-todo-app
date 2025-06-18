import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router";
import Home from "../../app/routes/home";

describe("Home Route", () => {
  const mockLoaderData = {
    todos: [
      { id: "1", title: "Test Todo 1", notes: "Test Notes 1", completed: false },
      { id: "2", title: "Test Todo 2", notes: "Test Notes 2", completed: true },
    ],
  };

  const renderWithRouter = (loaderData = mockLoaderData) => {
    return render(
      <MemoryRouter>
        <Home loaderData={loaderData} />
      </MemoryRouter>
    );
  };

  it("renders the Todo App header", () => {
    renderWithRouter();
    
    const header = screen.getByRole("heading", { name: "Todo App", level: 1 });
    expect(header).toBeInTheDocument();
  });

  it("renders todos from loader data", () => {
    renderWithRouter();
    
    expect(screen.getByText("Test Todo 1")).toBeInTheDocument();
    expect(screen.getByText("Test Notes 1")).toBeInTheDocument();
    
    expect(screen.getByText("Test Todo 2")).toBeInTheDocument();
    expect(screen.getByText("Test Notes 2")).toBeInTheDocument();
  });

  it("renders the AddTaskButton as a link", () => {
    renderWithRouter();
    
    const addButton = screen.getByRole("link", { name: "Add new task" });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute("href", "/new");
  });

  it("has proper page structure", () => {
    renderWithRouter();
    
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Todo list" })).toBeInTheDocument();
  });

  it("renders empty list when no todos", () => {
    renderWithRouter({ todos: [] });
    
    expect(screen.getByRole("list", { name: "Todo list" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});