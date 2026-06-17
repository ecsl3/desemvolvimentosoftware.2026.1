# language : pt
Funcionalidade: Central de Chat e Suporte
  Como um usuário do SonoZen
  Quero acessar uma central de chat para tirar dúvidas e receber suporte
  Para que eu possa resolver problemas e entender melhor as funcionalidades do app

  Cenário: Acesso à Central de Chat
    Dado que estou autenticado na plataforma
    Quando eu clico no ícone de chat no canto inferior direito
    Então a janela de chat deve se abrir
    E eu devo ver uma mensagem de boas-vindas do suporte

  Cenário: Envio de mensagem para o suporte
    Dado que a janela de chat está aberta
    Quando eu digito uma mensagem e clico em "Enviar"
    Então minha mensagem deve aparecer na janela de chat
    E o sistema deve enviar minha mensagem para o backend para processamento

  Cenário: Recebimento de resposta do suporte
    Dado que enviei uma mensagem para o suporte
    Quando o backend processa minha mensagem e gera uma resposta
    Então a resposta do suporte deve aparecer na janela de chat em um formato claro e amigável