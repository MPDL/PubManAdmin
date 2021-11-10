import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import * as bodyBuilder from 'bodybuilder';
import {PubmanRestService} from '../../services/pubman-rest.service';
import {ConnectionService} from '../../services/connection.service';

@Injectable()
export class SearchService extends PubmanRestService {
  constructor(
    protected httpClient: HttpClient,
    protected connectionService: ConnectionService
  ) {
    super(httpClient, connectionService);
  }

  buildQueryOnly(request): any {
    let must; let mustNot; let filter; let should;
    request.searchTerms.forEach((element) => {
      const field = element.field;
      const value: string = element.searchTerm;
      switch (element.type) {
      case 'must':
        if (must) {
          must.push({match: {[field]: value}});
        } else {
          must = [{match: {[field]: value}}];
        }
        break;
      case 'must_not':
        if (mustNot) {
          mustNot.push({term: {[field]: value}});
        } else {
          mustNot = [{term: {[field]: value}}];
        }
        break;
      case 'filter':
        if (filter) {
          filter.push({term: {[field]: value}});
        } else {
          filter = [{term: {[field]: value}}];
        }
        break;
      case 'should':
        if (should) {
          should.push({term: {[field]: value}});
        } else {
          should = [{term: {[field]: value}}];
        }
        break;
      default:
      }
    });
    const body = {bool: {must, mustNot, filter, should}};
    return body;
  }

  buildQuery(request, limit, offset, sortfield, ascdesc) {
    let query = bodyBuilder();

    request.searchTerms.forEach((element) => {
      const field = element.field;
      const value: string = element.searchTerm;
      switch (element.type) {
      case 'must':
        query = query.query('match', field, value);
        break;
      case 'must_not':
        query = query.notFilter('term', field, value);
        break;
      case 'filter':
        query = query.filter('term', field, value);
        break;
      case 'should':
        query = query.orFilter('term', field, value);
        break;
      default:
      }
    });
    query = query.size(limit)
      .from(offset)
      .sort(sortfield, ascdesc);
    query = query.build();
    return query;
  }
}
