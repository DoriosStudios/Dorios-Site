---
title: Dorios’ Insight
slug: /addons/insight
description: Como usar o livro de configurações, ajustar o HUD e consultar informações de blocos e entidades.
---

Dorios’ Insight mostra informações sobre o bloco ou a entidade que você está olhando. O HUD também pode exibir a durabilidade dos equipamentos e estatísticas adicionais do jogador. Este guia cobre a versão **1.2.2**.

## Abrir as configurações {#settings}

<img src="/img/wiki/insight/insight_book.png" alt="Livro de configurações do Dorios’ Insight" width="64" height="64" />

O add-on entrega o livro de configurações **Dorios' Insight Settings** quando você entra no mundo pela primeira vez. Use o livro ou execute `/utilitycraft:insightmenu` para abrir suas opções pessoais. Se precisar de outro livro, combine uma **picareta de madeira** e um **olho de aranha** em qualquer posição na bancada.

| Menu no jogo | O que você pode ajustar |
| --- | --- |
| **Main Settings** | Ativação do painel de alvos, intervalo de atualização de 1 a 40 ticks, alcance de 1 a 32 blocos e durabilidade da mão principal, da segunda mão e da armadura. Os layouts móveis do painel e da durabilidade são independentes. |
| **HUD Features** | Barras extras de armadura e saturação, barra de ação secundária, conteúdo de contêineres, estado de domesticação e itens usados para domesticar ou alimentar. |
| **Block Settings** | Render do bloco, ferramenta e nível indicados, coordenadas, identificador, tags e estados. Máquinas compatíveis também podem mostrar energia, fluidos, gás ou nível de overclock. |
| **Entity Settings** | Render da entidade, vida, armadura, oxigênio, efeitos ativos e detalhes técnicos opcionais, como identificador, famílias, tags e propriedades. |
| **Style Settings** | Aparência do painel, escala da fonte e formato das estatísticas. |

## Deixar o painel mais legível {#hud}

No celular, ajuste o painel de alvos com **WAILA Mobile Layout** e os indicadores de equipamento com **Durability Mobile Layout**. Em **Block Settings**, ative **Preferred Tool** e **Tool Tier** para descobrir como minerar um bloco. Em **HUD Features**, ative **Container Contents** para ver uma prévia dos itens guardados nos contêineres compatíveis.

[Implementação do menu](https://github.com/DoriosStudios/Dorios-Insight/blob/751a500911817370d445a12a66e29eeb045d07cb/BP/scripts/core/menu.js) · [Receita do livro de configurações](https://github.com/DoriosStudios/Dorios-Insight/blob/751a500911817370d445a12a66e29eeb045d07cb/BP/recipes/insight_settings.json)
