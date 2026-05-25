import { expect, test, type Page } from '@playwright/test';
import { WebrotaLoginPage } from '../pages/webrota-login-page';
import type { WebrotaLoginAccount } from './webrota-login-accounts';

export function skipWhenAccountIsMissing(account: WebrotaLoginAccount) {
  test.skip(!account.username || !account.password, `Informe ${account.usernameEnv} e ${account.passwordEnv} no .env`);
}

export async function loginWithAccount(page: Page, account: WebrotaLoginAccount) {
  skipWhenAccountIsMissing(account);
  if (!account.username || !account.password) return;

  const loginPage = new WebrotaLoginPage(page);

  await loginPage.goto();
  await loginPage.login(account.username, account.password);

  await expect(page).not.toHaveURL(/\/login/);

  if (account.expectedHomeUrl) {
    await expect(page).toHaveURL(account.expectedHomeUrl, { timeout: 60_000 });
  }
}
