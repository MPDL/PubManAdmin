import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import * as bodyBuilder from 'bodybuilder';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class SearchService {

  constructor(private http: Http,
    private message: MessagesService) { }


  listFilteredHits(token: string, query: string, limit, url): Observable<any> {
    let headers = new Headers();
    if (token != null) {
      headers.set("Authorization", token);
    }
    const perPage = 25;
    let offset = (limit - 1) * perPage;
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: url + query + '&limit=' + perPage + '&offset=' + offset
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let result = { list: [], records: "" };
        let data = response.json();
        let hits = [];
        let records = data.numberOfRecords;
        data.records.forEach(element => {
          hits.push(element.data)
        });
        result.list = hits;
        result.records = records;
        return result;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting filtered list 4 ' + query));
  }

  listHitsByQuery(token: string, body, url): Observable<any> {
    let headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (token != null) {
      headers.append("Authorization", token);
    }
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Post,
      url: url + '/search',
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let result = { list: [], records: "" };
        let data = response.json();
        let hits = [];
        let records = data.numberOfRecords;
        data.records.forEach(element => {
          hits.push(element.data)
        });
        result.list = hits;
        result.records = records;
        return result;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting list 4 ' + JSON.stringify(body)));
  }

  /* 
  prepareBody(request): any {
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
    // confirm("BODY: " + JSON.stringify(body));
    return body;
  }
  */

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
