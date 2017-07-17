import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class FcrepoService {

    url = "http://localhost/rest/";

    constructor(private http: Http,
        private message: MessagesService) { }

    getResource(path) {
        let headers = new Headers();
        headers.set("Accept", "application/ld+json");
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: this.url + path
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                return response.json();
            })
            .catch(error => Observable.throw(error));
    }
}