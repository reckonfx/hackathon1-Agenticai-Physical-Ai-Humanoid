// @ts-check
// `@type` JSDoc annotations allow TypeScript to help checking the config.
// You can remove the `@ts-check` if you don't want TypeScript to check the config.

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics Textbook',
  tagline: 'Comprehensive Educational Resource on Physical AI and Humanoid Robotics',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://reckonfx.github.io', // Update this to your GitHub username
  // Set the /<base> pathname under which your site is served
  // For GitHub Pages, this should be your repo name
  baseUrl: '/hackathon1-Agenticai-Physical-Ai-Humanoid', // Update this to your repo name

  // GitHub pages deployment config.
  organizationName: 'reckonfx', // Update this to your GitHub organization/username
  projectName: 'hackathon1-Agenticai-Physical-Ai-Humanoid', // Update this to your repo name
  deploymentBranch: 'gh-pages', // Branch that GitHub Pages will deploy from

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'], // Adding Urdu for translation support
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/reckonfx/hackathon1-Agenticai-Physical-Ai-Humanoid/tree/main/',
        },
        blog: false, // Disable blog if not needed
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Physical AI Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },
          {
            href: 'https://github.com/reckonfx/hackathon1-Agenticai-Physical-Ai-Humanoid',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Modules',
            items: [
              {
                label: 'Introduction & Physical AI Foundations',
                to: '/docs/intro-physical-ai/what-is-physical-ai',
              },
              {
                label: 'ROS 2 Fundamentals',
                to: '/docs/ros2-fundamentals/ros2-architecture',
              },
              {
                label: 'Robot Simulation',
                to: '/docs/robot-simulation/gazebo-setup',
              },
              {
                label: 'NVIDIA Isaac Platform',
                to: '/docs/nvidia-isaac/isaac-sim-overview',
              },
              {
                label: 'Humanoid Robot Development',
                to: '/docs/humanoid-development/humanoid-kinematics',
              },
              {
                label: 'VLA Robotics',
                to: '/docs/vla-robotics/what-is-vla',
              },
              {
                label: 'Capstone Project',
                to: '/docs/capstone-project/requirements',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),

  plugins: [
    // Plugin to add the chatbot widget
    // Removed the chatbot docs plugin as it was causing startup issues
  ],
};

module.exports = config;