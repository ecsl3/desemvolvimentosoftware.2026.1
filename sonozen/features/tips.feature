# language: pt
Funcionalidade: Central de Dicas Personalizadas
  Como um usuário que deseja melhorar seu sono
  Quero acessar dicas de higiene do sono e interagir com elas
  Para aprender práticas adequadas e seguir hábitos antes de dormir

  # --- CENÁRIO DO USUÁRIO (TESTE DE UI E ACORDEÃO) ---
  Cenário: Interagir com dicas genéricas (Acordeão)
    Dado que eu estou logado com o usuário "amanda@gmail.com" e a senha "amanda123"
    Quando eu acesso a pagina de "tips"
    Então eu devo ver a lista de dicas carregada
    Quando eu clico na dica "Reduza a luz azul à noite"
    Então eu devo ver a descrição da dica sobre luz azul
    E a descrição deve sumir se eu clicar novamente na dica

  # --- CENÁRIOS DE REGRA DE NEGÓCIO (TESTE DE ESTADO E IA) ---
  Cenário: Usuário sem diagnóstico vê apenas o catálogo padrão
    Dado que eu estou logado com o usuário "amanda@gmail.com" e a senha "amanda123"
    E eu não possuo nenhum diagnóstico processado no banco de dados
    Quando eu acesso a página de "tips"
    Então o sistema deve exibir a mensagem "Você está vendo as dicas padrão"
    E deve carregar exatamente as dicas genéricas (IDs de 1 a 6)
    E nenhuma dica deve conter a tag "✨ IA"

  Cenário: Usuário com diagnóstico vê dicas unificadas
    Dado que eu possuo um diagnóstico gerado pela IA no banco de dados
    Quando eu acesso a página de "tips"
    Então o sistema não deve exibir a mensagem de "dicas padrão"
    E deve listar as dicas personalizadas da categoria "IA Sob Medida"
    E as dicas personalizadas devem exibir a tag "✨ IA"
    E a lista deve conter também as dicas genéricas que a IA vinculou ao meu perfil