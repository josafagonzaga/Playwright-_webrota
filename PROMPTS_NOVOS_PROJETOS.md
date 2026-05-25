ve# Guia Didatico Para Novos Projetos Playwright

Este documento e o roteiro principal para criar e evoluir projetos de automacao E2E com Playwright e TypeScript.

A regra principal e: nao avance para a proxima etapa enquanto a etapa atual nao estiver funcionando.

## Visao Geral Do Fluxo

1. Preparar a pasta correta.
2. Criar a base Playwright.
3. Criar um primeiro teste simples direto no `spec`.
4. Rodar e corrigir o primeiro teste.
5. Organizar a estrutura basica.
6. Criar Page Object quando fizer sentido.
7. Separar dados de teste quando fizer sentido.
8. Criar fixtures quando houver reutilizacao.
9. Expandir cenarios.
10. Adicionar qualidade.
11. Adicionar CI/CD.
12. Criar README.
13. Publicar no GitHub.

## Principios

- Nao criar tudo de uma vez.
- Validar cada etapa antes de seguir.
- Comecar simples.
- Usar Playwright com TypeScript.
- Preferir locators estaveis e `expect` do Playwright.
- Evitar sleeps fixos.
- Criar Page Object, `data` e fixtures somente quando ajudarem.
- Manter o projeto simples, mas preparado para crescer.

## Etapa 0 - Preparar A Pasta

Objetivo: garantir que o projeto vai nascer no repositorio certo, dentro da pasta padrao dos projetos pessoais.

Fluxo padrao para novos projetos pessoais:

1. Criar o repositorio no GitHub.
2. Clonar o repositorio dentro da pasta `/home/josafa/Documentos/#git`.
3. Abrir no VS Code a pasta clonada do projeto.
4. So depois iniciar a criacao da base Playwright.

A pasta `/home/josafa/Documentos/#git` e a pasta pai dos projetos pessoais.
Ela nao deve receber arquivos de projeto diretamente.

A pasta aberta no VS Code deve ser a pasta clonada do projeto, nao `/home/josafa/Documentos/#git`.

Exemplo:

```bash
cd /home/josafa/Documentos/#git
git clone [url-do-repositorio]
cd Playwright_nome_do_projeto
code .
```

Valide a pasta atual:

```bash
pwd
ls
```

O `pwd` deve mostrar o caminho completo da pasta do projeto.
O `ls` deve mostrar apenas os arquivos iniciais do repositorio clonado.
Em um projeto recem-criado, normalmente a pasta pode ter somente `.git`, `README.md` ou nenhum arquivo visivel alem dos arquivos do Git.

Valide tambem a pasta pai:

```bash
ls ..
```

A pasta pai deve ser `/home/josafa/Documentos/#git` e pode conter outras pastas de projetos.
Ela nao deve parecer um projeto Playwright iniciado por engano.

Checklist:

- [ ] Criei o repositorio no GitHub.
- [ ] Clonei o repositorio dentro de `/home/josafa/Documentos/#git`.
- [ ] Entrei na pasta clonada do projeto.
- [ ] Abri o VS Code na pasta clonada do projeto.
- [ ] Confirmei que nao estou em `/home/josafa/Documentos/#git`.
- [ ] Confirmei que `/home/josafa/Documentos/#git` e apenas a pasta pai dos projetos.
- [ ] Confirmei que a pasta atual ainda nao tem `playwright.config.ts`.
- [ ] Confirmei que a pasta pai nao tem `playwright.config.ts`.
- [ ] Confirmei que a pasta pai nao tem `package.json`, a menos que ela seja um projeto real.
- [ ] Se encontrei arquivos de projeto na pasta pai por engano, parei antes de instalar qualquer coisa.

Prompt para usar:

```text
Nome do projeto:
[nome]

Objetivo:
[site ou sistema que quero automatizar]

Antes de criar qualquer coisa, valide:
- se o terminal esta na pasta clonada do projeto;
- se o VS Code foi aberto na pasta do projeto;
- se o projeto esta dentro de /home/josafa/Documentos/#git;
- se nao existe playwright.config.ts na pasta pai;
- se nao existe package.json na pasta pai, a menos que a pasta pai seja um projeto real.

Se eu estiver em /home/josafa/Documentos/#git em vez da pasta clonada do projeto, pare e me avise.
Se encontrar configuracao Playwright ou package.json na pasta pai por engano, pare e me avise antes de instalar qualquer coisa.
Depois comece simples, passo a passo.
```

Pode avancar quando:

- A pasta correta estiver aberta no VS Code.
- A pasta correta for o repositorio clonado do projeto.
- A pasta pai nao tiver configuracao Playwright indevida.
- Nao houver risco de instalar dependencias na pasta errada.

## Etapa 1 - Criar A Base Playwright

Objetivo: instalar Playwright e deixar o projeto minimamente executavel.

Comandos esperados:

```bash
npm init -y
npm init playwright@latest
```

Depois validar:

```bash
npx playwright test --list
```

Prompt para usar:

```text
Crie a base Playwright com TypeScript.
Nao organize estrutura profissional ainda.
Nao crie Page Object, data nem fixture customizada.
Depois rode npx playwright test --list.
```

Pode avancar quando:

- Existe `package.json`.
- Existe `playwright.config.ts`.
- Existe pelo menos um arquivo `.spec.ts`.
- `npx playwright test --list` lista os testes.

## Etapa 2 - Primeiro Teste Simples

Objetivo: provar que o Playwright abre o site e valida algo real.

Neste momento, escreva tudo direto no `spec`:

- URL
- acao
- selector
- validacao

Exemplo:

```ts
import { test, expect } from '@playwright/test';

test('deve abrir a pagina inicial', async ({ page }) => {
  await page.goto('https://uitestingplayground.com');

  await expect(page).toHaveTitle(/UI Test Automation Playground/);
  await expect(page.getByRole('heading', { name: 'UI Test Automation Playground' })).toBeVisible();
});
```

Prompt para usar:

```text
Crie apenas 1 teste simples direto no spec.
O teste deve abrir a pagina principal e validar um titulo ou heading.
Depois rode o teste e corrija se falhar.
```

Validar com:

```bash
npm test
```

Pode avancar quando:

- O teste passa.
- O teste esta facil de entender.
- Ainda nao existe complexidade desnecessaria.

## Etapa 3 - Organizar Estrutura Basica

Objetivo: separar os testes em uma pasta clara.

Estrutura simples recomendada:

```text
tests/
  e2e/
    home.spec.ts
```

Atualize o `playwright.config.ts` se necessario:

```ts
testDir: './tests/e2e';
```

Prompt para usar:

```text
Organize o primeiro teste dentro de tests/e2e.
Atualize o playwright.config.ts somente se for necessario.
Depois rode npx playwright test --list e npm test.
```

Pode avancar quando:

- O Playwright encontra o teste na nova pasta.
- `npm test` continua passando.

## Etapa 4 - Criar Page Object

Objetivo: tirar seletores e acoes repetidas de dentro do `spec`.

Use Page Object quando:

- O teste comeca a ficar grande.
- O mesmo fluxo sera usado em mais de um teste.
- A pagina tem muitos elementos.
- Voce quer deixar o `spec` mais legivel.

Estrutura:

```text
tests/
  e2e/
    home.spec.ts
  pages/
    HomePage.ts
```

Exemplo de Page Object:

```ts
import { expect, type Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle(/UI Test Automation Playground/);
    await expect(
      this.page.getByRole('heading', { name: 'UI Test Automation Playground' }),
    ).toBeVisible();
  }
}
```

O `spec` fica mais limpo:

```ts
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('deve abrir a pagina inicial', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.expectLoaded();
});
```

Prompt para usar:

```text
Refatore o teste atual para Page Object.
Mantenha o spec simples e legivel.
Nao crie fixture ainda.
Depois rode npm test.
```

Pode avancar quando:

- O teste continua passando.
- O `spec` mostra o fluxo.
- O Page Object guarda seletores, acoes e validacoes da tela.

## Etapa 5 - Separar Dados De Teste

Objetivo: mover textos, valores e massas para arquivos proprios quando isso ajudar.

Use pasta `data` quando:

- O mesmo texto aparece em varios testes.
- Existem massas validas e invalidas.
- Os dados deixam o `spec` poluido.
- Voce quer alterar valores sem mexer no fluxo do teste.

Estrutura:

```text
tests/
  data/
    home.data.ts
```

Exemplo:

```ts
export const homePageData = {
  title: /UI Test Automation Playground/,
  heading: 'UI Test Automation Playground',
};
```

Uso no teste:

```ts
await homePage.expectLoaded(homePageData);
```

Importante: o arquivo `data` nao valida nada sozinho. Ele apenas guarda dados. A validacao acontece nos metodos que usam `expect`.

Prompt para usar:

```text
Separe os textos e valores esperados em tests/data.
Explique onde cada dado sera usado.
Depois rode npm test.
```

Pode avancar quando:

- O teste continua passando.
- Os dados fazem sentido fora do `spec`.
- O projeto nao ficou mais complicado sem necessidade.

## Etapa 6 - Criar Fixtures

Objetivo: entregar Page Objects prontos para os testes.

Use fixtures quando:

- Existem varios Page Objects.
- Muitos testes repetem `new HomePage(page)`.
- Voce quer padronizar a criacao das pages.

Estrutura:

```text
tests/
  fixtures/
    pages.fixture.ts
```

Exemplo:

```ts
import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

type PageFixtures = {
  homePage: HomePage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
```

Uso no teste:

```ts
import { test } from '../fixtures/pages.fixture';

test('deve abrir a pagina inicial', async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectLoaded();
});
```

Prompt para usar:

```text
Crie uma fixture para entregar os Page Objects prontos.
Atualize os testes para usar a fixture.
Depois rode npm test.
```

Pode avancar quando:

- Os testes continuam passando.
- A fixture reduz repeticao real.
- O fluxo do teste ficou mais legivel.

## Etapa 7 - Criar Novos Cenarios

Objetivo: aumentar cobertura sem perder clareza.

Priorize nesta ordem:

1. Fluxo principal positivo.
2. Validacoes importantes.
3. Campos obrigatorios.
4. Erros e cenarios negativos.
5. Navegacao.
6. Upload, download, API ou mocks, se fizer sentido.

Prompt para usar:

```text
Analise os testes existentes e sugira novos cenarios por prioridade: alta, media e baixa.
Implemente primeiro apenas os cenarios de maior valor.
Depois rode a spec impactada e a suite completa.
```

Pode avancar quando:

- Os novos cenarios passam.
- Cada teste tem uma intencao clara.
- Nao existe duplicacao exagerada.

## Etapa 8 - Adicionar Qualidade

Objetivo: deixar o projeto mais confiavel antes de publicar.

Scripts recomendados:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "quality": "npm run format:check && npm run lint && npm run typecheck"
  }
}
```

Prompt para usar:

```text
Adicione qualidade ao projeto com TypeScript check, ESLint e Prettier.
Crie scripts claros no package.json.
Depois rode as validacoes e corrija os problemas encontrados.
```

Pode avancar quando:

- `npm run typecheck` passa.
- `npm run lint` passa, se existir.
- `npm run format:check` passa, se existir.
- `npm test` passa.

## Etapa 9 - Adicionar CI/CD

Objetivo: rodar validacoes automaticamente no GitHub.

Arquivo esperado:

```text
.github/workflows/playwright.yml
```

O workflow deve:

- Rodar em `push` para `main`.
- Rodar em `pull_request` para `main`.
- Instalar dependencias com `npm ci`.
- Instalar browsers do Playwright.
- Rodar qualidade.
- Rodar testes.
- Salvar relatorio como artifact.

Prompt para usar:

```text
Adicione CI/CD com GitHub Actions para Playwright.
O workflow deve rodar qualidade, testes e salvar o playwright-report como artifact.
Depois explique como testar o pipeline com um commit pequeno.
```

Pode avancar quando:

- O arquivo do workflow existe.
- O pipeline passa no GitHub.
- O relatorio fica disponivel como artifact.

## Etapa 10 - Criar README

Objetivo: explicar o projeto para recrutadores, outros devs e para voce no futuro.

O README deve ter:

- Nome do projeto.
- Objetivo.
- Tecnologias.
- Estrutura de pastas.
- Cenarios cobertos.
- Como instalar.
- Como rodar testes.
- Como abrir relatorio.
- Como rodar qualidade.
- CI/CD.
- Proximos passos.

Prompt para usar:

```text
Crie um README profissional para este projeto Playwright.
Explique objetivo, tecnologias, estrutura, cenarios, instalacao, execucao, relatorio, qualidade e CI/CD.
Use linguagem clara para portfolio.
```

Pode avancar quando:

- Uma pessoa consegue clonar, instalar e rodar o projeto seguindo o README.
- Os cenarios automatizados estao descritos.

## Etapa 11 - Publicar No GitHub

Objetivo: versionar e publicar o projeto.

Antes de publicar, revisar:

```bash
git status
git remote -v
npm test
```

Se existirem scripts de qualidade:

```bash
npm run format:check
npm run lint
npm run typecheck
```

Prompt para usar:

```text
Quero publicar este projeto no GitHub.
Antes de fazer push, revise git status, remote, .gitignore, arquivos sensiveis e rode as validacoes disponiveis.
Depois me guie no commit e push.
```

Pode considerar pronto quando:

- Os testes passam.
- O projeto esta commitado.
- O push foi feito.
- O GitHub Actions passou.

## Problemas Comuns No VS Code

### Botao De Play Nao Aparece

Verificacoes:

- Confirme que o VS Code esta aberto na pasta exata do projeto.
- Confirme que existe `playwright.config.ts` na raiz do projeto.
- Confirme que existe `package.json` na raiz do projeto.
- Confirme que nao existe `playwright.config.ts` desnecessario na pasta pai.
- Confirme que a extensao `ms-playwright.playwright` esta instalada.
- Rode `npx playwright test --list` no terminal.

Se os testes aparecem no terminal, mas nao aparecem no VS Code:

1. Abra o Command Palette com `Ctrl + Shift + P`.
2. Rode `Playwright: Clear cache`.
3. Rode `Developer: Reload Window`.
4. Abra um arquivo `.spec.ts`.
5. Abra tambem o painel lateral de testes do VS Code.

Se ainda nao aparecer, feche o VS Code e abra novamente pela pasta do projeto:

```bash
cd /caminho/da/pasta/do/projeto
code .
```

## Quando Criar Cada Coisa

| Item            | Criar quando                                     |
| --------------- | ------------------------------------------------ |
| `spec` direto   | Sempre no inicio                                 |
| Page Object     | Quando houver muitos seletores ou repeticao      |
| `data`          | Quando dados/textos se repetem ou poluem o teste |
| fixture         | Quando varios testes usam as mesmas pages        |
| helpers         | Quando existe logica reutilizavel fora da pagina |
| ESLint/Prettier | Quando a base ja estiver rodando                 |
| CI/CD           | Quando os testes e scripts locais passam         |
| README          | Quando o projeto ja tem algo demonstravel        |

## Checklist Final

- O projeto esta em uma pasta propria.
- A pasta pai nao tem `playwright.config.ts` ou `package.json` desnecessarios.
- O VS Code foi aberto na pasta exata do projeto.
- `npx playwright test --list` lista os testes esperados.
- A estrutura de pastas esta organizada.
- Os testes usam Page Objects quando ha repeticao ou fluxo reutilizavel.
- Dados de teste estao separados quando fizer sentido.
- Nao ha sleeps fixos desnecessarios.
- `npm run format:check` passa, se existir.
- `npm run lint` passa, se existir.
- `npm run typecheck` ou `npx tsc --noEmit` passa.
- `npm test` passa.
- `npm run ci` passa, se esse script existir.
- O CI/CD esta configurado, se o projeto ja estiver no GitHub.
- O README explica instalacao, execucao, cenarios e CI/CD.
- `.gitignore` ignora `node_modules`, reports, resultados e arquivos sensiveis.
- `git status` foi revisado.
- O remote GitHub esta configurado antes do push.
- As alteracoes foram commitadas e publicadas.

## Prompt Principal

Use este prompt quando quiser seguir o fluxo completo:

```text
Quero criar ou evoluir um projeto Playwright com TypeScript seguindo um fluxo didatico.

Objetivo do projeto:
[descreva o site ou sistema]

Nome do projeto:
[nome]

Siga as etapas uma por vez:
1. Validar pasta correta e pasta pai.
2. Criar base Playwright.
3. Criar primeiro spec simples.
4. Rodar testes.
5. So depois organizar estrutura, Page Object, data e fixtures quando fizer sentido.
6. Depois adicionar novos cenarios, qualidade, CI/CD, README e GitHub.

Nao pule etapas. Antes de avancar, rode a validacao da etapa atual e me explique o resultado.
```
