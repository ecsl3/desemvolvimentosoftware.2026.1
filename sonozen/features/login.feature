# features/login.feature
# language: pt

Funcionalidade: Autenticação de Usuário
  Como um usuário do Sonozen
  Quero poder fazer login com meu e-mail e senha
  Para acessar a inteligência artificial

  Cenário: Login com sucesso
    Dado que eu estou na página de login
    Quando eu preencho o e-mail com "amanda@gmail.com" e a senha com "amanda123"
    E clico no botão "Acessar conta"
    Então eu devo ser redirecionado para a página home

  Cenário: Visualizar a senha inserida
    Dado que eu estou na página de login
    Quando eu preencho o e-mail com "amanda@gmail.com" e a senha com "amanda123"
    E clico no botão "Mostrar senha"
    Então a senha "amanda123" deve estar visível no campo

  Cenário: Cadastro de conta já existente
    Dado que eu estou na página de login
    E eu clico na aba "Cadastrar"
    Quando eu preencho o e-mail com "amanda@gmail.com" e a senha com "novaSenha123"
    E clico no botão "Criar conta"
    Então eu devo ver uma mensagem de erro de usuário já registrado

  Cenário: Login com senha incorreta
    Dado que eu estou na página de login
    Quando eu preencho o e-mail com "amanda@gmail.com" e a senha com "amanda12"
    E clico no botão "Acessar conta"
    Então eu devo ver uma mensagem de erro

  Cenário: Logout
    Dado que eu estou logado com o usuário "amanda@gmail.com" e a senha "amanda123"
    Quando eu acesso a pagina de "profile"
    E eu clico no botão "Sair"
    Então eu devo ser redirecionado para a página de login

