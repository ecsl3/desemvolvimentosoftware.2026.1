
# language: pt

Funcionalidade: Exibição da Rotina Pré-Sono
  Como um usuário do SonoZen
  Quero visualizar minha rotina cronologicamente
  Para saber exatamente o que fazer antes de dormir

  Cenário: Exibição do "Empty State" para novos usuários
    Dado que estou autenticado na plataforma
    Mas eu ainda não processei nenhum diagnóstico
    Quando eu acesso a página "/rotine"
    Então eu devo ver a mensagem "Comece sua rotina pré-sono"
    E um botão "Criar minha rotina" que redireciona para "/diagnostic"

  Cenário: Ordenação cronológica das atividades
    Dado que eu possuo uma rotina gerada pela IA
    Quando eu acesso a página "/rotine"
    Então os cards de atividade devem ser exibidos
    E devem estar ordenados de forma crescente pelo campo "ordem"
    E o último card da lista deve ter um destaque visual (cor azul preenchida)