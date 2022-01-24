export const ctxs4autoSelectByName = {
  'size': 25,
  'query': {
    'bool': {
      'filter': {
        'terms': {'responsibleAffiliations.objectId': ['terms']},
      },
      'must': {
        'term': {'name': 'term'},
      },
    },
  },
  'sort': [
    {'name.keyword': {'order': 'asc'}},
  ],
};

export const localAdminCtxs = {
  'size': 50,
  'query': {
    'bool': {
      'filter': {
        'terms': {'responsibleAffiliations.objectId': ['terms']},
      },
    },
  },
  'sort': [
    {'name.keyword': {'order': 'asc'}},
  ],
};

export const localAdminOus = {
  'size': 25,
  'query': {
    'bool': {
      'filter': {
        'terms': {'objectId': ['terms']},
      },
    },
  },
  'sort': [
    {'metadata.name.keyword': {'order': 'asc'}},
  ],
};

export const mpgOus4auto = {
  'size': 25,
  'query': {
    'bool': {
      'filter': {
        'terms': {'parentAffiliation.objectId': ['ou_persistent13', 'ou_persistent22']},
      },
      'must': {
        'term': {'metadata.name.auto': 'term'},
      },
    },
  },
  'sort': [
    {'metadata.name.keyword': {'order': 'asc'}},
  ],
};

export const ous4autoSelect = {
  'size': 25,
  'query': {
    'bool': {
      'filter': {
        'terms': {'objectId': ['terms']},
      },
      'must': {
        'term': {'metadata.name.auto': 'term'},
      },
    },
  },
  'sort': [
    {'metadata.name.keyword': {'order': 'asc'}},
  ],
};

export const users4autoSelectByLogin = {
  'size': 25,
  'query': {
    'bool': {
      'filter': {
        'terms': {'affiliation.objectId': ['terms']},
      },
      'must': {
        'term': {'loginname.auto': 'term'},
      },
    },
  },
  'sort': [
    {'name.keyword': {'order': 'asc'}},
  ],
};

export const users4autoSelectByName = {
  'size': 25,
  'query': {
    'bool': {
      'filter': {
        'terms': {'affiliation.objectId': ['terms']},
      },
      'must': {
        'term': {'name.auto': 'term'},
      },
    },
  },
  'sort': [
    {'name.keyword': {'order': 'asc'}},
  ],
};
