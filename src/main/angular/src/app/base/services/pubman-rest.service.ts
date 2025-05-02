import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Ctx, Ou, SearchResult, User} from '../common/model/inge';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PubmanRestService {
  defaultPageSize = 50;
  baseUrl: string = environment.baseUrl;

  constructor(
    protected httpClient: HttpClient,
  ) {
  }

  getSearchResults(method: string, path: string, headers: HttpHeaders, body: any): Observable<any> {
    const requestUrl = this.baseUrl + path;
    return this.httpClient.request(method, requestUrl, {
      headers: headers,
      observe: 'body',
      responseType: 'json',
      body: body,
      withCredentials: true
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

  getStringResource(method: string, path: string, headers: HttpHeaders): Observable<any> {
    const requestUrl = this.baseUrl + path;
    return this.httpClient.request(method, requestUrl, {
      headers: headers,
      responseType: 'text',
      withCredentials: true
    }).pipe(
      map((response: any) => {
        const resource = response;
        return resource;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }

  getResource(method: string, path: string, headers: HttpHeaders, body: object | string | Date): Observable<any> {
    const requestUrl = this.baseUrl + path;
    if (body == null) {
      return this.httpClient.request(method, requestUrl, {
        headers: headers,
        withCredentials: true
      }).pipe(
        map((response: HttpResponse<any>) => {
          const resource = response;
          return resource;
        }),
        catchError((error) => {
          return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
        })
      );
    } else {
      return this.httpClient.request(method, requestUrl, {
        headers: headers,
        body: body,
        withCredentials: true
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
  }

  addHeaders(contentType: boolean): HttpHeaders {
      if (contentType) {
        const headers = new HttpHeaders()
          .set('Content-Type', 'application/json')
        return headers;
      } else {
        const headers = new HttpHeaders()
        return headers;
      }
  }

  getAll(path: string, page: number): Observable<any> {
    const offset = (page - 1) * this.defaultPageSize;
    const requestPath = path + '?size=' + this.defaultPageSize + '&from=' + offset;
    const headers = this.addHeaders(false);
    return this.getSearchResults('GET', requestPath, headers, null);
  }

  filter(path: string, query: string, page: number): Observable<any> {
    const offset = (page - 1) * this.defaultPageSize;
    const requestPath = path + query + '&size=' + this.defaultPageSize + '&from=' + offset;
    const headers = this.addHeaders(false);
    return this.getSearchResults('GET', requestPath, headers, null);
  }

  query(path: string, body: object): Observable<any> {
    const headers = this.addHeaders(true);
    const requestPath = path + '/search';
    return this.getSearchResults('POST', requestPath, headers, body);
  }

  get(path: string, id: string): Observable<any> {
    const requestPath = path + '/' + id;
    const headers = this.addHeaders(false);
    return this.getResource('GET', requestPath, headers, null);
  }

  post(path: string, resource: User | Ctx | Ou): Observable<any> {
    const body = JSON.stringify(resource);
    const headers = this.addHeaders(true);
    return this.getResource('POST', path, headers, body);
  }

  put(path: string, resource: User | Ctx | Ou): Observable<any> {
    const body = JSON.stringify(resource);
    const headers = this.addHeaders(true);
    return this.getResource('PUT', path, headers, body);
  }

  delete(path: string): Observable<number> {
    const headers = this.addHeaders(true);
    return this.getHttpStatus('DELETE', path, headers, null);
  }

  private getHttpStatus(method: string, path: string, headers: HttpHeaders, body: Date): Observable<any> {
    const requestUrl = this.baseUrl + path;
    return this.httpClient.request(method, requestUrl, {
      headers: headers,
      body: body,
      observe: 'response',
      responseType: 'text',
      withCredentials: true
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
}
