import { test, expect } from '@playwright/test'

test.describe('認証フローE2Eテスト', () => {
  test('完全な認証フロー: 登録→ログアウト→ログイン', async ({ page }) => {
    // テスト用のランダムメールアドレスを生成
    const timestamp = Date.now()
    const testEmail = `e2e-test-${timestamp}@example.com`
    const testPassword = 'SecurePass123!'

    // 1. 登録ページへ移動
    await page.goto('/register')
    
    // 登録フォームが表示されることを確認
    await expect(page.locator('h1')).toHaveText('新規登録')

    // 2. 登録フォームに入力
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    await page.fill('input[name="firstName"]', 'E2E')
    await page.fill('input[name="lastName"]', 'テスト')
    await page.fill('input[name="phoneNumber"]', '+81901234567')

    // 3. 登録ボタンをクリック
    await page.click('button[type="submit"]')

    // 4. ホームページへリダイレクトされることを確認
    await page.waitForURL('/')
    await expect(page.locator('h1')).toContainText('ようこそ')

    // ユーザー名が表示されることを確認
    await expect(page.locator('text=E2E テスト')).toBeVisible()

    // 5. ログアウト
    await page.click('button:has-text("ログアウト")')

    // ログインページへリダイレクトされることを確認
    await page.waitForURL('/login')

    // 6. 同じ認証情報で再ログイン
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')

    // 7. 再度ホームページへリダイレクトされることを確認
    await page.waitForURL('/')
    await expect(page.locator('text=E2E テスト')).toBeVisible()
  })

  test('無効な認証情報でのログイン失敗', async ({ page }) => {
    await page.goto('/login')

    // 存在しないユーザーでログイン試行
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=メールアドレスまたはパスワードが正しくありません')).toBeVisible()
    
    // URLが変わらないことを確認
    expect(page.url()).toContain('/login')
  })

  test('バリデーションエラーの表示', async ({ page }) => {
    await page.goto('/register')

    // 無効なメールアドレス
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'Pass123!')
    await page.fill('input[name="confirmPassword"]', 'Pass123!')
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    
    await page.click('button[type="submit"]')

    // メールアドレスのエラーメッセージを確認
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible()

    // 弱いパスワード
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', '123')
    await page.fill('input[name="confirmPassword"]', '123')
    
    await page.click('button[type="submit"]')

    // パスワードのエラーメッセージを確認
    await expect(page.locator('text=パスワードは8文字以上で入力してください')).toBeVisible()

    // パスワード不一致
    await page.fill('input[name="password"]', 'ValidPass123!')
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!')
    
    await page.click('button[type="submit"]')

    // パスワード不一致のエラーメッセージを確認
    await expect(page.locator('text=パスワードが一致しません')).toBeVisible()
  })

  test('認証が必要なページへのアクセス制御', async ({ page }) => {
    // 未認証状態でホームページへアクセス
    await page.goto('/')

    // ログインページへリダイレクトされることを確認
    await page.waitForURL('/login')
    await expect(page.locator('h1')).toHaveText('ログイン')
  })

  test('セッションの永続性', async ({ page, context }) => {
    const timestamp = Date.now()
    const testEmail = `persistence-${timestamp}@example.com`
    const testPassword = 'PersistPass123!'

    // 登録してログイン
    await page.goto('/register')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    await page.fill('input[name="firstName"]', '永続')
    await page.fill('input[name="lastName"]', 'テスト')
    await page.click('button[type="submit"]')

    await page.waitForURL('/')

    // 新しいページ（タブ）を開く
    const newPage = await context.newPage()
    await newPage.goto('/')

    // 新しいタブでもログイン状態が維持されていることを確認
    await expect(newPage.locator('text=永続 テスト')).toBeVisible()

    // ページをリロード
    await page.reload()

    // リロード後もログイン状態が維持されていることを確認
    await expect(page.locator('text=永続 テスト')).toBeVisible()
  })

  test('パスワードリセットフロー', async ({ page }) => {
    // ログインページからパスワードリセットページへ
    await page.goto('/login')
    await page.click('a:has-text("パスワードを忘れた方はこちら")')

    // パスワードリセットページの確認
    await page.waitForURL('/forgot-password')
    await expect(page.locator('h1')).toHaveText('パスワードリセット')

    // メールアドレスを入力して送信
    await page.fill('input[name="email"]', 'reset@example.com')
    await page.click('button[type="submit"]')

    // 成功メッセージの確認
    await expect(page.locator('text=パスワードリセットのメールを送信しました')).toBeVisible()
  })

  test('レスポンシブデザイン - モバイル表示', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')

    // モバイルでもフォームが正しく表示されることを確認
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // フォームが画面幅に収まっていることを確認
    const formBox = await page.locator('form').boundingBox()
    expect(formBox?.width).toBeLessThanOrEqual(375)
  })
})