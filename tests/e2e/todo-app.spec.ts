import { test, expect } from '@playwright/test'

test.describe('Todo App Critical Paths', () => {
  test('should display the home page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check page title and header
    await expect(page).toHaveTitle('Todo App')
    await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible()
    
    // Check that the todo list is present (even if empty)
    await expect(page.getByRole('list', { name: 'Todo list' })).toBeVisible()
    
    // Check that the Add Task button is present (uses aria-label)
    await expect(page.getByRole('link', { name: 'Add new task' })).toBeVisible()
  })

  test('should navigate to create new todo page', async ({ page }) => {
    await page.goto('/')
    
    // Click the Add Task button (uses aria-label)
    await page.getByRole('link', { name: 'Add new task' }).click()
    
    // Should navigate to /new page
    await expect(page).toHaveURL('/new')
    await expect(page).toHaveTitle('Create Task - Todo App')
    
    // Check form elements are present (using placeholders and names)
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('textarea[name="notes"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
  })

  test('should create a new todo successfully', async ({ page }) => {
    await page.goto('/new')
    
    // Fill in the form using name attributes - use unique title
    const uniqueTitle = `Test Todo Item ${Date.now()}`
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.locator('textarea[name="notes"]').fill('This is a test note')
    
    // Submit the form
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
    
    // The new todo should be visible in the list
    await expect(page.getByText(uniqueTitle).first()).toBeVisible()
    await expect(page.getByText('This is a test note').first()).toBeVisible()
  })

  test('should show validation errors for empty title', async ({ page }) => {
    await page.goto('/new')
    
    // Try to submit form without title
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Check if we're still on the same page (validation should prevent submission)
    await expect(page).toHaveURL('/new')
    
    // Since HTML5 validation might prevent form submission, let's check if the field is required
    const titleInput = page.locator('input[name="title"]')
    await expect(titleInput).toHaveAttribute('required')
  })

  test('should display todo items with checkboxes', async ({ page }) => {
    // First create a todo with unique name
    await page.goto('/new')
    const uniqueTitle = `Checkbox Test Todo ${Date.now()}`
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Go back to home
    await expect(page).toHaveURL('/')
    
    // Check that the todo item has a checkbox
    const todoItem = page.getByText(uniqueTitle).first()
    await expect(todoItem).toBeVisible()
    
    // Find the checkbox for this todo
    const checkbox = page.locator('input[type="checkbox"]').first()
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()
  })

  test('complete todo creation flow', async ({ page }) => {
    // Start from home page
    await page.goto('/')
    
    // Navigate to create new todo
    await page.getByRole('link', { name: 'Add new task' }).click()
    await expect(page).toHaveURL('/new')
    
    // Create a todo with both title and notes - use unique title
    const uniqueTitle = `Complete Flow Test ${Date.now()}`
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.locator('textarea[name="notes"]').fill('Testing the complete flow')
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Verify redirect and content
    await expect(page).toHaveURL('/')
    await expect(page.getByText(uniqueTitle).first()).toBeVisible()
    await expect(page.getByText('Testing the complete flow').first()).toBeVisible()
    
    // Verify we can navigate to create another todo
    await page.getByRole('link', { name: 'Add new task' }).click()
    await expect(page).toHaveURL('/new')
    
    // Verify form is empty/reset
    await expect(page.locator('input[name="title"]')).toHaveValue('')
    await expect(page.locator('textarea[name="notes"]')).toHaveValue('')
  })

  test('should toggle todo completion status', async ({ page }) => {
    // Create a new todo
    await page.goto('/new')
    const uniqueTitle = `Completion Test ${Date.now()}`
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Wait for redirect to home
    await expect(page).toHaveURL('/')
    
    // Find the checkbox for the created todo
    const todoItem = page.getByText(uniqueTitle).first()
    await expect(todoItem).toBeVisible()
    
    // Get the checkbox associated with this todo
    const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${uniqueTitle}`) })
    await expect(checkbox).not.toBeChecked()
    
    // Click to complete the todo
    await checkbox.click()
    
    // The checkbox should now be checked
    await expect(checkbox).toBeChecked()
    
    // The todo text should have strikethrough styling
    await expect(todoItem).toHaveClass(/line-through/)
  })

  test('should filter todos by completion status using tabs', async ({ page }) => {
    // Create two todos - one to complete, one to leave incomplete
    await page.goto('/new')
    const incompleteTodo = `Incomplete Todo ${Date.now()}`
    await page.locator('input[name="title"]').fill(incompleteTodo)
    await page.getByRole('button', { name: 'Add' }).click()
    
    await page.goto('/new')
    const completeTodo = `Complete Todo ${Date.now()}`
    await page.locator('input[name="title"]').fill(completeTodo)
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Mark the second todo as complete
    await page.goto('/')
    const completeCheckbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${completeTodo}`) })
    await completeCheckbox.click()
    await expect(completeCheckbox).toBeChecked()
    
    // Both todos should be visible in the incomplete tab by default
    await expect(page.getByText(incompleteTodo)).toBeVisible()
    await expect(page.getByText(completeTodo)).not.toBeVisible()
    
    // Click on completed tab
    await page.getByRole('tab', { name: '完了' }).click()
    
    // Only completed todo should be visible
    await expect(page.getByText(completeTodo)).toBeVisible()
    await expect(page.getByText(incompleteTodo)).not.toBeVisible()
    
    // Go back to incomplete tab
    await page.getByRole('tab', { name: '未完了' }).click()
    
    // Only incomplete todo should be visible
    await expect(page.getByText(incompleteTodo)).toBeVisible()
    await expect(page.getByText(completeTodo)).not.toBeVisible()
  })

  test('should persist todo completion status after page reload', async ({ page }) => {
    // Create a new todo
    await page.goto('/new')
    const uniqueTitle = `Persistence Test ${Date.now()}`
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.locator('textarea[name="notes"]').fill('Test persistence')
    await page.getByRole('button', { name: 'Add' }).click()
    
    // Complete the todo
    await page.goto('/')
    const checkbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${uniqueTitle}`) })
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    
    // Reload the page
    await page.reload()
    
    // Navigate to completed tab
    await page.getByRole('tab', { name: '完了' }).click()
    
    // The todo should still be marked as complete
    const reloadedCheckbox = page.getByRole('checkbox', { name: new RegExp(`Mark ${uniqueTitle}`) })
    await expect(reloadedCheckbox).toBeChecked()
    
    // The todo should have strikethrough styling
    const todoText = page.getByText(uniqueTitle)
    await expect(todoText).toHaveClass(/line-through/)
  })
})