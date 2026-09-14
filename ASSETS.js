// ============================================================================
// ASSETS — cole este bloco no topo do <script> do index.html,
// substituindo o objeto ASSETS que o Astra gerou com tudo em null.
//
// Caminhos relativos: a pasta assets/ tem que ficar ao lado do index.html.
// Rode o baixar-imagens.sh primeiro para criar essa pasta.
//
// Qualquer slot deixado em null cai no desenho procedural. Nada quebra.
// ============================================================================

const ASSETS = {

  // Terreno. grass/dirt/water sao texturas repetidas: 1 imagem cobre 4x4 tiles
  // (128px de mundo) e o tiling e espelhado para matar a emenda.
  // tree/goldmine sao objetos desenhados por cima do terreno.
  tiles: {
    grass:    'assets/tiles/grass.png',
    dirt:     'assets/tiles/dirt.png',
    water:    'assets/tiles/water.png',
    tree:     'assets/tiles/tree.png',
    goldmine: 'assets/tiles/goldmine.png'
  },

  // Predios. Fundo chapado de cor unica, remocao por chroma key no carregamento.
  buildings: {
    human_townhall_1: 'assets/buildings/human_townhall_1.png',
    human_townhall_2: 'assets/buildings/human_townhall_2.png',
    human_farm:       'assets/buildings/human_farm.png',
    human_barracks:   'assets/buildings/human_barracks.png',
    orc_townhall_1:   'assets/buildings/orc_townhall_1.png',
    orc_townhall_2:   'assets/buildings/orc_townhall_2.png',
    orc_farm:         'assets/buildings/orc_farm.png',
    orc_barracks:     'assets/buildings/orc_barracks.png'
  },

  // Sprites de mapa: corpo inteiro, vista de cima 3/4, virados para baixo-direita.
  // Fundo MAGENTA #FF00FF, removido por chroma key no carregamento.
  // A animacao e feita por codigo (bob, lunge, flash, morte) — nao ha sprite sheet.
  units: {
    human_worker:          'assets/units/human_worker.png',
    human_melee:           'assets/units/human_melee.png',
    human_ranged:          'assets/units/human_ranged.png',
    human_hero_paladin:    'assets/units/human_hero_paladin.png',
    human_hero_archmage:   'assets/units/human_hero_archmage.png',
    orc_worker:            'assets/units/orc_worker.png',
    orc_melee:             'assets/units/orc_melee.png',
    orc_ranged:            'assets/units/orc_ranged.png',
    orc_hero_blademaster:  'assets/units/orc_hero_blademaster.png',
    orc_hero_shaman:       'assets/units/orc_hero_shaman.png'
  },

  // Retratos do painel de selecao. Rosto e ombros, fundo escuro.
  // NAO usar no mapa — sao imagens diferentes dos sprites acima.
  portraits: {
    human_worker:          'assets/portraits/human_worker.png',
    human_melee:           'assets/portraits/human_melee.png',
    human_ranged:          'assets/portraits/human_ranged.png',
    human_hero_paladin:    'assets/portraits/human_hero_paladin.png',
    human_hero_archmage:   'assets/portraits/human_hero_archmage.png',
    orc_worker:            'assets/portraits/orc_worker.png',
    orc_melee:             'assets/portraits/orc_melee.png',
    orc_ranged:            'assets/portraits/orc_ranged.png',
    orc_hero_blademaster:  'assets/portraits/orc_hero_blademaster.png',
    orc_hero_shaman:       'assets/portraits/orc_hero_shaman.png'
  },

  title: 'assets/title.png'
};

// ============================================================================
// AVISO SOBRE file://
//
// Chroma key le os pixels da imagem com getImageData, e o navegador bloqueia
// isso em canvas "contaminado" por imagem carregada via file://.
// Abrindo o index.html com duplo clique, os sprites vao aparecer COM o fundo
// magenta. Isso nao e bug do jogo.
//
// Solucao: sirva a pasta por HTTP. Na pasta do index.html, rode:
//
//     python3 -m http.server 8000
//
// e abra http://localhost:8000
//
// Sem imagens (todos os slots em null), o duplo clique funciona normalmente.
// ============================================================================
