import { React } from 'https://deno.land/x/pagic@v1.1.1/mod.ts';

export default {
  theme: 'docs',
  srcDir: 'docs',
  root: '/docs/',
  plugins: ['sidebar', 'prev_next'],
  title: 'NiceUp',
  description: '一款针对自媒体从业者专门开发的微信团购小程序',
  head: <link rel="icon" type="image/png" href="/favicon.ico" />,
  nav: [
    {
      text: '安装',
      link: '/docs/install/environment_help.html',
    },
    {
      text: '用户手册',
      link: '/docs/guide/login.html',
    },
    {
      text: '演示',
      link: '/docs/screenshot/manage.html',
    },
    {
      text: '案例展示',
      link: '/docs/showcase.html',
    },
    // {
    //   text: '反馈',
    //   link: 'https://support.qq.com/products/297042',
    //   target: '_blank'
    // }
  ],
  sidebar: {
    '/guide/': [
      'guide/login.md',
      'guide/statistics.md',
      'guide/set_tag.md',
      'guide/add_product.md',
      'guide/set_kv.md',
      'guide/set_freight.md',
      'guide/set_notice.md',
      'guide/manage_psn.md',
      'guide/manage_order.md',
      'guide/manage_file.md',
      'guide/others.md',
    ],
    '/screenshot/': [
      'screenshot/manage.md',
      'screenshot/mini.md',
    ],
  },
  github: 'https://github.com/nasawz/niceup',
  tools: {
    backToTop: true,
  },
};
