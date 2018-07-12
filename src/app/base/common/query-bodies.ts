export const mpgOus4auto = {
    'size': 25,
    'query': {
        'bool': {
            'filter': {
                'term': {
                    'parentAffiliation.objectId': 'ou_persistent13'
                }
            },
            'must': {
                'term': {
                    'metadata.name.auto': 'term'
                }
            }
        }
    }
};
export const allOpenedMPIs = {
    'size': 300,
    'query': {
        'bool': {
            'filter': {
                'term': {
                    'parentAffiliation.objectId': 'ou_persistent13'
                }
            },
            'must': {
                'term': {
                    'publicStatus.keyword': 'OPENED'
                }
            }
        }
    }
};


