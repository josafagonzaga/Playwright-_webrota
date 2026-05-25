import { expect, type Locator, type Page } from '@playwright/test';

export class WebrotaLoginPage {
  readonly page: Page;
  readonly fleetOwnerModeLabel: Locator;
  readonly usernameInput: Locator;
  readonly companyDocumentInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fleetOwnerModeLabel = page.locator('label[for="switchYearly"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.companyDocumentInput = page.locator('input[name="cnpj"]');
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

  async loginAsFleetOwner(username: string, companyDocument: string, password: string) {
    await this.fleetOwnerModeLabel.click();
    await expect(this.companyDocumentInput).toBeVisible();

    await this.usernameInput.fill(username);
    await this.companyDocumentInput.fill(companyDocument);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectInvalidPasswordError() {
    await expect(this.page.getByText(/Senha incorreta/i)).toBeVisible();
  }
}
