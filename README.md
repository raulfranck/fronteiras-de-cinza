# Fronteiras de Cinza

RTS 1v1 contra bot, direto no navegador. Um único arquivo `index.html`, sem build, sem dependências, sem servidor — Canvas 2D e JavaScript vanilla do começo ao fim.

Duas raças espelhadas, Humanos e Orcs, com economia de ouro/madeira/comida, construção de base, upgrade para T2, heróis com habilidades, fog of war, minimapa e um bot com build order e ondas de ataque.

## Sobre o jogo

- **Mapa** de 128×128 tiles gerado proceduralmente com seed fixa, espelhado na diagonal (você embaixo-esquerda, bot em cima-direita).
- **Economia**: trabalhadores coletam ouro em minas e madeira em florestas, cap de comida controlado por fazendas.
- **Prédios**: Centro (T1 → T2), Fazenda e Quartel, cada raça com sua própria arte e nomes.
- **Unidades**: trabalhador, corpo a corpo, à distância e um herói por raça (escolhido entre 2 opções ao chegar em T2), com habilidades ativas e níveis por abate.
- **Câmera e HUD**: pan com WASD/setas/arraste, zoom, minimapa clicável, fog of war em 3 estados, seleção múltipla, grupos de controle, grade de comandos estilo RTS clássico.
- **IA do bot**: máquina de estados determinística, mesma economia e mesmos custos que o jogador — não trapaceia.

A especificação completa, com todos os números de unidades, prédios, controles e comportamento do bot, está em [ESPECIFICACAO.md](ESPECIFICACAO.md).

## Como rodar

O jogo é um único `index.html` — não precisa instalar nada. Mas **abra por um servidor local**, não direto com duplo clique no arquivo:

```bash
# qualquer uma das opções abaixo funciona
python3 -m http.server 8000
# ou
npx serve .
```

Depois acesse `http://localhost:8000` no navegador.

Isso é necessário porque o jogo faz *chroma key* nas imagens (remove o fundo magenta dos sprites) lendo os pixels no canvas — via `file://` o navegador bloqueia essa leitura por segurança. Sem servidor, o jogo ainda roda, mas os sprites aparecem com o fundo colorido em vez de transparente, e um aviso aparece na tela avisando disso.

Requer apenas um navegador moderno (Chrome, Firefox, Edge). Sem instalação, sem `npm install`, sem build.

## Estrutura do projeto

```
index.html          # o jogo inteiro: HTML + CSS + JS
ASSETS.js            # referência dos caminhos de imagem esperados por assets/
assets/              # sprites, tiles, retratos e tela de título (somente leitura)
ESPECIFICACAO.md      # especificação técnica completa do jogo
AGENTS.md            # regras rápidas do projeto para quem (ou o que) for editar o código
LICENSE              # licença de uso e distribuição
```

## Como contribuir

Contribuições são bem-vindas! Antes de abrir um PR:

1. **Leia [ESPECIFICACAO.md](ESPECIFICACAO.md) e [AGENTS.md](AGENTS.md)** — eles definem as regras do projeto e os números oficiais de cada unidade/prédio. Mudanças de regra de jogo devem ser coerentes com a especificação (ou vir acompanhadas de uma atualização nela, explicando o porquê).
2. **Mantenha as restrições técnicas do projeto**:
   - Tudo em `index.html`. Nada de `package.json`, bundler, framework ou pasta `src/`.
   - Zero dependências externas — nenhum `<script src="https://...">`, nenhum CDN.
   - Nenhum `localStorage` / `sessionStorage`.
   - A pasta `assets/` é somente leitura — não adicione, remova nem regenere imagens nela sem alinhar antes.
   - Identificadores, funções e comentários em inglês; texto de interface em português do Brasil.
3. **Teste manualmente** abrindo o jogo por um servidor local (veja acima) e jogando pelo menos uma partida até o fim, checando o console do navegador por erros.
4. **Sem TODO, stub ou função vazia** — se uma feature entrou, ela tem que funcionar de ponta a ponta.
5. Abra um PR descrevendo o que mudou e por quê. PRs pequenos e focados são mais fáceis de revisar do que um PR que mexe em meio jogo de uma vez.

Bugs e sugestões também podem ser reportados como issues, mesmo sem vir acompanhados de código.

## Ideias de features futuras

Sugestões de coisas que a comunidade pode explorar — nenhuma é compromisso, é só ponto de partida para quem quiser contribuir:

- **Sons e música** — efeitos de ataque, coleta, construção e uma trilha ambiente.
- **Dificuldade ajustável do bot** — variar a build order e a agressividade das ondas.
- **Editor de mapas** — gerar ou desenhar mapas além da seed fixa atual.
- **Multiplayer local (hot-seat)** ou via WebRTC, mantendo o jogo sem servidor/backend.
- **Modo campanha** com uma sequência de missões e objetivos além de "destrua o Centro inimigo".
- **Mais raças, unidades ou heróis**, seguindo o padrão espelhado já usado entre Humanos e Orcs.
- **Replays** — gravar os comandos da partida para revisão depois (sem usar armazenamento do navegador, ex. exportar/importar um arquivo).
- **Controles touch** para jogar em tablet.
- **Balanceamento** — ajustes finos na tabela de unidades e prédios com base em partidas jogadas.
- **Acessibilidade** — modo daltônico para as cores de time, opções de contraste.

Se for implementar algo dessa lista (ou outra ideia), vale abrir uma issue antes para alinhar escopo e evitar retrabalho.

## Licença

Este projeto é distribuído sob a licença **[Creative Commons Atribuição-NãoComercial-CompartilhaIgual 4.0 Internacional (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-BR)**. O texto completo está em [LICENSE](LICENSE).

Em resumo, o que essa licença permite e o que ela não permite:

**Pode:**
- Baixar, jogar e estudar o código livremente.
- Modificar o jogo e criar suas próprias versões.
- Redistribuir o jogo original ou suas modificações.
- Contribuir de volta para este repositório.

**Precisa:**
- Dar crédito ao autor original (Raul Franck) e indicar se fez mudanças.
- Distribuir qualquer versão modificada sob essa mesma licença (CC BY-NC-SA 4.0) — ninguém pode pegar uma versão derivada e fechar ou relicenciar sob termos mais permissivos.

**Não pode:**
- Vender o jogo, cobrar por acesso a ele, ou usá-lo (ou uma versão modificada dele) em qualquer produto ou serviço comercial.

**Por que essa licença e não uma licença "open source" tradicional (MIT, GPL, Apache...):** essas licenças permitem uso comercial irrestrito, o que não é o objetivo aqui. O jogo é um projeto pessoal e eu quero mantê-lo assim — aberto para quem quiser jogar, estudar, modificar e contribuir, mas fechado para quem quiser monetizá-lo sem participar do projeto. Por causa dessa restrição comercial, tecnicamente esse não é "open source" pela definição estrita da Open Source Initiative (que exige permitir uso comercial) — é mais preciso chamar de **projeto de código aberto para fins não comerciais**, mas na prática funciona do mesmo jeito para quem só quer contribuir: código visível, PRs bem-vindos, sem taxa nem permissão prévia para colaborar.

## Créditos

Criado por **Raul Franck**.
Repositório: [github.com/raulfranck/fronteiras-de-cinza](https://github.com/raulfranck/fronteiras-de-cinza)
