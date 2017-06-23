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


  listFilteredItems(token: string, query: string): Observable<any[]> {
    let headers = new Headers();
    if (token != null) {
      headers.set("Authorization", token);
    }
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: this.items_rest_url + query
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let items = response.json();
        return items;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting filtered list 4 ' + query));
  }

}
