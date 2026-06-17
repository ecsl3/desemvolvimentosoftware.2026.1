// features/step_definitions/setup.ts
import { Before, After, setWorldConstructor, World } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';

// 1. Criamos uma classe World personalizada que conterá a nossa 'page'
export class CustomWorld extends World {
  browser?: Browser;
  page?: Page;
  mensagemAlerta: string = ""; 
}

// 2. Avisamos o Cucumber para usar essa nossa classe
setWorldConstructor(CustomWorld);

// 3. Before: Inicia o browser e a página
Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: false });
  this.page = await this.browser.newPage();

  // Captura o alert
  this.page.on('dialog', async dialog => {
    this.mensagemAlerta = dialog.message();
    await dialog.accept();
  });
});

// 4. After: Fecha o browser
After(async function (this: CustomWorld) {
  this.mensagemAlerta = "";

  if (this.browser) {
    await this.browser.close();
  }
});