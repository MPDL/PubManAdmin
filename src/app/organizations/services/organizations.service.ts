
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { map, catchError } from "rxjs/operators";
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';




import { props } from '../../base/common/admintool.properties';
import { PubmanRestService } from '../../base/services/pubman-rest.service';

@Injectable()
export class OrganizationsService extends PubmanRestService {

    ous_rest_url = props.pubman_rest_url + '/ous';
    ou;
    ous: any;

    constructor(protected httpc: HttpClient) {
        super(httpc);
    }

    listChildren4Ou(id: string, token: string): Observable<any[]> {
        let headers = this.addHeaders(token, false);
        let url =  this.ous_rest_url + '/' + id + '/children';
        return this.httpc.request('GET', url, {
            headers: headers
        }).pipe(
            map((response: HttpResponse<any>) => {
                this.ous = response;
                return this.ous;
            }),
            catchError((error) => {
                return observableThrowError(JSON.stringify(error) || 'Error getting children 4 ' + id);
            })
        )
    }

    openOu(ou: any, token: string): Observable<number> {
        let ouUrl = this.ous_rest_url + '/' + ou.objectId + '/open';
        let body = ou.lastModificationDate;
        let headers = this.addHeaders(token, true);
        return this.getHttpStatus('PUT', ouUrl, headers, body);
    }

    closeOu(ou: any, token: string): Observable<number> {
        let ouUrl = this.ous_rest_url + '/' + ou.objectId + '/close';
        let body = ou.lastModificationDate;
        let headers = this.addHeaders(token, true);
        return this.getHttpStatus('PUT', ouUrl, headers, body);
    }

}
