import {Observable, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';

import {SearchResult} from '../common/model/inge';
import {ConnectionService} from './connection.service';

@Injectable()
export class PubmanRestService {
  defaultPageSize = 50;
  baseUrl: string;

  constructor(
    protected client: HttpClient,
    protected connectionService: ConnectionService
  ) {
    this.connectionService.connectionService.subscribe((data) => this.baseUrl = data);
  }

  getSearchResults(method, url, headers, body): Observable<any> {
    return this.client.request(method, url, {
      headers: headers,
      observe: 'body',
      responseType: 'json',
      body: body,
    }).pipe(
      map((searchResult: SearchResult) => {
        const result = {list: [], records: 0};
        const data = searchResult;
        const hits = [];
        const records = data.numberOfRecords;
        if (records > 0) {
          data.records.forEach((element) => {
            hits.push(element.data);
          });
          result.list = hits;
          result.records = records;
        }
        return result;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }

  getResource(method, url, headers, body): Observable<any> {
    return this.client.request(method, url, {
      headers: headers,
      body: body,
    }).pipe(
      map((response: HttpResponse<any>) => {
        const resource = response;
        return resource;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }

  getString(url): Observable<string> {
    return this.client.get(url, {responseType: 'text'}).pipe(
      map((response: string) => {
        const resource = response;
        return resource;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }

  getHttpStatus(method, url, headers, body): Observable<any> {
    return this.client.request(method, url, {
      headers: headers,
      body: body,
      observe: 'response',
      responseType: 'text',
    }).pipe(
      map((response) => {
        const status = response.status;
        return status;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }

  addHeaders(token, ct: boolean): HttpHeaders {
    if (token != null) {
      if (ct) {
        const headers = new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', token);
        return headers;
      } else {
        const headers = new HttpHeaders()
          .set('Authorization', token);
        return headers;
      }
    }
  }

  getAll(path, token: string, page: number): Observable<any> {
    const offset = (page - 1) * this.defaultPageSize;
    const requestUrl = this.baseUrl + path + '?size=' + this.defaultPageSize + '&from=' + offset;
    const headers = this.addHeaders(token, false);
    return this.getSearchResults('GET', requestUrl, headers, null);
  }

  filter(path, token: string, query: string, page: number): Observable<any> {
    const offset = (page - 1) * this.defaultPageSize;
    const requestUrl = this.baseUrl + path + query + '&size=' + this.defaultPageSize + '&from=' + offset;
    const headers = this.addHeaders(token, false);
    return this.getSearchResults('GET', requestUrl, headers, null);
  }

  query(path, token: string, body): Observable<any> {
    const headers = this.addHeaders(token, true);
    const requestUrl = this.baseUrl + path + '/search';
    return this.getSearchResults('POST', requestUrl, headers, body);
  }

  get(path, id, token): Observable<any> {
    const resourceUrl = this.baseUrl + path + '/' + id;
    const headers = this.addHeaders(token, false);
    return this.getResource('GET', resourceUrl, headers, null);
  }

  post(path, resource, token): Observable<any> {
    const body = JSON.stringify(resource);
    const headers = this.addHeaders(token, true);
    const requestUrl = this.baseUrl + path;
    return this.getResource('POST', requestUrl, headers, body);
  }

  put(path, resource, token): Observable<any> {
    const body = JSON.stringify(resource);
    const headers = this.addHeaders(token, true);
    const requestUrl = this.baseUrl + path;
    return this.getResource('PUT', requestUrl, headers, body);
  }

  delete(path, resource, token): Observable<number> {
    const headers = this.addHeaders(token, true);
    const requestUrl = this.baseUrl + path;
    return this.getHttpStatus('DELETE', requestUrl, headers, null);
  }
}
