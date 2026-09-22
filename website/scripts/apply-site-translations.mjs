import fs from 'node:fs';
import path from 'node:path';

const siteRoot = path.resolve(import.meta.dirname, '..');

const translations = {
  'pt-BR': {
    Projects: 'Projetos', Documentation: 'Documentação', Studio: 'Estúdio', Support: 'Suporte', Community: 'Comunidade',
    Blog: 'Blog', 'Recent posts': 'Publicações recentes', Guide: 'Guia', Blocks: 'Blocos', Basic: 'Básico',
    Machinery: 'Maquinário', Generators: 'Geradores', Machines: 'Máquinas', 'Mob Grinding': 'Processamento de criaturas',
    Transport: 'Transporte', Upgrades: 'Melhorias', Equipment: 'Equipamento', Armor: 'Armaduras', Tools: 'Ferramentas',
    Resources: 'Recursos', Fluids: 'Fluidos', Ores: 'Minérios', 'UtilityCraft Extensions': 'Extensões do UtilityCraft',
    'Getting Started': 'Primeiros passos', 'Your First Machine': 'Sua primeira máquina', 'Machine UI': 'Interface de máquina',
    'Machine IO': 'Entrada e saída de máquina', 'Machine Upgrades': 'Melhorias de máquina',
    'UtilityCraft Registries': 'Registros do UtilityCraft', 'Reusable Components': 'Componentes reutilizáveis',
    'Advanced Examples': 'Exemplos avançados', 'Machine UI Core': 'Núcleo da interface de máquina',
    'API reference': 'Referência da API', Next: 'Atual',
  },
  'es-MX': {
    Projects: 'Proyectos', Documentation: 'Documentación', Studio: 'Estudio', Support: 'Soporte', Community: 'Comunidad',
    Blog: 'Blog', 'Recent posts': 'Publicaciones recientes', Guide: 'Guía', Blocks: 'Bloques', Basic: 'Básico',
    Machinery: 'Maquinaria', Generators: 'Generadores', Machines: 'Máquinas', 'Mob Grinding': 'Procesamiento de criaturas',
    Transport: 'Transporte', Upgrades: 'Mejoras', Equipment: 'Equipo', Armor: 'Armaduras', Tools: 'Herramientas',
    Resources: 'Recursos', Fluids: 'Fluidos', Ores: 'Minerales', 'UtilityCraft Extensions': 'Extensiones de UtilityCraft',
    'Getting Started': 'Primeros pasos', 'Your First Machine': 'Tu primera máquina', 'Machine UI': 'Interfaz de máquina',
    'Machine IO': 'Entrada y salida de máquina', 'Machine Upgrades': 'Mejoras de máquina',
    'UtilityCraft Registries': 'Registros de UtilityCraft', 'Reusable Components': 'Componentes reutilizables',
    'Advanced Examples': 'Ejemplos avanzados', 'Machine UI Core': 'Núcleo de la interfaz de máquina',
    'API reference': 'Referencia de la API', Next: 'Actual',
  },
};

const files = [
  ['docusaurus-theme-classic', 'navbar.json'],
  ['docusaurus-theme-classic', 'footer.json'],
  ['docusaurus-plugin-content-blog', 'options.json'],
  ['docusaurus-plugin-content-docs', 'current.json'],
  ['docusaurus-plugin-content-docs-documentation', 'current.json'],
];

function translatedMessage(locale, value) {
  if (value.includes('©') && value.includes('Website built by')) {
    return locale === 'pt-BR'
      ? value.replace('Creating worlds, one addon at a time.', 'Criando mundos, um addon de cada vez.').replace('Website built by', 'Site desenvolvido por')
      : value.replace('Creating worlds, one addon at a time.', 'Creando mundos, un addon a la vez.').replace('Website built by', 'Sitio desarrollado por');
  }
  return translations[locale][value] ?? value;
}

for (const locale of Object.keys(translations)) {
  for (const segments of files) {
    const file = path.join(siteRoot, 'i18n', locale, ...segments);
    if (!fs.existsSync(file)) continue;
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const entry of Object.values(content)) {
      if (entry?.message) entry.message = translatedMessage(locale, entry.message);
    }
    fs.writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);
  }
}

console.log('[site-translations] Localized Docusaurus navigation, footer, blog, and sidebar labels.');
