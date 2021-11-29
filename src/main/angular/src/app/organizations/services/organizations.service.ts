
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class OrganizationsService extends PubmanRestService {
  ousRestUrl = environment.restOus;
  ou;
  ous: any;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
  ) {
    super(connectionService, httpClient);
  }

  getOuById(id: string, token: string): Observable<any> {
    const headers = this.addHeaders(token, false);
    const url = this.baseUrl + this.ousRestUrl + '/' + id;
    return this.httpClient.request('GET', url, {headers: headers})
      .pipe(
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
    return this.httpClient.request('GET', url, {headers: headers}).pipe(
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
