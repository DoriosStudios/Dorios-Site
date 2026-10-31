# Atualização dos dados do UtilityCraft

## Fonte usada em 30/10/2026

- Repositório oficial: `https://github.com/DoriosStudios/UtilityCraft.git`.
- Revisão: `3d888eada613`, do ramo `main`, consultado em 30/10/2026.
- Versão do manifest: **3.6.2** (versão declarada na fonte).
- Os dados acompanham o ramo principal nessa revisão. A versão do manifest
  identifica a fonte importada e não confirma um lançamento público.

Foi feito um clone separado do checkout de desenvolvimento:

```text
Dorios Site/
  wiki-sources/UtilityCraft/   # clone limpo, fora do Git do site
  Dorios-Site/website/        # fontes e dados do site
```

`scripts/wiki-source-paths.mjs` prioriza `UTILITYCRAFT_PROJECT_PATH`, depois esse
clone separado e, por último, o caminho legado do bridge. Isso também se aplica
aos geradores usados pelo `prestart` e `prebuild`.

## Importação

Na pasta `website`, com a fonte oficial já atualizada:

```powershell
$env:UTILITYCRAFT_PROJECT_PATH = 'C:/Users/Kauziin/Documents/Projects/projects/Dorios Site/wiki-sources/UtilityCraft'
python scripts/map_project_wiki.py $env:UTILITYCRAFT_PROJECT_PATH --id utilitycraft --no-register
node scripts/extract-utilitycraft-processing-recipes.mjs --project utilitycraft
node scripts/generate-shared-item-documentation-profiles.mjs --project utilitycraft
node scripts/generate-wiki-localized-names.mjs --project utilitycraft
node scripts/refresh-github-release-stats.mjs --project utilitycraft
```

O seletor `--project utilitycraft` restringe as gravações ao UtilityCraft.
Os nomes traduzidos e os perfis dos outros projetos são preservados. Receitas
que esses projetos já adicionavam às máquinas do UtilityCraft continuam no
catálogo, com sua origem registrada.

O catálogo resumido `website/src/data/projectCatalog.json` também recebeu versão,
métricas, revisão e fingerprint atualizados, preservando os campos editoriais.
O manifest da wiki registra a revisão e a versão da fonte importada.
O cache de releases não foi alterado nesta atualização de receitas. A versão
disponível para download continua sendo obtida desse cache separadamente.

## Conteúdo incluído

- 273 itens registrados, agrupados em 263 entradas de catálogo;
- 510 blocos e 115 entidades;
- 1.443 receitas Bedrock e 1.267 registros de processamento;
- imagens e nomes localizados disponíveis no RP oficial;
- chumbo, urânio, novos recipientes e entidades de armazenamento;
- receitas da Primitive Forge, Electrolyzer e Chemical Converter;
- perfil da Primitive Forge com estrutura 2×2×2, uma receita por entrada
  por ciclo ou uma receita combinada e quatro slots de saída;
- combustíveis padrão extraídos da chamada declarativa `registerFuel`;
- tutorial de montagem e produção de aço em inglês, português e espanhol,
  em `/wiki/utilitycraft/how-to-play/primitive-forge`.

A Primitive Forge usa combustível sólido e aparece entre as máquinas mesmo sem
a tag das máquinas energizadas. O extrator inclui suas receitas de fundição e
combinação de dois ingredientes, com durações de 40 e 160 ticks. As receitas
estáticas de gases mantêm todos os produtos; registros dinâmicos recebidos por
eventos de script não são inventados.

O tutorial inclui a receita dos oito blocos, montagem em duas camadas 2×2,
slots, combustível separado do carbono da receita, fundição paralela, produção
de aço bruto e barras de aço, pausas e desmontagem. Os tempos nominais
consideram 20 ticks/s. A imagem usa o render existente no repositório oficial.

## Verificação em 30/10/2026

- `node --test scripts/wiki-editorial.test.cjs plugins/addon-wiki-routes/route-data.test.js`: 9 testes aprovados.
- Build representativo com 24 rotas da Wiki/projeto por idioma, além das páginas
  dos plugins de documentação necessários ao menu: inglês, português e espanhol
  gerados com sucesso. Essa execução não substitui o build completo do site.
- HTML do tutorial conferido nos três idiomas, incluindo títulos, instruções,
  links localizados e páginas de receitas/especificações referenciadas.
- A configuração temporária está em `website/.local_plans/forge-check/`, ignorada
  pelo Git. Os avisos de links externos ao recorte são esperados porque as
  demais páginas do site não participam desse build representativo.
- Nenhum commit ou publicação foi feito.
