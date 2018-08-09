export const environment = {
  production: true,
  base_url: 'https://' + window.location.hostname,
  elastic_url: '/es',
  rest_users: '/rest/users',
  rest_ous: '/rest/ous',
  rest_contexts: '/rest/contexts',
  rest_items: '/rest/items',
  item_index: {
    name: 'items',
    type: 'item'
  },
  user_index: {
    name: 'users',
    type: 'user'
  },
  ou_index: {
    name: 'ous',
    type: 'organization'
  },
  ctx_index: {
    name: 'contexts',
    type: 'context'
  }
};
