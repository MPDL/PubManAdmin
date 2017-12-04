import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';

@Injectable()
export class FedoraRestService {

  fcrepo_rest_url = "http://localhost:8888/fcrepo/rest";

  constructor(protected http: HttpClient) { }

  getResource(): Observable<any> {
    let headers = new HttpHeaders().set("Accept", "application/ld+json");
    let url = this.fcrepo_rest_url +"/objects/raven";
    return this.http.request('GET', url, {
      headers: headers
    })
      .map((response: Response) => {
        let data = response.json();
        return data;
      })
      .catch((error: any) => Observable.throw(error));
  }

}