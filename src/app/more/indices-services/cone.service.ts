import { Injectable } from '@angular/core';
import { Http, Jsonp, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';
@Injectable()
export class ConeService {

    answer;
    results: any[] = [];

    constructor(private http: Http,
        private messages: MessagesService) {
    }

    getAllJournals(): Observable<any[]> {

        let journalUrl: string = "http://b253.demo/blazegraph/namespace/inge/sparql";
        let headers = new Headers();
        let params = new URLSearchParams();
        params.set('query', 'select * {graph $g {$s $p $o}}');
        headers.set('Accept', 'application/sparql-results+json, application/json');
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: journalUrl,
            params: params
        });
        return this.http.request(new Request(options))
            .map((response) => {
                response.json().results.bindings.forEach(resource => {
                    this.results.push(resource);
                });
                
                return this.results;
            });
    }

    
    private handleError(error: any) {
    console.error(error);
    return Observable.throw(error.json().error || ' error');
  }

}
