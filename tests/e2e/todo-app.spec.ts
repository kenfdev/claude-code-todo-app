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
})