export const environment = {
  production: false,
  baseUrl: 'http://localhost:4200',
  proxyUrl: 'https://qa.pure.mpdl.mpg.de',
  restCtxs: '/rest/contexts',
  restItems: '/rest/items',
  restLogin: '/rest/login',
  restLogout: '/rest/logout',
  restOus: '/rest/ous',
  restUsers: '/rest/users',
  appHome: 'https://github.com/MPDL/PubManAdmin#readme',
  appDisclaimer: 'https://colab.mpdl.mpg.de/mediawiki/MPG.PuRe_Impressum',
  appPrivacy: 'https://colab.mpdl.mpg.de/mediawiki/MPG.PuRe_Datenschutzhinweis',
  appHelp: 'https://colab.mpdl.mpg.de/mediawiki/MPG.PuRe_Help',
  ctxIndex: {
    name: 'contexts',
    type: 'context',
  },
  itemIndex: {
    name: 'items',
    type: 'item',
  },
  ouIndex: {
    name: 'ous',
    type: 'organization',
  },
  userIndex: {
    name: 'users',
    type: 'user',
  },
};
