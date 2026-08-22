# Plano do catálogo unificado de receitas de máquinas

## Objetivo

Documentar receitas de processamento a partir da fonte que as executa no
add-on, incluindo receitas que extensões registram em máquinas do
UtilityCraft. Cada receita deve deixar claro de qual add-on ela vem, sem
duplicar tabelas manuais nas páginas antigas.

## Implementação

1. **Normalizar na geração.** Os extratores leem os registries do
   UtilityCraft, Ascendant Technology e Heavy Machinery e gravam receitas com
   uma origem estável: `Base`, `Ascendant Technology` ou `Heavy Machinery`.
   O contrato também suporta entrada, catalisadores, fluido, saídas
   secundárias, chance, custo e duração.
2. **Agregar por máquina hospedeira.** Uma receita que Ascendant registra no
   Crusher é publicada no catálogo do Ascendant e no catálogo do Crusher do
   UtilityCraft. O card conserva a origem Ascendant; portanto não parece uma
   receita base nem fica escondida da máquina em que realmente funciona.
3. **Exibir proveniência.** O wiki mostra um selo e uma borda/colorização com
   a paleta do add-on de origem. Os catálogos geral e por máquina possuem um
   filtro de origem. O conjunto de origens é aberto: uma expansão futura só
   precisa declarar sua entrada no registro de origens e no extrator.
4. **Evitar dados desatualizados.** As páginas MDX podem explicar a máquina,
   mas o catálogo visual vem exclusivamente dos manifests gerados. Isso evita
   que uma tabela manual diverja de um registry de runtime.
5. **Usar a busca atual.** A busca do site passa a ser construída no próprio
   build e inclui rotas `/wiki/*`; as rotas legadas de documentação ficam fora
   do índice dedicado.
6. **Validar antes de publicar.** O build valida os três catálogos e exige
   origem visual completa em cada receita, além de confirmar que as adições de
   Ascendant e Heavy Machinery ao Crusher aparecem no catálogo do UtilityCraft.

## Fluxo para receitas e expansões futuras

1. Registre ou altere a receita no registry declarativo do add-on de origem.
2. Acrescente o registry à fonte do extrator quando for uma máquina ou um
   formato novo; receitas adicionadas às tabelas já conhecidas são recolhidas
   automaticamente na próxima geração.
3. Declare a origem com `id`, `label`, `accent` e `category`. Assim, a mesma
   receita recebe imediatamente selo, cor e filtro, inclusive quando usa uma
   estação pertencente ao UtilityCraft.
4. Execute `npm run generate:utilitycraft-machine-recipes`,
   `npm run validate:machine-recipes` e `npm run build` dentro de `website`.

O catálogo publicado é um artefato gerado: não se deve copiar uma receita nova
para as páginas MDX antigas. Isso mantém a busca e os detalhes da máquina no
mesmo conjunto de dados que o add-on executa.

## Critérios de aceite

- Uma receita adicional do Crusher registrada por Ascendant exibe o selo e a
  cor de Ascendant no wiki do UtilityCraft.
- Receitas de Heavy Machinery aparecem com sua própria proveniência, inclusive
  nas máquinas base que elas ampliam.
- Catálogos mostram e filtram `Base`, `Ascendant Technology` e `Heavy
  Machinery`.
- O build gera os manifests e a busca local sem depender de um índice Algolia
  externo desatualizado.
