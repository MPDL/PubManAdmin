export const environment = {
  production: true,
  baseUrl: 'https://' + window.location.hostname,
  proxyUrl: '',
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
  icon: './assets/rifs.png',
};
