import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import * as bodyBuilder from 'bodybuilder';

import { props } from '../../base/common/admintool.properties';
import { PubmanRestService } from '../../base/services/pubman-rest.service';

@Injectable()
export class SearchService extends PubmanRestService {

  constructor(http: Http) {
    super(http);
   }

  buildQueryOnly(request): any {
    let must, must_not, filter, should;
    request.searchTerms.forEach(element => {
      let field = element.field;
      let value: string = element.searchTerm;
      switch (element.type) {
        case "must":
          if (must) {
            must.push({ match: { [field]: value } });
          } else {
            must = [{ match: { [field]: value } }];
          }
          break;
        case "must_not":
          if (must_not) {
            must_not.push({ term: { [field]: value } });
          } else {
            must_not = [{ term: { [field]: value } }];
          }
          break;
        case "filter":
          if (filter) {
            filter.push({ term: { [field]: value } });
          } else {
            filter = [{ term: { [field]: value } }];
          }
          break;
        case "should":
          if (should) {
            should.push({ term: { [field]: value } });
          } else {
            should = [{ term: { [field]: value } }];
          }
          break;
        default:
      }
    });
    const body = { bool: { must, must_not, filter, should } };
    return body;
  }

  buildQuery(request, limit, offset, sortfield, ascdesc) {
    let query = bodyBuilder();

    request.searchTerms.forEach(element => {
      let field = element.field;
      let value: string = element.searchTerm;
      switch (element.type) {
        case "must":
          query = query.query("match", field, value);
          break;
        case "must_not":
          query = query.notFilter("term", field, value);
          break;
        case "filter":
          query = query.filter("term", field, value);
          break;
        case "should":
          query = query.orFilter("term", field, value);
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
