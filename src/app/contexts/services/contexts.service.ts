import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service'; 

@Injectable()
export class ContextsService {

  context_url = props.pubman_rest_url + "/contexts"
  ctx;

  constructor(private http : Http,
      private message: MessagesService) { }

  getContext(id, token): Observable<any> {

        let headers = new Headers();
        headers.set("Authorization", token);
        let contextUrl = this.context_url + '/' + id;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: contextUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ctx = response.json();
                return this.ctx;
            });
    }    
  
    delete(id, token): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let contextUrl = this.context_url + '/' + id;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Delete,
            url: contextUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            });
    }
}

