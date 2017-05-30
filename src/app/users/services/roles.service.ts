import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Role } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';


@Injectable()
export class RolesService {
    constructor(private http: Http) {
    }

    rolesUrl: string = props.auth_base_url + '/userroles';

    roles: Role[];
    role: Role;

    listAllRoles(token: string): Observable<Role[]> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: this.rolesUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.roles = response.json();
                return this.roles;
            });
    }

    getRole(id: string, token: string): Observable<Role> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let rolesUrl = this.rolesUrl + '/' + id;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: rolesUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.role = response.json();
                return this.role;
            });
    }

    postRole(role: Role, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let body = '{"name": "' + role.name + '"}';

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Post,
            url: this.rolesUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            });
    }

    delete(role: Role, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        let rolesUrl = this.rolesUrl + '/' + role.id;

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