import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { SearchResult } from 'app/base/common/model';
import { HttpHeaderResponse, HttpResponseBase } from '@angular/common/http/src/response';

@Injectable()
export class PubmanRestService {

  defaultPageSize = 25;

  constructor(
    protected client: HttpClient
  ) { }

  getSearchResults(method, url, headers, body): Observable<any> {
    return this.client.request(method, url, {
      headers: headers,
      observe: 'body',
      responseType: 'json',
      body: body
    })
      .map((response: SearchResult) => {
        let result = { list: [], records: 0 };
        let data = response;
        let hits = [];
        let records = data.numberOfRecords;
        data.records.forEach(element => {
          hits.push(element.data)
        });
        result.list = hits;
        result.records = records;
        return result;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error) || 'Error getting results from ' + url));
  }

  getResource(method, url, headers, body): Observable<any> {
    return this.client.request(method, url, {
      headers: headers,
      body: body
    })
      .map((response: HttpResponse<any>) => {
        let resource = response;
        return resource;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error) || "Error getting resource " + url));
  }

  getHttpStatus(method, url, headers, body): Observable<any> {
    return this.client.request(method, url, {
      headers: headers,
      body: body,
      observe: 'response',
      responseType: 'text'
    })
      .map((response) => {
        let status = response.status;
        return status;
      })
      .catch((error: HttpErrorResponse) => Observable.throw(JSON.stringify(error.message) || "Error getting status " + url));
  }

  addHeaders(token, ct: boolean): HttpHeaders {
    if (token != null) {
      if (ct) {
        let headers = new HttpHeaders()
          .set("Content-Type", "application/json")
          .set("Authorization", token);
        return headers;
      } else {
        let headers = new HttpHeaders()
          .set("Authorization", token);
        return headers;
      }
    }
  }

  getAll(url, token: string, page: number): Observable<any> {
    let offset = (page - 1) * this.defaultPageSize;
    let requestUrl = url + '?limit=' + this.defaultPageSize + '&offset=' + offset;
    let headers = this.addHeaders(token, false);
    return this.getSearchResults('GET', requestUrl, headers, null);
  }

  filter(url, token: string, query: string, page: number): Observable<any> {
    let offset = (page - 1) * this.defaultPageSize;
    let requestUrl = url + query + '&limit=' + this.defaultPageSize + '&offset=' + offset;
    let headers = this.addHeaders(token, false);
    return this.getSearchResults('GET', requestUrl, headers, null);
  }

  query(url, token: string, body): Observable<any> {
    let headers = this.addHeaders(token, true);
    let requestUrl = url + '/search';
    return this.getSearchResults('POST', requestUrl, headers, body);
  }

  get(url, id, token): Observable<any> {
    let resourceUrl = url + '/' + id;
    let headers = this.addHeaders(token, false);
    return this.getResource('GET', resourceUrl, headers, null);
  }

  post(url, resource, token): Observable<number> {
    let body = JSON.stringify(resource);
    let headers = this.addHeaders(token, true);
    return this.getHttpStatus('POST', url, headers, body);
  }

  put(url, resource, token): Observable<number> {
    let body = JSON.stringify(resource);
    let headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', url, headers, body);
  }

  delete(url, resource, token): Observable<number> {
    let body = JSON.stringify(resource.lastModificationDate);
    let headers = this.addHeaders(token, true);
    return this.getHttpStatus('DELETE', url, headers, null);
  }

}
