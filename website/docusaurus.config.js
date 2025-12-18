// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Dorios Studios',
  tagline: 'Free Addons for the Minecraft Community',
  favicon: 'img/dorios_logo.png',

  future: {
    v4: true,
  },

  url: 'https://doriosstudios.com',
  baseUrl: '/',

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'algolia-site-verification',
        content: 'CA75657DD7DCB62C',
      },
    },
  ],

  organizationName: 'RealMilo504',
  projectName: 'Dorios-Site',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/RealMilo504/Dorios-Site/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          include: ['**/*.md', '**/*.mdx'],
          editUrl: 'https://github.com/RealMilo504/Dorios-Site/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-LZN8PGKZFW',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/dorios-social-card.jpg',

   metadata: [
        {
          name: 'description',
          content:
            'Dorios Studios — creators of free Minecraft Bedrock addons like UtilityCraft and more. High-quality free Minecraft Bedrock addons for the community.',
        },

        // --- OPEN GRAPH ---
        { property: 'og:title', content: 'Dorios Studios - Free Minecraft Bedrock Addons' },
        {
          property: 'og:description',
          content:
            'Dorios Studios creates completely free Minecraft Bedrock addons, including UtilityCraft and other community projects.',
        },

        // Your REAL logo
        { property: 'og:image', content: 'https://doriosstudios.com/img/dorios_logo_blackbg.png' },
        { property: 'og:image:width', content: '512' },
        { property: 'og:image:height', content: '512' },
        { property: 'og:image:type', content: 'image/png' },

        { property: 'og:url', content: 'https://doriosstudios.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Dorios Studios' },
        { property: 'og:locale', content: 'en_US' },

        // --- TWITTER CARDS ---
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Dorios Studios - Free Minecraft Bedrock Addons' },
        {
          name: 'twitter:description',
          content:
            'High-quality Minecraft Bedrock addons made for the community — completely free.',
        },
        { name: 'twitter:image', content: 'https://doriosstudios.com/img/dorios_logo_blackbg.png' }
      ],


      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },

      algolia: {
        appId: 'RKEKEVN76J',
        apiKey: '10014418accac562deb948ebb31798a8',
        indexName: 'Dorios Studios Documentation',

        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
      },

      navbar: {
        title: 'Dorios Studios',
        logo: {
          alt: 'Dorios Studios Logo',
          src: 'img/dorios_logo.png',
        },
        items: [
          { type: 'search', position: 'right' },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Wikis',
          },
          { to: '/about', label: 'About Us', position: 'left' }
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                html: `
                  <a href="https://discord.gg/x36H3ZtmK5" target="_blank" rel="noopener">
                    <img src="https://cdn.simpleicons.org/discord/ffffff" alt="Discord" width="24" height="24" style="margin: 0 8px; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" />
                  </a>
                  <a href="https://www.youtube.com/@doriosstudios" target="_blank" rel="noopener">
                    <img src="https://cdn.simpleicons.org/youtube/ffffff" alt="YouTube" width="24" height="24" style="margin: 0 8px; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" />
                  </a>
                  <a href="https://www.curseforge.com/members/doriosstudios/projects" target="_blank" rel="noopener">
                    <img src="https://cdn.simpleicons.org/curseforge/ffffff" alt="CurseForge" width="24" height="24" style="margin: 0 8px; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" />
                  </a>
                  <a href="https://www.patreon.com/DoriosStudios" target="_blank" rel="noopener">
                    <img src="https://cdn.simpleicons.org/patreon/ffffff" alt="Patreon" width="24" height="24" style="opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" />
                  </a>
                  <a href="https://github.com/DoriosStudios" target="_blank" rel="noopener">
                    <img src="https://cdn.simpleicons.org/github/ffffff" alt="GitHub" width="24" height="24" style="margin: 0 8px; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" />
                  </a>
                `,
              },
            ],
          },
        ],
        logo: {
          alt: 'Dorios Studios Logo',
          src: '/img/dorios_logo.png',
          href: 'https://doriosstudios.com',
          width: 40,
          height: 40,
        },
        copyright: `
        © ${new Date().getFullYear()} Dorios Studios — Creating worlds, one addon at a time.<br/>
        Website built by <strong>Milo504</strong> with ❤️.
        `,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
