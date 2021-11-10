export const environment = {
  production: false,
  baseUrl: 'https://qa.inge.mpdl.mpg.de',
  elasticUrl: '/es',
  restUsers: '/rest/users',
  restOus: '/rest/ous',
  restContexts: '/rest/contexts',
  restItems: '/rest/items',
  itemIndex: {
    name: 'items',
    type: 'item',
  },
  userIndex: {
    name: 'users',
    type: 'user',
  },
  ouIndex: {
    name: 'ous',
    type: 'organization',
  },
  ctxIndex: {
    name: 'contexts',
    type: 'context',
  },
};
