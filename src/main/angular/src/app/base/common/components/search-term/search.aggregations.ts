export const ctxAggs = {
  select: {},
  creationDate: {size: 0, aggs: {name1: {date_histogram: {field: 'creationDate', interval: 'year', min_doc_count: 1}}}},
  state: {size: 0, aggs: {name1: {terms: {field: 'state', size: 100, order: {_count: 'desc'}}}}},
};

export const itemAggs = {
  select: {},
  creationDate: {size: 0, aggs: {name1: {date_histogram: {field: 'creationDate', interval: 'year', min_doc_count: 1}}}},
  genre: {size: 0, aggs: {name1: {terms: {field: 'metadata.genre', size: 100, order: {_count: 'desc'}}}}},
  publisher: {size: 0, aggs: {name1: {nested: {path: 'metadata.sources'}, aggs: {name2: {terms: {field: 'metadata.sources.publishingInfo.publisher.keyword', size: 100}}}}}},
};

export const ouAggs = {
  select: {},
  creationDate: {size: 0, aggs: {name1: {date_histogram: {field: 'creationDate', interval: 'year', min_doc_count: 1}}}},
  state: {size: 0, aggs: {name1: {terms: {field: 'publicStatus.keyword', size: 100, order: {_count: 'desc'}}}}},
};

export const userAggs = {
  select: {},
  active: {size: 0, aggs: {name1: {terms: {field: 'active', size: 100, order: {_count: 'desc'}}}}},
  creationDate: {size: 0, aggs: {name1: {date_histogram: {field: 'creationDate', interval: 'year', min_doc_count: 1}}}},
  organization: {size: 0, aggs: {name1: {terms: {field: 'affiliation.name.keyword', size: 100, order: {_count: 'desc'}}}}},
};
