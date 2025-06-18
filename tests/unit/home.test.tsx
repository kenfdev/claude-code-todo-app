import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "../../app/routes/home";

describe("Home Route", () => {
  it("renders the Todo App header", () => {
    render(<Home />);
    
    const header = screen.getByRole("heading", { name: "Todo App", level: 1 });
    expect(header).toBeInTheDocument();
  });

  it("renders all hardcoded todos", () => {
    render(<Home />);
    
    expect(screen.getByText("Grocery Shopping")).toBeInTheDocument();
    expect(screen.getByText("Buy vegetables and fruits")).toBeInTheDocument();
    
    expect(screen.getByText("Finish Report")).toBeInTheDocument();
    expect(screen.getByText("Due by EOD")).toBeInTheDocument();
    
    expect(screen.getByText("Call Plumber")).toBeInTheDocument();
    expect(screen.getByText("Fix kitchen sink")).toBeInTheDocument();
    
    expect(screen.getByText("Workout")).toBeInTheDocument();
    expect(screen.getByText("1 hour of cardio")).toBeInTheDocument();
    
    expect(screen.getByText("Read Book")).toBeInTheDocument();
    expect(screen.getByText("Chapter 5 of 'Atomic Habits'")).toBeInTheDocument();
  });

  it("renders the AddTaskButton", () => {
    render(<Home />);
    
    const addButton = screen.getByRole("button", { name: "Add new task" });
    expect(addButton).toBeInTheDocument();
  });

  it("has proper page structure", () => {
    render(<Home />);
    
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Todo list" })).toBeInTheDocument();
  });
});