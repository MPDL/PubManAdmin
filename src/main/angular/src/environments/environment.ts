export const environment = {
  production: false,
  base_url: 'https://dev.inge.mpdl.mpg.de',
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
