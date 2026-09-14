# Especificação — RTS no navegador

Documento de referência do projeto. O Codex lê este arquivo para construir e depois manter o jogo.

## REGRAS DE EXECUÇÃO

1. **Escreva o arquivo `index.html` na raiz do projeto.** Não imprima o conteúdo dele na resposta.
2. **Escreva o arquivo inteiro de uma vez**, do `<!DOCTYPE html>` ao `</html>`. Nada de esqueleto agora e preenchimento depois.
3. **Só o `index.html`.** Nada de `package.json`, `src/`, build, testes ou README.
4. **Não instale dependências e não acesse a rede.**
5. **A pasta `assets/` é somente leitura.** Não baixe, gere nem modifique nada dentro dela.
6. **Não deixe TODO, placeholder, função vazia ou stub.** Tudo tem que funcionar.
7. **Não faça perguntas.** Se algo estiver ambíguo, decida e siga.
8. **Ao terminar**, releia o `index.html` que você escreveu e confira o CHECKLIST DE ACEITAÇÃO no final deste documento, item por item. Corrija o que falhar. Responda apenas com a lista dos itens que ficaram pendentes, ou "nenhum".

## 1. STACK OBRIGATÓRIA

- **Um único arquivo `index.html`.** HTML + CSS + JS tudo dentro dele.
- **Canvas 2D API** (`getContext('2d')`). **Proibido**: WebGL, Three.js, Phaser, React, qualquer framework.
- **JavaScript vanilla ES2022.** Sem build, sem npm, sem bundler.
- **Zero dependências externas.** Nenhum `<script src="https://...">`, nenhum CDN, nenhuma fonte externa. Só as imagens locais da pasta `assets/`.
- **Proibido** `localStorage`, `sessionStorage` ou qualquer API de armazenamento do navegador.
- Loop: **timestep fixo de 60Hz para a lógica** com acumulador de delta, `requestAnimationFrame` para o render. A lógica não pode variar com o FPS.
- Canvas ocupando a janela inteira, responsivo ao `resize`.
- Texto de interface em **português do Brasil**. Identificadores, funções e comentários em **inglês**.

## 2. SISTEMA DE ASSETS (crítico — implemente exatamente assim)

No topo do arquivo, declare um objeto `ASSETS` com um slot para cada imagem, **todos inicializados como `null`**:

```js
const ASSETS = {
  tiles:     { grass: null, dirt: null, water: null, tree: null, goldmine: null },
  buildings: {
    human_townhall_1: null, human_townhall_2: null, human_farm: null, human_barracks: null,
    orc_townhall_1: null,   orc_townhall_2: null,   orc_farm: null,   orc_barracks: null
  },
  units: {
    human_worker: null, human_melee: null, human_ranged: null,
    human_hero_paladin: null, human_hero_archmage: null,
    orc_worker: null, orc_melee: null, orc_ranged: null,
    orc_hero_blademaster: null, orc_hero_shaman: null
  },
  portraits: {
    human_worker: null, human_melee: null, human_ranged: null,
    human_hero_paladin: null, human_hero_archmage: null,
    orc_worker: null, orc_melee: null, orc_ranged: null,
    orc_hero_blademaster: null, orc_hero_shaman: null
  },
  title: null
};
```

**Regra de desenho:** se o slot for `null`, desenhe o elemento **proceduralmente** com formas do Canvas (retângulos, círculos, polígonos, cor de time, contorno escuro) de modo que fique legível e coerente. Se o slot tiver um caminho de imagem, use a imagem.

O jogo tem que estar **100% jogável e visualmente coerente com todos os slots em `null`**. Eu preencho os caminhos depois. Carregamento assíncrono e tolerante a falha: imagem que não carrega cai no desenho procedural sem quebrar nada.

**`units` e `portraits` são coisas diferentes.** `units` são sprites de corpo inteiro desenhados no mapa. `portraits` são rostos desenhados só no painel de seleção da HUD. Nunca use um no lugar do outro.

### Chroma key no carregamento

As imagens de `units` vêm com **fundo magenta chapado `#FF00FF`** e as de `buildings` e `tiles.tree` / `tiles.goldmine` com fundo de cor única. Implemente uma função que, **uma única vez no carregamento**, converta cada uma dessas imagens num canvas offscreen com fundo transparente:

1. Desenhe a imagem num canvas offscreen do mesmo tamanho.
2. Leia `getImageData`.
3. Para `units`: zere o alpha de todo pixel cuja distância euclidiana no espaço RGB até `(255, 0, 255)` seja menor que 100.
4. Para `buildings` e objetos de terreno: amostre a cor do pixel `(2, 2)` como cor de fundo e zere o alpha de todo pixel a distância menor que 40 dessa cor.
5. Passe uma vez de **de-fringe**: para pixel semitransparente na borda, reduza a saturação puxando na direção da cor do vizinho opaco mais próximo, para não sobrar halo colorido.
6. Guarde o canvas resultante e use ele no `drawImage`. **Nunca refaça isso durante o jogo.**

Envolva a leitura de pixels em `try/catch`: quando a página é aberta via `file://`, `getImageData` lança erro de canvas contaminado. Nesse caso, use a imagem original sem transparência e **mostre um aviso discreto na tela**: "Abra via servidor local (`python3 -m http.server`) para transparência correta nos sprites."

## 3. MAPA

- Grid de **128 × 128 tiles**, tile de **32 px** (4096 × 4096 px de mundo).
- Terrenos: `GRASS`, `DIRT`, `WATER` (intransponível), `FOREST` (recurso), `GOLDMINE` (recurso), `ROCK` (decoração, intransponível).
- Mapa **gerado proceduralmente com seed fixa** e **espelhado na diagonal**: jogador no canto inferior-esquerdo, bot no superior-direito.
- Cada base começa com 1 mina de ouro a ~8 tiles do Centro e um bosque de ~40 árvores a ~10 tiles. Mais 2 minas neutras no meio.
- 2 ou 3 lagos e alguns aglomerados de rocha.

### Tiling espelhado (obrigatório)

As texturas `grass`, `dirt` e `water` **não são sem emenda**. Cada imagem cobre **4 × 4 tiles (128 × 128 px de mundo)**, não 1 tile.

Para eliminar a emenda, desenhe com **espelhamento alternado**: uma célula de textura em `(cx, cy)` é desenhada com `scale(-1, 1)` quando `cx` é ímpar e `scale(1, -1)` quando `cy` é ímpar. Assim cada borda sempre encosta no espelho de si mesma e casa perfeitamente. Sem isso aparece um quadriculado óbvio no mapa inteiro.

## 4. CÂMERA E FOG OF WAR

- Pan com **WASD**, setas, **arrastar com botão do meio** e **edge-scroll** (mouse a menos de 20px da borda).
- Zoom com a roda, entre **0.5x e 1.6x**, centrado no cursor.
- **Minimapa** 200×200 no canto inferior-esquerdo: terreno, unidades como pontos coloridos, retângulo do viewport. Clicar e arrastar move a câmera.
- **Fog of war em 3 estados**: nunca explorado (preto), explorado sem visão (terreno a ~45% de brilho, unidades inimigas escondidas), com visão (normal). Raio: unidades 6 tiles, herói 8, prédios 7.
- Fog num canvas offscreen de resolução reduzida, atualizado a cada 200ms.

## 5. RECURSOS

**Ouro**, **Madeira** e **Comida** (supply cap, formato `usado/máximo`).

- Início: **600 ouro, 400 madeira, cap de comida 10**.
- Fazenda dá **+8 de cap**. Cap máximo absoluto: **60**.
- Com `comida usada >= cap`, treino bloqueado e aviso na HUD.

## 6. COLETA DE RECURSOS

- **Ouro**: trabalhador entra na mina, 2.5s, sai com 8 de ouro, anda até o Centro, entrega, volta. Máximo 5 trabalhadores por mina; os demais esperam em fila. Mina tem 5000 e some quando esgota.
- **Madeira**: 4s cortando, sai com 10, entrega no Centro. Árvore tem 100 de madeira; ao esgotar ela some, o tile vira `GRASS` e o trabalhador vai sozinho para a próxima árvore.
- Clique direito em mina ou árvore inicia o ciclo em loop, sem novo comando.
- Trabalhador carregando recurso mostra um indicador visual.

## 7. TABELA DE UNIDADES (números exatos)

Duas raças **espelhadas**: números idênticos, muda nome, cor e arte.

| Unidade (Humano / Orc) | HP | Dano | Alcance | Cadência | Vel. | Armadura | Custo | Comida | Tempo |
|---|---|---|---|---|---|---|---|---|---|
| Camponês / Peão | 60 | 5 | corpo | 1.2s | 95 px/s | 0 | 50 ouro | 1 | 12s |
| Soldado / Brutamontes | 220 | 14 | corpo | 1.4s | 80 px/s | 2 | 90 ouro, 20 mad. | 2 | 20s |
| Arqueiro / Caçador | 130 | 11 | 170 px | 1.6s | 85 px/s | 0 | 70 ouro, 40 mad. | 2 | 22s |
| Herói | 520 | 26 | corpo* | 1.1s | 100 px/s | 4 | grátis | 3 | 30s |

\* Arquimago e Xamã atacam a 200 px. Paladino e Mestre de Armas são corpo a corpo.

Dano final = `dano - armadura`, mínimo de 1.

## 8. TABELA DE PRÉDIOS

| Prédio (Humano / Orc) | HP | Custo | Tempo | Função |
|---|---|---|---|---|
| Centro / Fortaleza (T1) | 1400 | inicial | — | Treina trabalhador. Depósito de recursos. |
| Melhoria para T2 | 2200 | 400 ouro, 300 mad. | 40s | Libera herói e unidade de distância. Troca o sprite para `townhall_2`. |
| Fazenda / Toca | 320 | 80 ouro, 40 mad. | 15s | +8 de cap de comida. |
| Quartel / Covil | 850 | 150 ouro, 100 mad. | 30s | Treina corpo a corpo (e distância após T2). |

- Construção por trabalhador: seleciona → atalho ou botão → fantasma verde/vermelho segue o mouse → clique posiciona → trabalhador anda e constrói, com o prédio subindo de opacidade e barra de progresso.
- Estado inicial: **1 Centro T1 + 4 trabalhadores** ao redor.
- Escala de desenho: o Centro ocupa 3×3 tiles, o Quartel 3×2, a Fazenda 2×2. Ajuste a escala do `drawImage` para bater com essas caixas, independente do tamanho do arquivo de imagem.

## 9. HERÓIS

Ao concluir o T2, aparece no Centro a opção de **escolher 1 entre 2 heróis** da raça. Só 1 herói vivo por vez. Morto, ressuscita no Centro em 45s mantendo o nível.

**Humano**
- **Paladino** (corpo a corpo): **Luz Sagrada** — cura 150 HP em aliado alvo, cooldown 12s. Passiva: +1 de armadura em aliados num raio de 250px.
- **Arquimago** (200px): **Nevasca** — raio de 120px no ponto clicado, 20 de dano/s por 4s, cooldown 16s. Passiva: +2 de visão.

**Orc**
- **Mestre de Armas** (corpo a corpo): **Redemoinho** — 30 de dano em todos os inimigos num raio de 130px, cooldown 14s. Passiva: 20% de chance de crítico ×2.
- **Xamã** (200px): **Corrente de Raios** — 45 de dano pulando em até 3 alvos, cooldown 15s. Passiva: regenera 3 HP/s.

Herói sobe de nível a cada 6 abates, **níveis 1 a 3**, cada nível dá +80 HP e +5 de dano. Mostre o nível na HUD e uma aura no sprite.

## 10. COMBATE

- Aquisição automática de alvo: unidade parada ataca inimigo que entre no raio de agressão de 220px. Prédios não atacam.
- Unidade com ordem de mover ignora inimigos até chegar. Attack-move é comando separado.
- Projéteis visíveis para unidades de distância.
- Barra de vida acima de unidades e prédios, visível no hover ou com HP incompleto.
- Morte: fade de 0.4s, deixa mancha no chão que some em 8s.
- Todo dano tem feedback: flash branco no alvo e número de dano subindo.

## 11. CONTROLES

- **Clique esquerdo**: seleciona. **Arrastar**: caixa de seleção. **Shift + clique**: adiciona/remove.
- **Duplo clique** numa unidade: seleciona todas do mesmo tipo na tela.
- **Clique direito** contextual: terreno = mover; inimigo = atacar; mina/árvore com trabalhador = coletar; prédio próprio danificado = reparar.
- **Shift + clique direito**: enfileira comandos, com marcadores no chão.
- **A + clique**: attack-move. **S**: parar. **H**: manter posição.
- **Ctrl + 1..5**: grupo de controle. **1..5**: seleciona. **Duplo tap**: centraliza no grupo.
- **F1**: centraliza no herói. **Espaço**: centraliza no último ataque recebido.
- Com trabalhador selecionado: **F** fazenda, **B** quartel, **Esc** cancela.
- Máximo de 40 unidades selecionadas.

## 12. HUD

- **Barra superior**: ouro, madeira, comida (vermelho se cheio), tempo de partida.
- **Inferior esquerdo**: minimapa.
- **Inferior central**: retrato (de `portraits`) + nome + HP da unidade selecionada. Com vários selecionados, grade de até 40 retratos pequenos com barrinha de vida.
- **Inferior direito**: grade de comandos 3×3 estilo RTS clássico, ícones desenhados, letra do atalho no canto, tooltip com custo e descrição. Botão indisponível fica escurecido com o motivo no tooltip.
- Fila de treino do prédio selecionado com barra de progresso.
- Alertas no topo central: "Ouro insuficiente", "Comida insuficiente — construa uma fazenda", "Sua base está sob ataque!".
- Estética: pedra escura e madeira, dourado nos detalhes, cantos chanfrados, fonte serifada pesada do sistema. Contraste alto.
- Tela de escolha de raça usa `ASSETS.title` como fundo, com escurecimento por cima para o texto ler.

## 13. IA DO BOT

Máquina de estados determinística, build order fixa por tempo:

| Tempo | Ação |
|---|---|
| 0:00 | 4 trabalhadores no ouro, treina 2 trabalhadores |
| 0:40 | Constrói Fazenda; 2 trabalhadores vão para madeira |
| 1:10 | Constrói Quartel |
| 1:30 | Treina 3 corpo a corpo |
| 2:00 | Inicia melhoria para T2 |
| 2:45 | Escolhe herói (aleatório entre os 2) |
| 3:00 | **Primeira onda**: 4 unidades + herói vão para a base do jogador |

Depois: onda a cada **90s**, com 2 unidades a mais que a anterior, teto de 20 no exército. Mantém 6-8 trabalhadores no ouro e 3-4 na madeira, constrói fazenda quando o cap chega a 2 de folga. Base atacada chama unidades ociosas para defender. Exército morto por inteiro: recua e reconstrói antes da próxima onda.

O bot **não trapaceia**: mesma economia, mesmos custos, mesmo tempo de construção.

## 14. VITÓRIA E DERROTA

- Vence quem destruir o Centro adversário.
- Tela de fim com resultado, tempo, recursos coletados, unidades produzidas e perdidas, e botão **Jogar Novamente** que reinicia sem recarregar a página.
- Abertura: tela de escolha de raça com dois botões grandes. Sem lobby, sem menu.

## 15. PERFORMANCE (obrigatório)

Alvo: **60 FPS com 200 unidades** num notebook comum.

1. **Terreno**: renderize o mapa inteiro uma vez num canvas offscreen e copie só a região visível com `drawImage`. Nunca redesenhe tile a tile no loop.
2. **Pathfinding**: A* no grid com **orçamento de no máximo 6 buscas por frame** e fila de requisições. Cache de caminhos recentes. Ordem de grupo com mais de 5 unidades: **um** caminho para o centroide e steering local para o resto seguir.
3. **Colisão e alvos**: hash espacial com células de 256px. Nunca O(n²) sobre todas as unidades.
4. **Separação**: força de repulsão simples entre unidades próximas. Sem física complexa.
5. **Culling**: só desenhe o que está no viewport, com margem.
6. **Zero alocação no loop quente**: reutilize vetores, use pool para projéteis e partículas.
7. **Ordem de desenho**: ordene os sprites por `y` a cada frame para a sobreposição ficar correta. Use ordenação por índice pré-alocado, não `sort` de objetos novos.

## 16. POLIMENTO

- Círculo de seleção verde embaixo das unidades selecionadas.
- Marcador de destino: círculo verde animado no ponto clicado.
- Poeira ao construir, partículas ao morrer.
- Cor de time: azul para o jogador, vermelho para o bot.
- Ícone piscando no minimapa quando algo seu leva dano.

## 17. ANIMAÇÃO DAS UNIDADES (importante — leia com atenção)

**Não existe sprite sheet.** Cada unidade tem **uma única imagem estática** de corpo inteiro, em pose neutra parada, virada para baixo-direita. Toda a animação é feita por **transformação no Canvas**, em cima dessa imagem. Nunca tente fatiar a imagem em frames.

Desenhe cada unidade com altura de **44 px** no zoom 1.0 (o herói com 54 px), ancorada pelos pés, aplicando:

- **Parada**: oscilação vertical suave, `sin(t * 2) * 1.5` px. Cada unidade com uma fase inicial aleatória, para o exército não pulsar em uníssono.
- **Andando**: oscilação vertical mais forte e rápida, `sin(t * 9) * 3` px, mais inclinação alternada de ±4° em torno da base. Isso lê como passo sem ter perna nenhuma se mexendo.
- **Direção**: se o alvo de movimento está à esquerda, espelhe com `scale(-1, 1)`. **Só duas direções.** Não tente 8.
- **Atacando**: avanço rápido de 8 px na direção do alvo em 100ms e volta em 150ms, com squash de 1.1x na horizontal e 0.9x na vertical no pico. É o impacto que vende o golpe.
- **Levando dano**: recuo de 3 px na direção contrária e flash branco de 80ms (desenhe a silhueta em branco por cima com `globalAlpha`).
- **Morrendo**: em 400ms, rotacione 90° para o lado, achate para 0.6 da altura e faça fade até 0.
- **Sombra**: elipse escura semitransparente sob os pés, largura de 60% da unidade. É isso que "assenta" o sprite no chão e evita o efeito de figurinha flutuando.
- **Cor de time**: círculo fino da cor do time no chão, sob a sombra. É assim que o jogador distingue os exércitos, já que os sprites das duas raças são visualmente diferentes mas os times precisam ser óbvios.

## CHECKLIST DE ACEITAÇÃO

Verifique cada item no seu próprio código antes de entregar.

1. [ ] Arquivo único, sem dependências externas além das imagens locais.
2. [ ] Nenhum `localStorage` / `sessionStorage`.
3. [ ] `ASSETS` no topo com as 5 categorias e todos os slots em `null`, com fallback procedural funcionando em todos.
4. [ ] Chroma key implementado, rodando uma vez no carregamento, com `try/catch` para `file://` e aviso na tela.
5. [ ] `units` e `portraits` usados em lugares diferentes, nunca trocados.
6. [ ] Tela inicial com escolha de raça, usando `ASSETS.title` de fundo.
7. [ ] Mapa 128×128 gerado, espelhado, com água, floresta, minas e rochas.
8. [ ] Tiling espelhado do terreno implementado, 1 imagem = 4×4 tiles.
9. [ ] Câmera: WASD, setas, botão do meio, edge-scroll e zoom funcionam.
10. [ ] Minimapa desenha e responde a clique e arrasto.
11. [ ] Fog of war em 3 estados, unidades inimigas somem fora da visão.
12. [ ] Seleção por clique, caixa, shift e duplo clique.
13. [ ] Grupos de controle Ctrl+1..5.
14. [ ] Clique direito contextual: move, ataca, coleta e repara.
15. [ ] Trabalhador coleta ouro em ciclo infinito sem novo comando.
16. [ ] Árvore esgota, some, e o trabalhador vai sozinho para a próxima.
17. [ ] Construir fazenda e quartel funciona, com fantasma e validação de terreno.
18. [ ] Cap de comida bloqueia treino com a mensagem certa.
19. [ ] Melhoria para T2 funciona, **troca o sprite do Centro para `townhall_2`** e libera herói + distância.
20. [ ] Escolha entre 2 heróis aparece e o herói nasce no Centro.
21. [ ] As 4 habilidades ativas funcionam, com cooldown visível.
22. [ ] Herói sobe de nível com abates e ressuscita ao morrer.
23. [ ] Unidades de distância disparam projéteis visíveis.
24. [ ] Animação: bob parado, bob+inclinação andando, espelhamento por direção, lunge no ataque, flash no dano, tombo na morte.
25. [ ] Sombra elíptica e círculo de cor de time sob cada unidade.
26. [ ] Sprites ordenados por `y` a cada frame.
27. [ ] O bot executa a build order e a primeira onda chega por volta dos 3:00.
28. [ ] Ondas seguintes crescem e o bot reconstrói quando perde o exército.
29. [ ] Destruir o Centro inimigo mostra vitória; perder o seu mostra derrota.
30. [ ] Botão Jogar Novamente reinicia sem recarregar a página.
31. [ ] Terreno renderizado via canvas offscreen, não tile a tile por frame.
32. [ ] Pathfinding com orçamento por frame; 50 unidades movendo juntas não travam o jogo.
33. [ ] Hash espacial em uso; nenhum loop O(n²) sobre unidades.
34. [ ] Nenhum `TODO`, `FIXME`, função vazia ou funcionalidade não implementada.

Escreva agora o `index.html` completo na raiz do projeto.
