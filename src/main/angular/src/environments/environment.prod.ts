export const environment = {
  production: true,
  baseUrl: 'https://' + window.location.hostname,
  elasticUrl: '/es',
  restCtxs: '/rest/contexts',
  restItems: '/rest/items',
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
};
