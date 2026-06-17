# language: pt
Funcionalidade: Motor de Inteligência Artificial e Persistência
  Como um sistema de backend
  Quero enviar os dados do usuário para o Gemini e salvar o retorno
  Para garantir que a resposta seja determinística e o banco fique limpo

  Cenário: Processamento bem-sucedido e limpeza de dados antigos
    Dado que o backend recebe uma requisição POST com "diagnosticoId" e "usuarioId"
    E o usuário já possui rotinas e riscos antigos na base de dados
    Quando a IA retorna o JSON estruturado com sucesso
    Então o sistema deve deletar as rotinas, riscos e dicas antigas do usuário
    E atualizar a tabela "diagnosticos_sono" com o status "processado_ia" igual a true
    E inserir as novas rotinas, riscos e dicas nas respectivas tabelas
    E retornar status 200 com a flag de sucesso

  Cenário: Retorno de erro caso o diagnóstico não exista
    Dado que o backend recebe uma requisição POST
    Mas o "diagnosticoId" fornecido não existe no banco de dados
    Quando o servidor tenta processar a requisição
    Então a API deve retornar status 404
    E a mensagem "Diagnóstico não encontrado no banco."

  Cenário: Validação do contrato JSON da IA
    Dado que o backend enviou o prompt para a IA
    Quando a IA retorna a string de resposta
    Então o backend deve remover qualquer formatação markdown ("```json")
    E validar se a chave "geral" existe no objeto
    E lançar um erro caso o parse do JSON falhe