# Como contribuir para o Sonozen!?

Em primeiro lugar, muito obrigado por dedicar seu tempo para contribuir com o **Sonozen**! 🎉👍

Este projeto tem como objetivo ajudar as pessoas a melhorarem suas rotinas de sono e estudos através da Inteligência Artificial. Toda ajuda é bem-vinda, seja corrigindo bugs, melhorando a documentação, criando novos testes ou adicionando novas funcionalidades.

Este documento serve como um guia para ajudar você a contribuir com o projeto da melhor forma possível.

---

## 🧭 Índice

1. [Código de Conduta]
2. [Como Posso Ajudar?]
    - [Reportando Bugs]
    - [Sugerindo Melhorias]
3. [Configurando o Ambiente Local]
4. [Testes Automatizados]
5. [Padrão de Commits]
6. [Processo de Pull Request (PR)]
7. [Especificações Técnicas e Dependências]

---

## 📜 Código de Conduta

Queremos que nossa comunidade seja um ambiente acolhedor, amigável e livre de assédio para todos. Ao participar deste projeto, você concorda em manter uma comunicação respeitosa e construtiva com todos os membros.

---

## 🤝 Como Posso Ajudar?

### Reportando Bugs

Se você encontrou um erro:

1. Verifique na aba de **Issues** se o problema já não foi relatado por outra pessoa.
2. Se não encontrar, abra uma nova Issue.
3. Descreva o problema de forma clara: inclua passos para reproduzir o erro, o comportamento esperado e prints de tela (se aplicável).

### Sugerindo Melhorias

Tem uma ideia legal para o aplicativo?

1. Abra uma Issue com a tag `enhancement` (melhoria).
2. Explique o motivo da sua sugestão e como ela ajudaria os usuários do Sonozen AI.

---

## 💻 Configurando o Ambiente Local

Para rodar o projeto na sua máquina e começar a codar, siga os passos abaixo:

### Pré-requisitos

- **Node.js** (versão 18+ recomendada)
- **NPM**
- Uma conta no **Supabase** (para o banco de dados e autenticação)

### Passo a Passo

1. Faça um **Fork** deste repositório e clone para a sua máquina:
    
    ```bash
    git clone [<https://github.com/SEU-USUARIO/sonozen.git>](<https://github.com/SEU-USUARIO/sonozen.git>)
    cd sonozen
    ```
    
2. Instale as dependências:
    
    ```bash
    npm install
    ```
    
3. Crie um arquivo `.env` na raiz do projeto e adicione suas chaves do Supabase:
    
    ```bash
    GEMINI_API_KEY=
    NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sua_anon_key
    ```
    
4. Inicie o servidor de desenvolvimento:
    
    ```bash
    npm run dev
    ```
    

## 🧪 Testes Automatizados

Nós utilizamos o **Cucumber (BDD)** integrado com o **Playwright** para testes de ponta a ponta (E2E). Antes de enviar seu código, garanta que todos os testes estão passando e/ou crie novos cenários para a funcionalidade que você desenvolveu.

1. Garanta que o app está rodando (`npm run dev` em um terminal).
2. Em outro terminal, execute a suíte de testes:
    
    ```bash
    npm run test:e2e
    ```
    
3. Seus novos cenários devem ser adicionados na pasta `features/` seguindo a sintaxe Gherkin (em português).

## 📝 Padrão de Commits

Nós seguimos a convenção de [Conventional Commits](https://www.conventionalcommits.org/). Isso nos ajuda a manter o histórico organizado. Por favor, inicie suas mensagens de commit com um dos seguintes prefixos:

- `feat:` - Uma nova funcionalidade.
- `fix:` - Correção de um bug.
- `docs:` - Mudanças apenas na documentação.
- `style:` - Formatação, ponto e vírgula, etc (sem mudança lógica).
- `refactor:` - Refatoração de código que não corrige um bug nem adiciona uma feature.
- `test:` - Adição ou correção de testes (Cucumber/Playwright).
- `chore:` - Atualizações de build, dependências, etc.

**Exemplo:** `feat: adiciona botão de histórico de respostas da IA`

---

## 🔄 Processo de Pull Request (PR)

1. Crie uma branch para a sua modificação a partir da `main`:
    
    ```bash
    git checkout -b feature/minha-nova-funcionalidade
    ```
    
2. Faça seus commits seguindo o padrão acima.
3. Envie (push) sua branch para o seu Fork:
    
    ```bash
    git push origin feature/minha-nova-funcionalidade
    ```
    
4. Abra um **Pull Request** no repositório original.
5. Descreva em detalhes o que foi feito no PR. Marque quaisquer Issues relacionadas (ex: `Closes #12`)
6. Aguarde a revisão de um dos mantenedores. Se forem solicitadas mudanças, sinta-se à vontade para adicionar novos commits à mesma branch.

Mais uma vez, obrigado por contribuir para noites de sono melhores e rotinas de estudos mais saudáveis! 💙

---

### Por que este documento é excelente?

1. **Dá as boas-vindas:** Isso encoraja desenvolvedores iniciantes a perderem o medo de contribuir.
2. **Contextualizado:** Ele não é genérico. Eu já incluí as instruções exatas de rodar o seu `.env.local` e o comando especial de teste (`npm run test:e2e`) que criamos hoje.
3. **Padrão de Mercado:** O uso de *Conventional Commits* (`feat:`, `fix:`) mostra maturidade no projeto e fica ótimo no seu portfólio.

---

## 🛠️ Especificações Técnicas e Dependências

Para manter a consistência do código, este projeto utiliza tecnologias modernas e ferramentas de teste específicas. Certifique-se de que seu ambiente suporte os seguintes requisitos:

### 🚀 Stack Principal

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescript.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/)
- **IA:** [Google Gemini SDK](https://ai.google.dev/) (Modelo Gemini 1.5 Flash)

### 🧪 Ferramentas de Teste e Qualidade

O projeto utiliza uma pirâmide de testes focada em BDD (Behavior-Driven Development). As seguintes dependências **devem** ser instaladas (via `npm install`):

- **Cucumber.js:** Framework para execução de cenários em Gherkin.
- **Playwright:** Automação de navegador para testes End-to-End (E2E).
- **TS-Node:** Para execução de arquivos TypeScript diretamente no ambiente de testes.
- **Assert:** Biblioteca nativa do Node.js para validações.

### 📦 Principais Pacotes Instalados

Caso precise verificar as versões ou instalar manualmente, estes são os pacotes vitais do `package.json`:

| Pacote | Função |
| --- | --- |
| `@supabase/supabase-js` | Conexão com o banco e auth |
| `@google/generative-ai` | Integração com a IA Gemini |
| `@cucumber/cucumber` | Estrutura de testes BDD |
| `playwright` | Driver de automação do browser |
| `lucide-react` | Biblioteca de ícones (opcional/UI) |

### 📂 Estrutura de Pastas de Teste

Ao contribuir com testes, siga este padrão de diretórios:

- `features/`: Arquivos `.feature` (texto em Gherkin).
- `features/step_definitions/`: Scripts `.ts` que executam os comandos dos testes.
- `features/support/`: Configurações de hooks (Before/After) e setup do Playwright.
