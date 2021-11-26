export const environment = {
  production: true,
  baseUrl: 'https://' + window.location.hostname,
  elasticUrl: '/es',
  restUsers: '/rest/users',
  restOus: '/rest/ous',
  restCtxs: '/rest/contexts',
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
};
