# language: pt

Funcionalidade: Preenchimento do Diagnóstico de Sono
  Como um usuário do SonoZen
  Quero preencher um formulário passo a passo sobre meus hábitos
  Para que a IA possa gerar uma rotina de sono personalizada

  Cenário: Avançar de etapa apenas com campos obrigatórios preenchidos
    Dado que estou na etapa "Dados Pessoais" do diagnóstico
    Quando eu preencho apenas a minha "idade"
    Então o botão "Avançar" deve permanecer desabilitado
    Quando eu seleciono o meu "gênero"
    Então o botão "Avançar" deve ficar habilitado

  Cenário: Submissão do formulário com sucesso
    Dado que estou na última etapa do diagnóstico
    E preenchi todos os campos obrigatórios anteriores
    Quando eu clico em "Gerar diagnóstico"
    Então o sistema deve exibir o estado de "Processando IA..."
    E eu devo ser redirecionado para a página "/home" após a conclusão

  Cenário: Refazer diagnóstico existente
    Dado que eu já possuo um diagnóstico salvo no banco de dados
    E estou na página de resultado do diagnóstico
    Quando eu clico no botão "Refazer Diagnóstico"
    Então o sistema deve me redirecionar para a etapa 1 do formulário
    E ao submeter o novo diagnóstico, os dados antigos devem ser substituídos