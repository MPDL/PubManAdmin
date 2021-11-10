
import {Observable, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';

import {environment} from 'environments/environment';
import {PubmanRestService} from '../../base/services/pubman-rest.service';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class OrganizationsService extends PubmanRestService {
  ousRestUrl = environment.restOus;
  ou;
  ous: any;

  constructor(
    protected httpc: HttpClient,
    protected connectionService: ConnectionService
  ) {
    super(httpc, connectionService);
  }

  getOuById(id: string, token: string): Observable<any> {
    const headers = this.addHeaders(token, false);
    const url = this.baseUrl + this.ousRestUrl + '/' + id;
    return this.httpc.request('GET', url, {
      headers: headers,
    }).pipe(
      map((response: HttpResponse<any>) => {
        this.ou = response;
        return this.ou;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'Error getting children 4 ' + id));
      })
    );
  }

  listChildren4Ou(id: string, token: string): Observable<any[]> {
    const headers = this.addHeaders(token, false);
    const url = this.baseUrl + this.ousRestUrl + '/' + id + '/children';
    return this.httpc.request('GET', url, {
      headers: headers,
    }).pipe(
      map((response: HttpResponse<any>) => {
        this.ous = response;
        return this.ous;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'Error getting children 4 ' + id));
      })
    );
  }

  openOu(ou: any, token: string): Observable<number> {
    const ouUrl = this.baseUrl + this.ousRestUrl + '/' + ou.objectId + '/open';
    const body = ou.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ouUrl, headers, body);
  }

  closeOu(ou: any, token: string): Observable<number> {
    const ouUrl = this.baseUrl + this.ousRestUrl + '/' + ou.objectId + '/close';
    const body = ou.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ouUrl, headers, body);
  }
}
