import { expect, test } from '@playwright/test';
import { WebrotaLoginPage } from './pages/webrota-login-page';
import { loginWithAccount } from './support/webrota-auth';
import { loginAccounts } from './support/webrota-login-accounts';

test.describe('WebRota login', () => {
  test('@login deve bloquear acesso com senha invalida', async ({ page }) => {
    const username = process.env.WEBROTA_USERNAME;
    const invalidPassword = process.env.WEBROTA_INVALID_PASSWORD;

    test.skip(!username || !invalidPassword, 'Informe WEBROTA_USERNAME e WEBROTA_INVALID_PASSWORD no .env');
    if (!username || !invalidPassword) return;

    const loginPage = new WebrotaLoginPage(page);

    await loginPage.goto();
    await loginPage.login(username, invalidPassword);

    await loginPage.expectInvalidPasswordError();
    await expect(page).toHaveURL(/\/login/);
  });

  for (const account of loginAccounts) {
    test(`@login deve autenticar usuario ${account.name}`, async ({ page }) => {
      await loginWithAccount(page, account);
    });
  }
});
