export const environment = {
  production: false,
  baseUrl: 'https://dev.inge.mpdl.mpg.de',
  elasticUrl: '/es',
  restUsers: '/rest/users',
  restOus: '/rest/ous',
  restCtxs: '/rest/contexts',
  restItems: '/rest/items',
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
