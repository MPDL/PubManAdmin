import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Grant } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class GrantsService {
    constructor(private http: Http) {
    }

    grantsUrl: string = props.auth_base_url + '/usergrants';

    grants: Grant[];
    grant: Grant;

    listAllGrants(token: string): Observable<Grant[]> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: this.grantsUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.grants = response.json();
                return this.grants;
            });
    }

    getGrant(id: string, token: string): Observable<Grant> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let userUrl = this.grantsUrl + '/' + id;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: userUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.grant = response.json();
                return this.grant;
            });
    }

    postGrant(grant: Grant, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        console.log('role as string: ' + JSON.stringify(grant.role));
        // let body = '{"role": "' + JSON.stringify(grant.role) + '", "targetType": "' + grant.targetType + '", "targetId": "' + grant.targetId + '"}';
        let body = JSON.stringify(grant);
        console.log('body to send: ' + body);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Post,
            url: this.grantsUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            });
    }

    getExistingOrCreate(role: string, context: string, token: string): Observable<Grant> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let url = this.grantsUrl + '/exists?role=' + role + '&ctx=' + context;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: url
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.grant = response.json();
                return this.grant;
            });
    }

    delete(grant: Grant, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let rolesUrl = this.grantsUrl + '/' + grant.id;

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Delete,
            url: rolesUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            });
    }
}