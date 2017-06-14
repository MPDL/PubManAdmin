import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';


@Injectable()
export class OrganizationsService {

    ous_rest_url = props.pubman_rest_url + '/ous';
    ou;
    ous: any[];

    constructor(private http: Http,
        private message: MessagesService) { }

    listAllOus(token: string): Observable<any[]> {
        let headers = new Headers();
        // headers.set("Authorization", token);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: this.ous_rest_url
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ous = response.json();
                // sorting is done by the rest service ...
                /*
                this.ous.sort((a, b) => {
                  if (a.defaultMetadata.name < b.defaultMetadata.name) return -1;
                  else if (a.defaultMetadata.name > b.defaultMetadata.name) return 1;
                  else return 0;
                });
                */
                return this.ous;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error getting ou list'));
    }

    listFilteredOus(token: string, query: string): Observable<any[]> {
        // let query = '?q=parentAffiliations.objectId:ou_persistent13';
        let headers = new Headers();
        // headers.set("Authorization", token);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: this.ous_rest_url + query
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ous = response.json();
                // sorting is done by the rest service ...
                /*
                this.ous.sort((a, b) => {
                    if (a.defaultMetadata.name < b.defaultMetadata.name) return -1;
                    else if (a.defaultMetadata.name > b.defaultMetadata.name) return 1;
                    else return 0;
                });
                */
                return this.ous;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error getting ou list 4 ' + query));
    }

    listChildren4Ou(id: string, token: string): Observable<any[]> {
        let headers = new Headers();
        // headers.set("Authorization", token);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: this.ous_rest_url + '/' + id + '/children'
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ous = response.json();
                // sorting is done by the rest service ...
                /*
                this.ous.sort((a, b) => {
                    if (a.defaultMetadata.name < b.defaultMetadata.name) return -1;
                    else if (a.defaultMetadata.name > b.defaultMetadata.name) return 1;
                    else return 0;
                });
                */
                return this.ous;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error getting children 4 ' + id));
    }

    getOu(id, token): Observable<any> {

        let headers = new Headers();
        headers.set("Authorization", token);
        let ouUrl = this.ous_rest_url + '/' + id;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: ouUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ou = response.json();
                return this.ou;
            })
            .catch((error: any) => Observable.throw(error.json().message || "Error getting ou with id " + id));
    }

    postOu(ou: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let body = JSON.stringify(ou);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Post,
            url: this.ous_rest_url,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error creating ou'));
    }

    putOu(ou: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ouUrl = this.ous_rest_url + '/' + ou.reference.objectId;
        let body = JSON.stringify(ou);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put,
            url: ouUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error updating ou with id ' + ou.reference.objectId));
    }

    openOu(ou: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ouUrl = this.ous_rest_url + '/' + ou.reference.objectId + '/open';
        let body = JSON.stringify(ou.lastModificationDate);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put,
            url: ouUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error opening ou with id ' + ou.reference.objectId));
    }

    closeOu(ou: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ouUrl = this.ous_rest_url + '/' + ou.reference.objectId + '/close';
        let body = JSON.stringify(ou.lastModificationDate);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put,
            url: ouUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(error.json().message || 'Error closing ou with id ' + ou.reference.objectId));
    }

    delete(ou: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ouUrl = this.ous_rest_url + '/' + ou.reference.objectId;
        let body = JSON.stringify(ou.lastModificationDate);
        console.log("lmd " + body);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Delete,
            url: ouUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(error.json().message || "Error deleting ou with id " + ou.reference.objectId));
    }

}
