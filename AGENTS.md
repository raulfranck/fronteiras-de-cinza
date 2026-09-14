# Regras do projeto

Jogo RTS 1v1 contra bot, rodando no navegador. Um único arquivo `index.html`, Canvas 2D, JavaScript vanilla.

- Nunca crie arquivos além do `index.html`. Sem build, sem npm, sem framework, sem `src/`.
- Nunca adicione dependência externa, CDN ou fonte remota.
- Nunca use `localStorage` nem `sessionStorage`.
- A pasta `assets/` é somente leitura. Não baixe, gere nem modifique nada nela.
- Nunca acesse a rede.
- Ao corrigir algo, edite o `index.html` no disco. Nunca deixe TODO, stub ou função vazia, e nunca quebre o que já funcionava.
- Texto de interface em português do Brasil. Nomes de variáveis, funções e comentários em inglês.

A especificação completa está em `ESPECIFICACAO.md`. Consulte antes de mudar regras de jogo, números de unidades, prédios ou comportamento do bot.
