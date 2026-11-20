# Atualização dos dados da wiki

## Fontes atuais

A sincronização de 19/11/2026 usa os checkouts em `Documents/Projects/projects`.
O UtilityCraft usa o clone separado em `Dorios Site/wiki-sources/UtilityCraft`,
atualizado por fast-forward até a revisão `d02253ea` (manifest 3.6.3).
O Ascendant Technology foi importado da revisão `21294c82` (manifest 0.9.4).

A versão do manifest identifica a fonte importada; a disponibilidade de downloads
continua sendo obtida separadamente pelo cache de releases. Alterações locais
nos packs são identificadas pelo campo `source.dirty` dos manifests da wiki.

## Sincronização

Na pasta `website`, execute:

```powershell
npm run sync:wiki
```

O comando atualiza as nove wikis existentes: UtilityCraft, Ascendant Technology,
Heavy Machinery, Digital Storage, Better Smelters, Bountiful Bonsais, Excavate,
Tiered Machinery e Trinkets. Atualiza também as versões, requisitos, ícones,
revisões e métricas dos projetos locais já presentes no catálogo, preservando
as decisões de publicação e os textos editoriais. Fontes ausentes são preservadas.
Não cria wikis nem altera os projetos de origem.

Para escolher as fontes explicitamente:

```powershell
$env:BRIDGE_PROJECTS_PATH = 'C:/caminho/para/projects'
$env:UTILITYCRAFT_PROJECT_PATH = 'C:/caminho/para/UtilityCraft'
npm run sync:wiki
```

Antes de sincronizar, mantenha o clone separado do UtilityCraft na revisão
desejada. O comando não faz fetch, merge, commit, push ou publicação.

## Dados e conteúdo

- Os manifests registram versão, revisão, alterações locais, itens, blocos,
  entidades, receitas, variantes e imagens referenciadas pelos packs.
- Os extratores mantêm a origem de cada receita, inclusive adições de extensões
  às máquinas do UtilityCraft.
- As receitas de vapor são lidas da configuração compartilhada de Steam Boiler,
  Vaporizer e do processador legado.
- A alquimia inclui preparo, amplificação e extensão das formas canônicas de
  poções. Custos de preparo são por lote de até seis frascos; melhorias mantêm
  nível, duração e forma conforme a operação. Efeitos instantâneos não recebem
  receitas de extensão. Propriedades das poções incluem a duração reduzida das
  versões prolongadas.
- Heavy Machinery combina o catálogo atual dos packs com sua documentação
  editorial. Conteúdo transferido para UtilityCraft deixa de ser listado como
  conteúdo próprio. As URLs existentes com sublinhados são preservadas.
- Nomes traduzidos são extraídos dos arquivos `pt_BR.lang` e `es_MX.lang`.
  Descrições editoriais novas recebem traduções próprias.
- Quantidades de máquinas e sistemas de energia vêm dos mesmos adaptadores
  usados nas páginas da wiki.

Registros recebidos dinamicamente de outros addons durante uma partida não são
inventados como receitas estáticas. Itens de poção com durações personalizadas
em propriedades dinâmicas seguem as regras descritas, sem representar cada
estado possível como uma receita separada.

## Verificação

```powershell
node --test scripts/wiki-editorial.test.cjs plugins/addon-wiki-routes/route-data.test.js
npm run validate:catalog
npm run validate:machine-recipes
```

O build completo usa `npm run build`. Compilações com um recorte representativo
de rotas verificam as páginas selecionadas e devem ser identificadas como tal.
