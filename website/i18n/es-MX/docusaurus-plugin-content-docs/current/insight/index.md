---
title: Dorios’ Insight
slug: /addons/insight
description: Cómo usar el libro de configuración, ajustar el HUD y consultar información de bloques y entidades.
---

Dorios’ Insight muestra información del bloque o la entidad que estás mirando. El HUD también puede mostrar la durabilidad del equipo y estadísticas adicionales del jugador. Esta guía corresponde a la versión **1.2.2**.

## Abrir la configuración {#settings}

<img src="/img/wiki/insight/insight_book.png" alt="Libro de configuración de Dorios’ Insight" width="64" height="64" />

El complemento te entrega el libro de configuración **Dorios' Insight Settings** la primera vez que entras en el mundo. Usa el libro o ejecuta `/utilitycraft:insightmenu` para abrir tus opciones personales. Si necesitas otro libro, combina un **pico de madera** y un **ojo de araña** en cualquier posición de la mesa de trabajo.

| Menú del juego | Qué puedes ajustar |
| --- | --- |
| **Main Settings** | Activa el panel de objetivos, cambia el intervalo de actualización de 1 a 40 ticks y el alcance de 1 a 32 bloques, y muestra la durabilidad de la mano principal, la secundaria y la armadura. Los diseños móviles del panel y de la durabilidad son independientes. |
| **HUD Features** | Barras adicionales de armadura y saturación, barra de acción secundaria, contenido de contenedores, estado de domesticación y objetos para domesticar o alimentar. |
| **Block Settings** | Imagen del bloque, herramienta y nivel recomendados, coordenadas, identificador, etiquetas y estados. Las máquinas compatibles también pueden mostrar energía, fluidos, gas o nivel de sobreaceleración. |
| **Entity Settings** | Imagen de la entidad, salud, armadura, oxígeno, efectos activos y detalles técnicos opcionales, como identificador, familias, etiquetas y propiedades. |
| **Style Settings** | Apariencia del panel, tamaño de la letra y formato de las estadísticas. |

## Mejorar la legibilidad del panel {#hud}

En el teléfono, usa **WAILA Mobile Layout** para ajustar el panel de objetivos y **Durability Mobile Layout** para ajustar los indicadores del equipo. En **Block Settings**, activa **Preferred Tool** y **Tool Tier** para consultar cómo minar un bloque. En **HUD Features**, activa **Container Contents** para ver qué hay dentro de los contenedores compatibles.

[Implementación del menú](https://github.com/DoriosStudios/Dorios-Insight/blob/751a500911817370d445a12a66e29eeb045d07cb/BP/scripts/core/menu.js) · [Receta del libro de configuración](https://github.com/DoriosStudios/Dorios-Insight/blob/751a500911817370d445a12a66e29eeb045d07cb/BP/recipes/insight_settings.json)
