import { expect, test, type Page } from '@playwright/test';
import { WebrotaLoginPage } from '../pages/webrota-login-page';
import type { WebrotaLoginAccount } from './webrota-login-accounts';

export function skipWhenAccountIsMissing(account: WebrotaLoginAccount) {
  test.skip(!account.username || !account.password, `Informe ${account.usernameEnv} e ${account.passwordEnv} no .env`);
  test.skip(
    Boolean(account.companyDocumentEnv && !account.companyDocument),
    `Informe ${account.companyDocumentEnv} no .env`,
  );
}

export async function loginWithAccount(page: Page, account: WebrotaLoginAccount) {
  skipWhenAccountIsMissing(account);
  if (!account.username || !account.password) return;

  const loginPage = new WebrotaLoginPage(page);

  await test.step('Abrir tela de login', async () => {
    await loginPage.goto();
  });

  if (account.companyDocument) {
    await test.step('Selecionar login como frotista e enviar credenciais', async () => {
      await loginPage.loginAsFleetOwner(account.username, account.companyDocument, account.password);
    });
  } else {
    await test.step('Enviar credenciais de login geral', async () => {
      await loginPage.login(account.username, account.password);
    });
  }

  await test.step('Validar autenticacao realizada', async () => {
    await expect(page).not.toHaveURL(/\/login/);

    if (account.expectedHomeUrl) {
      await expect(page).toHaveURL(account.expectedHomeUrl, { timeout: 60_000 });
    }

    if (account.expectedLoggedUserName) {
      await expect(page.locator('main').getByText(account.expectedLoggedUserName, { exact: true }).first()).toBeVisible();
    }

    await expect(page.getByText('Sair', { exact: true }).first()).toBeVisible();
  });
}
