import { expect, type Locator, type Page } from '@playwright/test';

export class WebrotaLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveTitle(/WebRota/);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectInvalidPasswordError() {
    await expect(this.page.getByText(/Senha incorreta/i)).toBeVisible();
  }
}
