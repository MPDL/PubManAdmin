export const environment = {
  production: true,
  baseUrl: 'https://' + window.location.hostname,
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
