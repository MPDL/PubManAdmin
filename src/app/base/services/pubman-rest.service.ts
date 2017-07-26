import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';

@Injectable()
export class PubmanRestService {

  defaultPageSize = 25;

  constructor(
    protected http: Http,
  ) { }

  getSearchResults(options: RequestOptions): Observable<any> {
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let result = { list: [], records: "" };
        let data = response.json();
        let hits = [];
        let records = data.numberOfRecords;
        data.records.forEach(element => {
          hits.push(element.data)
        });
        result.list = hits;
        result.records = records;
        return result;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting results from ' + options.url));
  }

  getResource(options: RequestOptions): Observable<any> {
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let resource = response.json();
        return resource;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || "Error getting resource " + options.url));
  }

  getHttpStatus(options: RequestOptions): Observable<any> {
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let status = response.status;
        return status;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || "Error getting status " + options.url));
  }

  getHeaders(token, ct: boolean): Headers {
    let headers = new Headers();
    if (ct) {
      headers.append("Content-Type", "application/json");
    }
    if (token != null) {
      headers.append("Authorization", token);
    }
    return headers;
  }

  getAll(url, token: string, page: number): Observable<any> {
    let offset = (page - 1) * this.defaultPageSize;
    let options = new RequestOptions({
      headers: this.getHeaders(token, false),
      method: RequestMethod.Get,
      url: url + '?limit=' + this.defaultPageSize + '&offset=' + offset
    });
    return this.getSearchResults(options);
  }

  filter(url, token: string, query: string, page: number): Observable<any> {
    let offset = (page - 1) * this.defaultPageSize;
    let options = new RequestOptions({
      headers: this.getHeaders(token, false),
      method: RequestMethod.Get,
      url: url + query + '&limit=' + this.defaultPageSize + '&offset=' + offset
    });
    return this.getSearchResults(options);
  }

  query(url, token: string, body): Observable<any> {
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Post,
      url: url + '/search',
      body: body
    });
    return this.getSearchResults(options);
  }

  get(url, id, token): Observable<any> {
    let resourceUrl = url + '/' + id;
    let options = new RequestOptions({
      headers: this.getHeaders(token, false),
      method: RequestMethod.Get,
      url: resourceUrl
    });
    return this.getResource(options);
  }

  post(url, resource, token): Observable<number> {
    let body = JSON.stringify(resource);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Post,
      url: url,
      body: body
    });
    return this.getHttpStatus(options);
  }

  put(url, resource, token): Observable<number> {
    let body = JSON.stringify(resource);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Put,
      url: url,
      body: body
    });
    return this.getHttpStatus(options);
  }

  delete(url, resource, token): Observable<number> {
    let body = JSON.stringify(resource.lastModificationDate);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Delete,
      url: url,
      body: body
    });
    return this.getHttpStatus(options);
  }

}
