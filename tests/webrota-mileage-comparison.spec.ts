import { expect, Page, test } from '@playwright/test';

const appUrl = 'https://app.webrota.com.br';
const defaultVehicleName = process.env.WEBROTA_TEST_VEHICLE || 'Tarde - RFA-5C24';
const mileageToleranceKm = Number(process.env.WEBROTA_MILEAGE_TOLERANCE_KM || '0.05');

type RuntimeLog = {
  type: 'console' | 'requestfailed' | 'http';
  message: string;
};

type Period = {
  startDate: string;
  startHour: string;
  startMinute: string;
  endDate: string;
  endHour: string;
  endMinute: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDatePtBr(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function buildComparableLast48HoursPeriod(now = new Date()): Period {
  const end = new Date(now);
  end.setHours(23, 59, 0, 0);

  // Use the largest comparable window accepted by both UIs without crossing the 48h validation.
  const start = new Date(end);
  start.setDate(end.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  return {
    startDate: formatDatePtBr(start),
    startHour: String(start.getHours()).padStart(2, '0'),
    startMinute: String(start.getMinutes()).padStart(2, '0'),
    endDate: formatDatePtBr(end),
    endHour: String(end.getHours()).padStart(2, '0'),
    endMinute: String(end.getMinutes()).padStart(2, '0'),
  };
}

function formatPeriodForMessage(period: Period) {
  return `${period.startDate} ${period.startHour}:${period.startMinute} ate ${period.endDate} ${period.endHour}:${period.endMinute}`;
}

function parseDistanceKm(value: string) {
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*km/i);
  if (!match) {
    throw new Error(`Nao foi possivel extrair distancia em km de: "${value}"`);
  }

  return Number(match[1].replace(',', '.'));
}

function parseMapDistanceKm(pageText: string) {
  const match = pageText.match(/Dist[aâ]ncia percorrida\s+(\d+(?:[.,]\d+)?)\s*km/i);
  if (!match) {
    throw new Error('Nao foi possivel extrair "Distancia percorrida" do mapa.');
  }

  return Number(match[1].replace(',', '.'));
}

async function setCalendarInputValueByKeyboard(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await expect(input).toBeVisible();
  await input.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(value);
  await page.keyboard.press('Tab');
  await expect(input).toHaveValue(value);
}

async function setCalendarInputValue(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await expect(input).toBeVisible();
  await input.fill(value, { force: true });
  await page.keyboard.press('Tab');

  if ((await input.inputValue()) !== value) {
    await input.click({ force: true });
    await input.press('Control+A');
    await input.press('Backspace');
    await input.pressSequentially(value);
    await page.keyboard.press('Tab');
  }

  if ((await input.inputValue()) !== value) {
    await input.evaluate((element, nextValue) => {
      const inputElement = element as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

      valueSetter?.call(inputElement, nextValue);
      inputElement.dispatchEvent(new InputEvent('input', { bubbles: true, data: nextValue }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  await expect(input).toHaveValue(value);
}

async function setSpinnerInputValueByKeyboard(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await expect(input).toBeVisible();

  await input.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.type(value);
  await page.keyboard.press('Tab');

  await expect.poll(async () => Number(await input.inputValue())).toBe(Number(value));
}

async function setSpinnerInputValue(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await expect(input).toBeVisible();

  await input.fill(value, { force: true });
  await input.press('Tab');

  if ((await input.inputValue()) !== value) {
    await input.click({ clickCount: 3, force: true });
    await input.press('Backspace');
    await input.pressSequentially(value);
    await input.press('Tab');
  }

  await expect(input).toHaveValue(value);
}

async function setSpinnerInputValueByButtons(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await expect(input).toBeVisible();

  const spinner = input.locator('xpath=ancestor::*[contains(@class, "ui-spinner")][1]');
  const upButton = spinner.locator('.ui-spinner-up');
  const downButton = spinner.locator('.ui-spinner-down');
  const targetValue = Number(value);

  await expect.poll(async () => Number(await input.inputValue())).not.toBeNaN();

  let currentValue = Number(await input.inputValue());
  const button = targetValue >= currentValue ? upButton : downButton;

  for (let index = 0; index < Math.abs(targetValue - currentValue); index += 1) {
    await button.click({ force: true });
  }

  await expect.poll(async () => Number(await input.inputValue())).toBe(targetValue);
}

async function fillPeriod(
  page: Page,
  period: Period,
  fieldNames: { startDate: string; endDate: string },
  calendarStrategy: 'fill' | 'keyboard' = 'fill',
  spinnerStrategy: 'fill' | 'keyboard' | 'buttons' = 'fill',
) {
  const setCalendarValue = calendarStrategy === 'keyboard' ? setCalendarInputValueByKeyboard : setCalendarInputValue;
  const setSpinnerValue =
    spinnerStrategy === 'keyboard'
      ? setSpinnerInputValueByKeyboard
      : spinnerStrategy === 'buttons'
        ? setSpinnerInputValueByButtons
        : setSpinnerInputValue;

  await setCalendarValue(page, `input[name="${fieldNames.startDate}"]`, period.startDate);
  await setSpinnerValue(page, 'input[name="begin_time_hour"]', period.startHour);
  await setSpinnerValue(page, 'input[name="begin_time_minute"]', period.startMinute);
  await setCalendarValue(page, `input[name="${fieldNames.endDate}"]`, period.endDate);
  await setSpinnerValue(page, 'input[name="end_time_hour"]', period.endHour);
  await setSpinnerValue(page, 'input[name="end_time_minute"]', period.endMinute);
  await page.keyboard.press('Escape');
}

async function selectDropdownOption(page: Page, name: string, label: string) {
  await page.locator(`p-dropdown[name="${name}"] .ui-dropdown`).click();
  await page
    .locator('.ui-dropdown-panel:visible .ui-dropdown-item')
    .filter({ hasText: new RegExp(`^${escapeRegExp(label)}\\s*$`) })
    .click();
}

async function selectMultiSelectOption(page: Page, name: string, label: string) {
  await page.locator(`p-multiselect[name="${name}"] .ui-multiselect`).click();
  await page
    .locator('.ui-multiselect-panel:visible .ui-multiselect-item')
    .filter({ hasText: new RegExp(`^${escapeRegExp(label)}\\s*$`) })
    .click();
  await page.keyboard.press('Escape');
}

async function loginAsAdmin(page: Page) {
  const username = process.env.WEBROTA_USERNAME;
  const password = process.env.WEBROTA_PASSWORD;

  test.skip(!username || !password, 'Informe WEBROTA_USERNAME e WEBROTA_PASSWORD no .env');
  if (!username || !password) return;

  await page.goto(`${appUrl}/login`);
  await expect(page).toHaveTitle(/WebRota/);

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/admin\/system/, { timeout: 60_000 });
}

async function impersonateWebrotaCustomer(page: Page) {
  await page.goto(`${appUrl}/admin/customer`);

  await page.getByRole('textbox').first().fill('webrota');
  await page.getByRole('button', { name: 'Pesquisar' }).click();
  await expect(page.getByText(/Total de \d+ registros\./)).toBeVisible({ timeout: 60_000 });

  const webrotaRow = page.locator('tbody tr:visible').filter({
    has: page.locator('td', { hasText: /^WEBROTA$/ }),
  });

  await expect(webrotaRow).toHaveCount(1);
  await expect(webrotaRow).toContainText('Software');
  await webrotaRow.locator('a[title="Autenticar com usuário"]').click();

  await expect(page.getByRole('heading', { name: 'Selecione o usuário' })).toBeVisible();
  await page.getByRole('button', { name: /^WEBROTA$/ }).click();

  await expect(page).toHaveURL(/\/app\/system/, { timeout: 60_000 });
  await expect(page.locator('main').getByText('WEBROTA', { exact: true }).first()).toBeVisible();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('impersonate'))).toBe('1');
}

async function getTravelReportTotalDistanceKm(page: Page) {
  const rows = await page
    .locator('table')
    .first()
    .locator('tr')
    .evaluateAll((tableRows) =>
      tableRows.map((row) =>
        [...row.querySelectorAll('th,td')].map((cell) => cell.textContent?.trim().replace(/\s+/g, ' ') || ''),
      ),
    );

  const totalRow = rows.find(
    (row) =>
      row.some((cell) => /^\d{2}:\d{2}:\d{2}$/.test(cell)) &&
      row.some((cell) => /\d+(?:[.,]\d+)?\s*km/i.test(cell)) &&
      !row.some((cell) => /\d{2}\/\d{2}\/\d{4}/.test(cell)),
  );

  if (!totalRow) {
    throw new Error(`Nao foi possivel localizar a linha de total do relatorio. Linhas: ${JSON.stringify(rows)}`);
  }

  const distanceCell = totalRow.find((cell) => /\d+(?:[.,]\d+)?\s*km/i.test(cell));
  if (!distanceCell) {
    throw new Error(`Linha de total encontrada sem distancia: ${JSON.stringify(totalRow)}`);
  }

  return parseDistanceKm(distanceCell);
}

test.describe('WebRota mileage comparison', () => {
  test('@critical @tracking deve comparar quilometragem do rastro com relatorio de viagens', async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);

    const runtimeLogs: RuntimeLog[] = [];

    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) {
        runtimeLogs.push({ type: 'console', message: `[${message.type()}] ${message.text()}` });
      }
    });

    page.on('requestfailed', (request) => {
      runtimeLogs.push({
        type: 'requestfailed',
        message: `${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`,
      });
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        runtimeLogs.push({
          type: 'http',
          message: `${response.status()} ${response.request().method()} ${response.url()}`,
        });
      }
    });

    const period = buildComparableLast48HoursPeriod();
    const vehicleName = defaultVehicleName;

    await loginAsAdmin(page);
    await impersonateWebrotaCustomer(page);

    await page.getByRole('link', { name: 'Rastro' }).click();
    await expect(page).toHaveURL(/\/app\/position-history/);
    await expect(page.getByRole('heading', { name: 'Rastro' })).toBeVisible({ timeout: 60_000 });

    await selectDropdownOption(page, 'devices', vehicleName);
    await fillPeriod(page, period, { startDate: 'dateStart', endDate: 'dateEnd' }, 'keyboard', 'keyboard');

    const positionResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/position/geojson') && response.status() === 200,
      { timeout: 60_000 },
    );

    await page.getByRole('button', { name: 'Pesquisar' }).click({ force: true });
    await positionResponsePromise;

    await expect(page).toHaveURL(/\/app\/map\/track/, { timeout: 60_000 });
    await expect(page.getByText('Sumário')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('Distancia percorrida')).toBeVisible({ timeout: 60_000 });

    const mapText = await page.locator('body').innerText();
    const mapDistanceKm = parseMapDistanceKm(mapText);

    await page.goto(`${appUrl}/app/report/travel`);
    await expect(page.getByRole('heading', { name: 'Relatório de viagens' })).toBeVisible({ timeout: 60_000 });

    await fillPeriod(page, period, { startDate: 'date_time_start', endDate: 'date_time_end' }, 'fill', 'buttons');
    await selectMultiSelectOption(page, 'vehicle', vehicleName);

    const travelReportResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/event/?') &&
        response.url().includes('event_category=1') &&
        response.status() === 200,
      { timeout: 60_000 },
    );

    await page.getByRole('button', { name: 'Pesquisar' }).click({ force: true });
    await travelReportResponsePromise;

    await expect(page.getByText(/Total de \d+ registros\./)).toBeVisible({ timeout: 60_000 });

    const reportDistanceKm = await getTravelReportTotalDistanceKm(page);
    const differenceKm = Number(Math.abs(mapDistanceKm - reportDistanceKm).toFixed(2));

    await testInfo.attach('webrota-mileage-comparison', {
      contentType: 'application/json',
      body: JSON.stringify(
        {
          vehicleName,
          period,
          mapDistanceKm,
          reportDistanceKm,
          differenceKm,
          mileageToleranceKm,
          runtimeLogs,
        },
        null,
        2,
      ),
    });

    expect(
      differenceKm,
      `Quilometragem divergente para ${vehicleName} no periodo ${formatPeriodForMessage(period)}: rastro=${mapDistanceKm} km, relatorio=${reportDistanceKm} km, diferenca=${differenceKm} km.`,
    ).toBeLessThanOrEqual(mileageToleranceKm);
  });
});
