import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class SearchService {

  ous_rest_url = props.pubman_rest_url + '/ous';
  ctxs_rest_url = props.pubman_rest_url + '/contexts';
  usrs_rest_url = props.pubman_rest_url + '/users';
  items_rest_url = props.pubman_rest_url + '/items';

  constructor(private http: Http,
    private message: MessagesService) { }


  listFilteredItems(token: string, query: string, limit, url): Observable<any> {
    let headers = new Headers();
    if (token != null) {
      headers.set("Authorization", token);
    }
    const perPage = 25;
    let offset = (limit -1) * perPage;
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: url + query + '&limit=' + perPage + '&offset=' + offset
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let result = {list: [], records: ""};
        let data = response.json();
        let items = [];
        let records = data.numberOfRecords;
        data.records.forEach(element => {
          items.push(element.data)
        });
        result.list = items;
        result.records = records;
        return result;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting filtered list 4 ' + query));
  }

  listItemsByQuery(token: string, body, limit): Observable<any> {
    let headers = new Headers();
    headers.set("Content-Type", "application/json");
    // headers.append("Accept", "application/json");
    if (token != null) {
      headers.append("Authorization", token);
    }
    const perPage = 25;
    let offset = (limit -1) * perPage;
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Post,
      url: this.items_rest_url + '/search?limit=' + perPage + '&offset=' + offset,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let result = {list: [], records: ""};
        let data = response.json();
        let items = [];
        let records = data.numberOfRecords;
        data.records.forEach(element => {
          items.push(element.data)
        });
        result.list = items;
        result.records = records;
        return result;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting list 4 ' + JSON.stringify(body)));
  }

  listFilteredUsers(token: string, query: string, limit, url): Observable<any> {
    let headers = new Headers();
    if (token != null) {
      headers.set("Authorization", token);
    }
    const perPage = 25;
    let offset = (limit -1) * perPage;
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: url + query + '&limit=' + perPage + '&offset=' + offset
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let data = response.json();
        let items = [];
        data.forEach(element => {
          items.push(element)
        });
        return items;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting filtered list 4 ' + query));
  }

}
