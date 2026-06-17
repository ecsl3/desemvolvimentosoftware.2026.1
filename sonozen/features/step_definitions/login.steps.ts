// features/step_definitions/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { CustomWorld } from './setup.js'; // Importe a tipagem (o Node precisa do .js aqui na importação TS)

Given('que eu estou na página de login', async function (this: CustomWorld) {
  // ATENÇÃO: Use this.page! (A exclamação diz ao TS que a página existe)
  await this.page!.goto('http://localhost:3000/login');
});

Given('que eu estou logado com o usuário {string} e a senha {string}', async function (this: CustomWorld, email, senha) {
  await this.page!.goto('http://localhost:3000/login');
  
  await this.page!.locator('input[type="email"]').fill(email);
  await this.page!.locator('input[type="password"]').fill(senha);
  
  await this.page!.getByRole('button', { name: 'Acessar conta' }).click();
  
  await this.page!.waitForURL('**/home', { timeout: 10000 });
});

Given('eu clico na aba {string}', async function (this: CustomWorld, abaNome) {
  // O Playwright encontra o botão pelo texto exato (Cadastrar ou Entrar)
  await this.page!.getByRole('button', { name: abaNome, exact: true }).click();
});

When('eu preencho o e-mail com {string} e a senha com {string}', async function (this: CustomWorld, email, senha) {
  await this.page!.locator('input[type="email"]').fill(email);
  await this.page!.locator('input[type="password"]').fill(senha);
});

// Este passo mágico captura qualquer botão, incluindo "Acessar conta", "Criar conta", "Sair" e "Mostrar senha"
When(/^(?:eu )?clico no botão "([^"]*)"$/, async function (this: CustomWorld, textoBotao) {
  await this.page!.getByRole('button', { name: textoBotao }).click();
});

When('eu acesso a pagina de {string}', async function (this: CustomWorld, pagina) {
  await this.page!.goto(`http://localhost:3000/${pagina}`);
});

Then('eu devo ser redirecionado para a página home', async function (this: CustomWorld) {
  await this.page!.waitForURL('http://localhost:3000/home');
  assert.strictEqual(this.page!.url(), 'http://localhost:3000/home');
});

Then('eu devo ver uma mensagem de erro', async function (this: CustomWorld) {
  for (let i = 0; i < 10; i++) {
    // @ts-ignore - Ignorando o TS caso a propriedade mensagemAlerta tenha sido injetada no JS dinamicamente
    if (this.mensagemAlerta) break;
    await this.page!.waitForTimeout(500);
  }

  assert(
    // @ts-ignore
    this.mensagemAlerta && this.mensagemAlerta.includes("Erro"),
    // @ts-ignore
    `Esperava um erro, mas recebeu: ${this.mensagemAlerta}`
  );
});

Then('eu devo ser redirecionado para a página de login', async function (this: CustomWorld) {
  await this.page!.waitForURL('http://localhost:3000/login');
  assert.strictEqual(this.page!.url(), 'http://localhost:3000/login');
});

// --- NOVOS PASSOS PARA OS CENÁRIOS DE SENHA E CADASTRO ---

Then('a senha {string} deve estar visível no campo', async function (this: CustomWorld, senhaEsperada) {
  // Procura o input pelo placeholder
  const campoSenha = this.page!.getByPlaceholder('••••••••');
  
  // Verifica se o atributo type realmente mudou para 'text' (mostrando a senha)
  const tipoCampo = await campoSenha.getAttribute('type');
  assert.strictEqual(tipoCampo, 'text', 'O campo de senha não mudou para o tipo texto.');

  // Verifica se o valor dentro do campo é igual à senha que digitamos
  const valorCampo = await campoSenha.inputValue();
  assert.strictEqual(valorCampo, senhaEsperada, 'O valor visível não corresponde à senha digitada.');
});

Then('eu devo ver uma mensagem de erro de usuário já registrado', async function (this: CustomWorld) {
  // Reaproveitando o seu loop de espera de alertas
  for (let i = 0; i < 10; i++) {
    // @ts-ignore
    if (this.mensagemAlerta) break;
    await this.page!.waitForTimeout(500);
  }

  // @ts-ignore
  const msg = this.mensagemAlerta ? this.mensagemAlerta.toLowerCase() : "";
  
  assert(
    msg.includes("already registered") || msg.includes("erro"),
    `Esperava um erro de cadastro duplicado, mas recebeu: ${msg}`
  );
});