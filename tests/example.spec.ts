import { test, expect } from '@playwright/test';

const pngFile = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

function gerarCpfValido(seed = Date.now()) {
  const base = String(seed).padStart(9, '0').slice(-9).split('').map(Number);

  const calcularDigito = (digitos: number[]) => {
    const soma = digitos.reduce((total, digito, index) => total + digito * (digitos.length + 1 - index), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(base);
  const segundoDigito = calcularDigito([...base, primeiroDigito]);
  const cpf = [...base, primeiroDigito, segundoDigito].join('');

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

test('deve exibir erro ao acessar o WebRota com senha incorreta', async ({ page }) => {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_INVALID_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_INVALID_PASSWORD no .env');
  if (!username || !password) return;

  await page.goto('https://app.webrota.com.br/login');

  await expect(page).toHaveTitle(/WebRota/);

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Erro:Senha incorreta.')).toBeVisible();
});

test('deve acessar o WebRota com usuario valido', async ({ page }) => {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_PASSWORD no .env');
  if (!username || !password) return;

  await page.goto('https://app.webrota.com.br/login');

  await expect(page).toHaveTitle(/WebRota/);

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).not.toHaveURL(/\/login/);
});

test('deve preencher cadastro de novo cliente sem salvar', async ({ page }) => {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_PASSWORD no .env');
  if (!username || !password) return;

  const customerName = `Cliente Teste Automacao ${Date.now()}`;
  const customerEmail = `cliente.teste.${Date.now()}@example.com`;

  await page.goto('https://app.webrota.com.br/login');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/system/);

  await page.goto('https://app.webrota.com.br/admin/customer');
  await page.getByRole('button', { name: 'Novo' }).click();

  await expect(page).toHaveURL(/\/admin\/customer\/add/);
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible();

  await page.locator('input[name="aliases"]').fill('Cliente QA');
  await page.locator('input[name="name"]').fill(customerName);
  await page.locator('input[name="document_number"]').fill('11222333000181');
  await page.locator('input[name="email"]').fill(customerEmail);
  await page.locator('input[name="document_number_state"]').fill('ISENTO');
  await page.locator('textarea[name="observations"]').fill('Cadastro preenchido apenas para teste automatizado. Nao salvar.');

  await expect(page.locator('input[name="aliases"]')).toHaveValue('Cliente QA');
  await expect(page.locator('input[name="name"]')).toHaveValue(customerName);
  await expect(page.locator('input[name="email"]')).toHaveValue(customerEmail);
});

test('deve preencher cadastro de cliente pessoa fisica sem salvar', async ({ page }) => {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_PASSWORD no .env');
  if (!username || !password) return;

  const timestamp = Date.now();
  const customerName = `Pessoa Fisica Teste ${timestamp}`;
  const motherName = `Mae Teste ${timestamp}`;
  const customerEmail = `pessoa.fisica.${timestamp}@example.com`;
  const cpf = gerarCpfValido(timestamp);

  await page.goto('https://app.webrota.com.br/login');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/system/);

  await page.goto('https://app.webrota.com.br/admin/customer/add');
  await expect(page).toHaveURL(/\/admin\/customer\/add/);

  await page.locator('p-dropdown[name="person_type"] .ui-dropdown-trigger').click();
  await page.locator('.ui-dropdown-item:visible', { hasText: 'Pessoa Física' }).click();

  await page.locator('input[name="aliases"]').fill(customerName);
  await page.locator('input[name="name"]').fill(motherName);
  await page.locator('input[name="document_number"]').fill(cpf);
  await page.locator('input[name="email"]').fill(customerEmail);
  await page.locator('input[name="document_number_state"]').fill('123456789');
  await page.locator('textarea[name="observations"]').fill('Cadastro de pessoa fisica preenchido apenas para teste automatizado. Nao salvar.');

  await page.getByText('Documentos', { exact: true }).last().click();
  const anexarArquivo = async (documento: string, nomeArquivo: string) => {
    await page.locator('.upload-card-title', { hasText: documento }).locator('input[type="file"]').setInputFiles({
      name: nomeArquivo,
      mimeType: 'image/png',
      buffer: pngFile,
    });
  };

  await anexarArquivo('Comprovante', 'comprovante-residencia.png');
  await anexarArquivo('Documento', 'documento-pessoal.png');
  await anexarArquivo('Analise de crédito', 'analise-credito.png');

  await expect(page.locator('input[name="aliases"]')).toHaveValue(customerName);
  await expect(page.locator('input[name="name"]')).toHaveValue(motherName);
  await expect(page.locator('input[name="document_number"]')).toHaveValue(cpf);
  await expect(page.locator('input[name="email"]')).toHaveValue(customerEmail);
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible();
});

test('deve autenticar como usuario de cliente pelo impersonate', async ({ page }) => {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_PASSWORD no .env');
  if (!username || !password) return;

  await page.goto('https://app.webrota.com.br/login');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/system/);

  await page.goto('https://app.webrota.com.br/admin/customer');
  await page.getByRole('textbox').first().fill('webrota');
  await page.getByRole('button', { name: 'Pesquisar' }).click();

  await expect(page.getByText('Total de 4 registros.')).toBeVisible();

  const webrotaRow = page.locator('tbody tr:visible').filter({
    has: page.locator('td', { hasText: /^WEBROTA$/ }),
  });

  await expect(webrotaRow).toHaveCount(1);
  await expect(webrotaRow).toContainText('Software');

  await webrotaRow.locator('a[title="Autenticar com usuário"]').click();

  await expect(page.getByRole('heading', { name: 'Selecione o usuário' })).toBeVisible();
  await page.getByRole('button', { name: /^WEBROTA$/ }).click();

  await expect(page).toHaveURL(/\/app\/system/);
  await expect(page.locator('main').getByText('WEBROTA', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveTitle(/WebRota/);
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('impersonate'))).toBe('1');
});

test('deve validar aba geral de meus dados apos impersonate webrota', async ({ page }) => {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_PASSWORD no .env');
  if (!username || !password) return;

  await page.goto('https://app.webrota.com.br/login');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/system/);

  await page.goto('https://app.webrota.com.br/admin/customer');
  await page.getByRole('textbox').first().fill('webrota');
  await page.getByRole('button', { name: 'Pesquisar' }).click();

  const webrotaRow = page.locator('tbody tr:visible').filter({
    has: page.locator('td', { hasText: /^WEBROTA$/ }),
  });

  await expect(webrotaRow).toHaveCount(1);
  await webrotaRow.locator('a[title="Autenticar com usuário"]').click();

  await expect(page.getByRole('heading', { name: 'Selecione o usuário' })).toBeVisible();
  await page.getByRole('button', { name: /^WEBROTA$/ }).click();

  await expect(page).toHaveURL(/\/app\/system/);
  await expect(page.locator('main').getByText('WEBROTA', { exact: true }).first()).toBeVisible();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('impersonate'))).toBe('1');

  await page.getByRole('link', { name: /Meus dados/ }).click();

  await expect(page).toHaveURL(/\/app\/misc\/profile/);
  await expect(page.getByRole('heading', { name: 'Meus dados' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Geral' })).toBeVisible();

  const profileField = (label: string) => page.getByText(label, { exact: true }).locator('xpath=..').locator('input');

  await expect(page.locator('input[name="name"]')).toHaveValue('WEBROTA');
  await expect(page.locator('input[name="document_number"]')).toHaveValue('16995360000100');
  await expect(page.locator('input[name="consultant.name"]')).toHaveValue('YAGO SOUZA');
  await expect(profileField('Email')).toHaveValue('relacionamento@webrotacom.br');
  await expect(profileField('Endereço')).toHaveValue('Praça Dr Duarte');
  await expect(profileField('Número')).toHaveValue('10');
  await expect(profileField('Bairro')).toHaveValue('Centro');
  await expect(profileField('Cidade')).toHaveValue('Uberlandia');
  await expect(profileField('Estado')).toHaveValue('Minas Gerais');
  await expect(profileField('Telefone')).toHaveValue('34984237563');
});
