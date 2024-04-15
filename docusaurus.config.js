import {themes as prismThemes} from 'prism-react-renderer';

const config = {
  title: 'SpotChecks',
  tagline: 'SpotChecks are great when you want to embed your survey on websites and mobile apps.',
  favicon: 'https://static.surveysparrow.com/application/images/favicon-new.ico',
  url: 'https://surveysparrow.com/',
  baseUrl: '/',
  organizationName: 'SurveySparrow',
  projectName: 'SpotChecks',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
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
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    ({
      colorMode: {
        disableSwitch: true
      },
      image: 'https://supportsparrow.zendesk.com/flow_composer/assets/bot-avatar/01HQNF6KNQK04HQBFPCX56R7GP',
      navbar: {
        title: 'SpotChecks',
        logo: {
          alt: 'SurveySparrow',
          src: 'https://supportsparrow.zendesk.com/flow_composer/assets/bot-avatar/01HQNF6KNQK04HQBFPCX56R7GP',
        },
        items: [
          {
            to: '/docs/Web',
            position: 'left',
            label: 'Web',
          },
          {
            to: '/docs/Android',
            position: 'left',
            label: 'Mobile',
          },
          {
            href: 'https://surveysparrow.com',
            label: 'SurveySparrow',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        copyright: `Copyright © ${new Date().getFullYear()} SurveySparrrow.`,
      },
      prism: {
        theme: prismThemes.vsLight
      }
    }),
};

export default config;
