import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';

@Injectable()
export class FedoraRestService {

  fcrepo_rest_url = "http://localhost:8888/fcrepo/rest";

  constructor(protected http: Http) { }

  getResource(): Observable<any> {
    let headers = new Headers();
    headers.append("Accept", "application/ld+json");
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: this.fcrepo_rest_url +"/objects/raven"
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let data = response.json();
        return data;
      })
      .catch((error: any) => Observable.throw(error));
  }

}