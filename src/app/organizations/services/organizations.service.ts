import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { PubmanRestService } from '../../base/services/pubman-rest.service';

@Injectable()
export class OrganizationsService extends PubmanRestService {

    ous_rest_url = props.pubman_rest_url + '/ous';
    ou;
    ous: any[];

    constructor(http: Http) {
        super(http);
    }

    listChildren4Ou(id: string, token: string): Observable<any[]> {
        let options = new RequestOptions({
            headers: this.getHeaders(token, false),
            method: RequestMethod.Get,
            url: this.ous_rest_url + '/' + id + '/children'
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ous = response.json();
                return this.ous;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting children 4 ' + id));
    }

    openOu(ou: any, token: string): Observable<number> {
        let ouUrl = this.ous_rest_url + '/' + ou.reference.objectId + '/open';
        let body = JSON.stringify(ou.lastModificationDate);
        let options = new RequestOptions({
            headers: this.getHeaders(token, true),
            method: RequestMethod.Put,
            url: ouUrl,
            body: body
        });
        return this.getHttpStatus(options);
    }

    closeOu(ou: any, token: string): Observable<number> {
        let ouUrl = this.ous_rest_url + '/' + ou.reference.objectId + '/close';
        let body = JSON.stringify(ou.lastModificationDate);
        let options = new RequestOptions({
            headers: this.getHeaders(token, true),
            method: RequestMethod.Put,
            url: ouUrl,
            body: body
        });
        return this.getHttpStatus(options);
    }

}
