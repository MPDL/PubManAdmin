import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
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

    constructor(private http: HttpClient,
        private messages: MessagesService) {
    }

    getAllJournals(): Observable<any[]> {

        let journalUrl: string = "http://b253.demo/blazegraph/namespace/inge/sparql";
        let headers = new HttpHeaders().set('Accept', 'application/sparql-results+json, application/json');
        let params = new HttpParams().set('query', 'select * {graph $g {$s $p $o}}');
        return this.http.request('GET', journalUrl, {
            headers: headers,
            params: params
        })
            .map((response: any) => {
                response.results.bindings.forEach(resource => {
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
