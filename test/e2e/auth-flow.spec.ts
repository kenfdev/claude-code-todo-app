import { test, expect } from '@playwright/test'

test.describe('認証フローE2Eテスト', () => {



  test('認証が必要なページへのアクセス制御', async ({ page }) => {
    // 未認証状態でホームページへアクセス
    await page.goto('/')

    // ログインページへリダイレクトされることを確認
    await page.waitForURL('/login')
    await expect(page.locator('h2')).toHaveText('アカウントにログイン')
  })


  test('パスワードリセットフロー', async ({ page }) => {
    // ログインページからパスワードリセットページへ
    await page.goto('/login')
    await page.click('a:has-text("パスワードを忘れた場合")')

    // パスワードリセットページの確認
    await page.waitForURL('/forgot-password')
    await expect(page.locator('h2')).toHaveText('パスワードをリセット')

    // メールアドレスを入力して送信
    await page.fill('input[name="email"]', 'reset@example.com')
    await page.click('button[type="submit"]')

    // 成功メッセージの確認
    await expect(page.locator('text=パスワードリセットのリンクをメールアドレスに送信しました')).toBeVisible({ timeout: 15000 })
  })

  test('レスポンシブデザイン - モバイル表示', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')

    // モバイルでもフォームが正しく表示されることを確認
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // フォームが画面幅に収まっていることを確認
    const formBox = await page.locator('form').boundingBox()
    expect(formBox?.width).toBeLessThanOrEqual(375)
  })
})