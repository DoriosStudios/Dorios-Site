# Dorios Site — mapa de conteúdo e manutenção

Este arquivo indica onde alterar cada parte do site, quais arquivos são fonte de verdade e quais lacunas ainda existem nas wikis.

## Fluxo de dados

```text
Projeto bridge. (BP/RP)
  -> scripts/map_project_wiki.py
  -> src/wiki/projects/<id>/manifest.json
  -> src/wiki/projects/<id>/index.js (camada editorial)
  -> src/components/AddonWiki/index.js (layout compartilhado)
  -> plugins/addon-wiki-routes/index.js (rotas estáticas)
```

Não edite manualmente um `manifest.json` para corrigir conteúdo originado no add-on: ele é regenerado. Corrija o BP/RP ou o mapper e execute novamente o mapeamento. Use o `index.js`, perfis e configurações locais para conteúdo editorial que não existe de forma estruturada no add-on.

## Páginas principais

| Área | Conteúdo/JSX | Estilos |
| --- | --- | --- |
| Home | `src/pages/index.js` | `src/pages/home.module.css` |
| Lista de projetos | `src/pages/projects/index.js` | `src/pages/projects/projects.module.css` |
| Página de um projeto | `src/components/ProjectDetailPage/index.js` | `src/components/ProjectDetailPage/styles.module.css` |
| Wiki — escolha de projeto | `src/pages/wiki/index.js` | `src/pages/wiki/wikiHub.module.css` |
| Wiki compartilhada | `src/components/AddonWiki/index.js` | `src/components/AddonWiki/styles.module.css` |
| Studio | `src/pages/studio.js` | `src/pages/studio.module.css` |
| Staff | `src/pages/studio/staff.js` | `src/pages/studio/studioSubpage.module.css` |
| Credits | `src/pages/studio/credits.js` | `src/pages/studio/studioSubpage.module.css` |
| Support | `src/pages/support.js` | `src/pages/support.module.css` |
| Header/footer | `src/components/DoriosMarketingShell/index.js` | `src/components/DoriosMarketingShell/styles.module.css` |

## Projetos

### Campos de cards e páginas de projeto

Edite `src/data/projectCatalog.json`.

| Campo | Controla |
| --- | --- |
| `name`, `summary`, `description` | Nome, resumo do card e texto completo |
| `kind`, `category`, `tags` | Badges e classificação |
| `lifecycle`, `version`, `minecraftVersion` | Estado e versões |
| `featuredRank` | Destaque e ordenação editorial |
| `requires` | Dependências mostradas em extensões |
| `routes.project`, `routes.wiki` | Links internos |
| `links` | CurseForge, MCPEDL, GitHub e releases |
| `media.cover`, `media.icon`, `media.alt` | Arte principal e thumbnail |
| `metrics` | Items, Blocks, Machines, Recipes e outras métricas |

Paletas visuais dos projetos ficam em `src/data/cardPalettes.js`. Paletas dos previews sociais ficam em `src/data/socialPreviewPalettes.json`.

Downloads do Ascendant Technology são atualizados por `scripts/refresh-github-release-stats.mjs` e gravados em `src/data/githubReleaseStats.json`.

## Wikis

### Gerar ou atualizar uma wiki

```powershell
python scripts/map_project_wiki.py "C:/caminho/do/projeto" --id id-do-projeto
```

Faça primeiro um teste sem escrita:

```powershell
python scripts/map_project_wiki.py "C:/caminho/do/projeto" --id id-do-projeto --dry-run
```

O mapper está em `scripts/addon_wiki_mapper/`. A cópia de assets, registro do projeto e geração do módulo são coordenados por `scripts/map_project_wiki.py`.

### Dados por wiki

| Wiki | Dados gerados | Personalização editorial |
| --- | --- | --- |
| UtilityCraft | `src/wiki/projects/utilitycraft/manifest.json` | `index.js` e `machineProfiles.js` |
| Ascendant Technology | `src/wiki/projects/ascendant-technology/manifest.json` | `index.js` e `machineProfiles.js` |
| Dorios' Trinkets | `src/wiki/projects/trinkets/manifest.json` | `index.js`, `trinketProfiles.json` e `categorySections.json` |
| Heavy Machinery | `src/wiki/projects/heavy-machinery/data.js` e `recipeData.js` | `index.js` |

### Itens, blocos e máquinas

- Nome, identifier, textura, render, receita e dados brutos: vêm do `manifest.json` gerado.
- Descrições e campos específicos de trinkets: `src/wiki/projects/trinkets/index.js`.
- Efeitos/atributos extraídos de Trinkets: `src/wiki/projects/trinkets/trinketProfiles.json`.
- Categorias e agrupamentos da sidebar de Trinkets: `src/wiki/projects/trinkets/categorySections.json`.
- Especificações reais das máquinas do UtilityCraft: `src/wiki/projects/utilitycraft/machineProfiles.js`.
- Categorias e especificações do Ascendant: `src/wiki/projects/ascendant-technology/machineProfiles.js`.
- Labels e comportamento compartilhado de catálogos/detalhes: `src/components/AddonWiki/index.js`.
- Aparência compartilhada de cards, filtros, sidebar e detalhes: `src/components/AddonWiki/styles.module.css`.
- Rotas e aliases estáticos: `plugins/addon-wiki-routes/index.js`.

O detalhe editorial de item (`Hero -> Basic Information -> Trinket Capabilities -> How to Obtain -> Usage`) é renderizado pelo componente `ItemDetail` em `src/components/AddonWiki/index.js`. Para enriquecer um item sem alterar o layout compartilhado, forneça `documentation` no overlay do projeto:

```js
documentation: {
  description: 'Resumo curto do item.',
  basic: {itemType, equipSlot, maximumStack},
  capabilities: {
    attributeModifiers: [{name, modifier}],
    passiveEffects: [{name, description}],
    activeEffects: [{name, description}],
    specialAbility: {name, description, cooldown},
    immunities: [{name, description}],
  },
  acquisition: {
    entityDrops: [{entity, chance, minQuantity, maxQuantity}],
    structures: [{structure, chance, table, conditions}],
    biomes: [{biome, chance}],
  },
  usage: 'Instruções adicionais, somente quando necessárias.',
}
```

Campos e grupos vazios são omitidos automaticamente. Receitas não devem ser duplicadas em `documentation`: o detalhe procura receitas cujo `result.id` corresponde ao item no manifest gerado.

Para adicionar uma categoria de Trinkets, inclua seu `id`, `label` e `icon` em `categorySections.json`. Use `categories` quando uma página da sidebar reunir subcategorias e `aliases` para preservar URLs antigas.

### Assets

Assets publicados das wikis ficam em `static/img/wiki/<id>/`:

- `renders/`: renders completos de blocos e máquinas;
- `textures/items/`: ícones de itens;
- `showcase/` e `guide/`: artes editoriais;
- outros diretórios refletem assets exportados pelo mapper.

Os previews Open Graph são gerados por `scripts/generate-social-previews.mjs` em `static/img/social/wiki/` durante `npm start` e `npm run build`. Não edite os PNGs gerados.

Metadados específicos ficam em `src/components/SocialMetadata/index.js`; o fallback para todas as páginas fica em `src/theme/Layout/index.js`.

## Documentação e blog

- Documentação principal: `docs/`.
- Documentação dos scripts/DoriosCore: `documentation/`.
- Sidebars: `sidebars.js`.
- Blog: `blog/` e autores em `blog/authors.yml`.

## Auditoria atual das wikis

### Prioridade alta

1. Quinze projetos do catálogo ainda não possuem rota de wiki: Better Containers, Compressy, Digital Storage, Dorios' Atelier, Dorios' Insight, Paxels & AIOTs, Tiered Machinery, Dorios' Chests, Dorios' Enchants, Lucky Tools, ProjectU, Remix's Attributes, Too Many Trinkets, UtilityCraft Quarry e UtilitySky.
2. Os manifests de UtilityCraft, Ascendant Technology e Trinkets não trazem descrições editoriais para os itens/blocos. As páginas técnicas funcionam, mas descrições úteis precisam ser adicionadas via mapper ou overlays editoriais.
3. Heavy Machinery usa dados mantidos manualmente em `data.js`; falta uma rotina de comparação automática com o projeto bridge. para detectar drift.

### Prioridade média

1. UtilityCraft possui dois itens sem imagem mapeada: `utilitycraft:bionic_arm` e `utilitycraft:lucky_fishing_rod_item`.
2. Entidades visíveis sem imagem/documentação visual: `utilitycraft:hopper`, `utilitycraft:infinite_tank`, `utilitycraft:machine`, `utilitycraft:machine_entity`, `utilitycraft:pipe`, `utilitycraft:waycenter`, `utilitycraft:xp_condenser` e `utilitycraft:power_beacon_entity` no Ascendant.
3. Alguns dados de Trinkets ainda caem em fallbacks editoriais como `Add-on progression`, `No status effect` e `No attribute change`. Eles são honestos, mas devem ser substituídos quando existir uma fonte real mais específica.
4. Itens e blocos comuns ainda não possuem um overlay equivalente aos `machineProfiles`/`trinketProfiles`; isso limita campos específicos por categoria.

### Prioridade baixa

1. Criar validação de cobertura entre chaves de `machineProfiles` e máquinas detectadas no manifest.
2. Validar automaticamente imagens quebradas e identifiers sem rota de detalhe.
3. Criar um glossário único para labels técnicas antes da internacionalização.
4. Evitar duplicação entre `cardPalettes.js` e `socialPreviewPalettes.json` usando uma única fonte serializável.

## Validação antes de publicar

```powershell
npm run validate:catalog
npm run build
npm run serve -- --host 0.0.0.0 --port 19132 --no-open
```

Verifique pelo menos Home, Projects, Staff, uma categoria de Trinkets, uma máquina de UtilityCraft, uma máquina de Ascendant, Heavy Machinery e uma página de documentação em desktop/mobile e temas claro/escuro.
