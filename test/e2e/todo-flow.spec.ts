import { test, expect } from "@playwright/test";

test.describe("Todo Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Register and login a test user
    await page.goto("/register");
    
    // Register with unique email
    const uniqueEmail = `test+${Date.now()}@example.com`;
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="phoneNumber"]', "123-456-7890");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');
    
    // Should redirect to home page after successful registration
    await expect(page).toHaveURL("/");
  });

  test("should allow user to create a new todo", async ({ page }) => {
    // Verify we're on the home page with empty todo list
    await expect(page.locator("h1")).toContainText("ToDoアプリ");
    await expect(page.locator("text=Todoがありません")).toBeVisible();

    // Click "Create Todo" button
    await page.click("text=新しいTodoを作成");

    // Verify the form is displayed
    await expect(page.locator("text=Create Task")).toBeVisible();

    // Fill out the todo form
    await page.fill('input[placeholder="Enter task name"]', "Buy groceries");
    await page.fill('input[type="date"]', "2024-12-31");
    await page.selectOption('select', "high");
    await page.fill('textarea[placeholder="Add notes"]', "Need to buy milk, bread, and eggs");

    // Submit the form
    await page.click('button:has-text("Add Task")');

    // Verify the todo was created and appears in the list
    await expect(page.locator("text=Buy groceries")).toBeVisible();
    await expect(page.locator("text=Need to buy milk, bread, and eggs")).toBeVisible();
    await expect(page.locator("text=高")).toBeVisible(); // High priority badge
    await expect(page.locator("text=期限: 2024/12/31")).toBeVisible();

    // Verify the form is hidden after successful creation
    await expect(page.locator("text=Create Task")).not.toBeVisible();
    await expect(page.locator("text=新しいTodoを作成")).toBeVisible();

    // Verify the todo count is updated
    await expect(page.locator("text=Todoリスト (1)")).toBeVisible();
    await expect(page.locator("text=完了: 0 / 1")).toBeVisible();
  });

  test("should prevent creating todo with empty title", async ({ page }) => {
    // Click "Create Todo" button
    await page.click("text=新しいTodoを作成");

    // Try to submit without entering a title
    await page.click('button:has-text("Add Task")');

    // Verify validation error is shown
    await expect(page.locator("text=タイトルは必須です")).toBeVisible();

    // Verify todo was not created
    await expect(page.locator("text=Todoがありません")).toBeVisible();
  });

  test("should allow user to complete a todo", async ({ page }) => {
    // First create a todo
    await page.click("text=新しいTodoを作成");
    await page.fill('input[placeholder="Enter task name"]', "Complete me");
    await page.click('button:has-text("Add Task")');

    // Verify todo is created
    await expect(page.locator("text=Complete me")).toBeVisible();

    // Click the checkbox to complete the todo
    await page.click('button[role="checkbox"]');

    // Verify todo is marked as completed
    await expect(page.locator("text=Complete me")).toHaveClass(/line-through/);
    await expect(page.locator("text=完了: 1 / 1")).toBeVisible();
  });

  test("should allow user to edit a todo", async ({ page }) => {
    // First create a todo
    await page.click("text=新しいTodoを作成");
    await page.fill('input[placeholder="Enter task name"]', "Original title");
    await page.fill('textarea[placeholder="Add notes"]', "Original description");
    await page.click('button:has-text("Add Task")');

    // Click edit button
    await page.click('button[title="編集"]');

    // Edit the todo
    await page.fill('input[value="Original title"]', "Updated title");
    await page.fill('textarea:has-text("Original description")', "Updated description");
    await page.selectOption('select', "high");

    // Save changes
    await page.click('button:has-text("保存")');

    // Verify changes are saved
    await expect(page.locator("text=Updated title")).toBeVisible();
    await expect(page.locator("text=Updated description")).toBeVisible();
    await expect(page.locator("text=高")).toBeVisible(); // High priority badge
  });

  test("should allow user to delete a todo", async ({ page }) => {
    // First create a todo
    await page.click("text=新しいTodoを作成");
    await page.fill('input[placeholder="Enter task name"]', "Delete me");
    await page.click('button:has-text("Add Task")');

    // Verify todo is created
    await expect(page.locator("text=Delete me")).toBeVisible();

    // Accept the confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('このTodoを削除しますか？');
      await dialog.accept();
    });

    // Click delete button
    await page.click('button[title="削除"]');

    // Verify todo is deleted
    await expect(page.locator("text=Delete me")).not.toBeVisible();
    await expect(page.locator("text=Todoがありません")).toBeVisible();
  });

  test("should persist todos across page reloads", async ({ page }) => {
    // Create a todo
    await page.click("text=新しいTodoを作成");
    await page.fill('input[placeholder="Enter task name"]', "Persistent todo");
    await page.click('button:has-text("Add Task")');

    // Verify todo is created
    await expect(page.locator("text=Persistent todo")).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify todo is still there
    await expect(page.locator("text=Persistent todo")).toBeVisible();
    await expect(page.locator("text=Todoリスト (1)")).toBeVisible();
  });

  test("should show error message for network failures", async ({ page }) => {
    // Block network requests to simulate failure
    await page.route("/api/todos", route => route.abort());

    // Try to create a todo
    await page.click("text=新しいTodoを作成");
    await page.fill('input[placeholder="Enter task name"]', "Failed todo");
    await page.click('button:has-text("Add Task")');

    // Verify error message is shown
    await expect(page.locator("text=エラーが発生しました")).toBeVisible();
  });

  test("should maintain authentication state", async ({ page }) => {
    // Verify user is logged in
    await expect(page.locator("text=こんにちは、Test Userさん")).toBeVisible();
    
    // Verify logout button is available
    await expect(page.locator("text=ログアウト")).toBeVisible();

    // Create a todo to ensure we have access to protected functionality
    await page.click("text=新しいTodoを作成");
    await page.fill('input[placeholder="Enter task name"]', "Auth test todo");
    await page.click('button:has-text("Add Task")');

    // Verify todo creation succeeded (proves authentication is working)
    await expect(page.locator("text=Auth test todo")).toBeVisible();
  });
});