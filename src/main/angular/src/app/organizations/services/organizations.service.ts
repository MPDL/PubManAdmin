
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BasicRO, Ou, OuMetadata} from 'app/base/common/model/inge';
import {environment} from 'environments/environment';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class OrganizationsService extends PubmanRestService {
  ousRestUrl = environment.restOus;
  ous: any;
  ouPath: any;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
  ) {
    super(connectionService, httpClient);
  }

  getTopLevelOus(token: string): Observable<Ou[]> {
    const headers = this.addHeaders(token, false);
    const url = this.baseUrl + this.ousRestUrl + '/toplevel';
    return this.httpClient.request('GET', url, {headers: headers}).pipe(
      map((response: HttpResponse<any>) => {
        this.ous = response;
        return this.ous;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error)));
      })
    );
  }

  getFirstLevelOus(token: string): Observable<Ou[]> {
    const headers = this.addHeaders(token, false);
    const url = this.baseUrl + this.ousRestUrl + '/firstlevel';
    return this.httpClient.request('GET', url, {headers: headers}).pipe(
      map((response: HttpResponse<any>) => {
        this.ous = response;
        return this.ous;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error)));
      })
    );
  }

  listChildren4Ou(id: string, token: string): Observable<Ou[]> {
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

  getOuPath(id: string, token: string): Observable<string> {
    const headers = this.addHeaders(token, false);
    const url = this.baseUrl + this.ousRestUrl + '/' + id + '/ouPath';
    return this.httpClient.request('GET', url, {headers: headers, responseType: 'text'}).pipe(
      map((response) => {
        this.ouPath = response;
        return this.ouPath;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'Error getting ouPath ' + id));
      })
    );
  }

  openOu(ou: Ou, token: string): Observable<Ou> {
    const ouUrl = this.baseUrl + this.ousRestUrl + '/' + ou.objectId + '/open';
    const body = ou.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', ouUrl, headers, body);
  }

  closeOu(ou: Ou, token: string): Observable<Ou> {
    const ouUrl = this.baseUrl + this.ousRestUrl + '/' + ou.objectId + '/close';
    const body = ou.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', ouUrl, headers, body);
  }

  makeAffiliation(id: string): BasicRO {
    const aff = new BasicRO();
    aff.objectId = id;
    return aff;
  }

  makeMetadata(name: string): OuMetadata {
    const meta = new OuMetadata();
    meta.name = name;
    return meta;
  }
}
