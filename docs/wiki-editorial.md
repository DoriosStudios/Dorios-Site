# Descrições, transporte e traduções da wiki

## Fonte editorial

`website/src/wiki/editorialContent.js` aplica os resumos de obtenção e os blocos
de funcionamento sobre os catálogos existentes. Os manifests e perfis gerados
continuam sendo fontes de dados; não é necessário editá-los manualmente.

Os resumos de materiais indicam uma rota de obtenção, sem prometer rendimento,
altura exata ou listar todas as alternativas. Há textos próprios para recursos
minerados, essências capturadas com o Recipiente de Essência, materiais coletados
com martelo e os principais metais de progressão. Os demais materiais usam as
receitas indexadas, priorizando obtenção inicial sobre desmontagem de blocos de
armazenamento e clonagem. Acessórios equipáveis não são classificados como
matérias-primas pelo nome.

O detalhamento do Cristal de Aetherium permanece nas páginas de receitas, usos
e notas. Seu resumo principal também acompanha o idioma selecionado.

## Funcionamento do transporte

O painel adicional aparece na visão geral e nas especificações. Abrange:

- Importers e Exporters de itens, incluindo as cores presentes no catálogo;
- Importer e Exporter universais do Ascendant Technology, com ajustes separados de itens, líquidos e gases e passagem da rede de energia;
- tubos de líquidos e gases, com conexões e limites definidos pelos terminais;
- hoppers mecânicos, Upper, Dropper e Ender Hopper;
- esteiras por material, pontes e distribuidores do Ascendant Technology;
- Import Buffer e Export Buffer do Digital Storage.

Os perfis também aceitam terminais dedicados de líquidos, gases e múltiplos
recursos quando essas entradas forem incluídas no catálogo.

### Valores conferidos no código dos addons

| Sistema | Fonte | Valor documentado |
| --- | --- | --- |
| Exporter de itens | UtilityCraft: `BP/scripts/UtilityCore/networks/items.js` e `BP/blocks/machinery/pipes/item/item_exporter.json` | Até 64 itens/operação; 1–5 operações por ciclo de 10 ticks; até 128–640 itens/s com pilhas cheias e 20 ticks/s |
| Filtros de rede | Mesmo módulo | Exigem Filter Upgrade; lista de permissão vazia bloqueia a origem, enquanto lista de itens vazia do Importer permite todos os itens |
| Distribuição de rede | Mesmo módulo | Nearest, Farthest e Round Robin são escolhidos no Exporter de origem |
| Hoppers | UtilityCraft: `BP/scripts/machinery/hoppers/mechHoppers.js` e `BP/blocks/machinery/hoppers/` | 1–5 tentativas de pilha por etapa, a cada 8 ticks; não representa uma taxa fixa de itens |
| Ender Hopper | Mesmo módulo | Raio padrão de 3 blocos, até 11 com melhorias de alcance |
| Esteiras | Ascendant Technology: `BP/scripts/ATCore/transportation/conveyors.js` | Cobre 1, titânio 2 e Aetherium 5 blocos/s; pontes de 8, 16 e 32 blocos |
| Buffers digitais | Digital Storage: `BP/scripts/Machinery/storage/machines/import_buffer.js`, `export_buffer.js` e definições dos blocos | Ciclo de 10 ticks; 1–9 operações de pilha com 0–8 melhorias de velocidade |

As taxas são estimativas nominais, sujeitas a pilhas, filtros, disponibilidade de
recursos, capacidade do destino, faces de entrada/saída e chunks carregados.
Velocidade de deslocamento de esteira é expressa em blocos/s.

## Idiomas

`website/src/i18n/wiki.js` e `wikiEditorial.js` contêm o vocabulário compartilhado
e as traduções editoriais em português brasileiro e espanhol mexicano. O inglês
é a fonte e o fallback para textos ainda sem tradução.

`localizeWikiProject` traduz os campos de apresentação sem alterar identificadores,
slugs, categorias usadas nos filtros, tipos de receita ou referências entre itens.
Os nomes traduzidos também são usados nos ingredientes e nos resultados das
receitas. Os objetos localizados são armazenados em cache por projeto e idioma.

Ao adicionar uma descrição, inclua os três idiomas no perfil editorial ou a
tradução correspondente no dicionário. Textos de receitas, propriedades,
encantamentos, aquisição, mineração, filtros e acessibilidade usam essa camada
compartilhada. Textos longos de guias, documentos e publicações que ainda usam
o fallback precisam de tradução editorial própria; este mecanismo não traduz
conteúdo arbitrário automaticamente.

## Verificação

Na pasta `website`:

```powershell
node --test scripts/wiki-editorial.test.cjs plugins/addon-wiki-routes/route-data.test.js
```

Além desses testes, gere e abra páginas de recursos e transportes em `en`,
`pt-BR` e `es-MX`, incluindo abertura direta de `/specs`, mudança de idioma,
receitas e a apresentação em telas pequenas.
