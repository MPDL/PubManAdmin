export const environment = {
  production: false,
  baseUrl: 'http://localhost:4200',
  proxyUrl: 'http://localhost:4200',
  restCtxs: '/rest/contexts',
  restItems: '/rest/items',
  restLogin: '/rest/login',
  restLogout: '/rest/logout',
  restOus: '/rest/ous',
  restUsers: '/rest/users',
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
  icon: './assets/gfz.svg',
};
