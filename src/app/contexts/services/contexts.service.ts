import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class ContextsService {

    context_url = props.pubman_rest_url + "/contexts"
    ctx;
    ctxs: any[];

    constructor(private http: Http,
        private message: MessagesService) { }

    listAllContexts(token: string, page: number): Observable<any[]> {
        const perPage = 25;
    let offset = (page -1) * perPage;
    let headers = new Headers();
    // headers.set("Authorization", token);
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: this.context_url + '?limit=' + perPage + '&offset=' + offset
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        this.ctxs = response.json();
        this.ctxs.sort((a, b) => {
          if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        return this.ctxs;
      })
      .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error getting context list'));
  }

    getContext(id, token): Observable<any> {

        let headers = new Headers();
        headers.set("Authorization", token);
        let contextUrl = this.context_url + '/' + id;
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Get,
            url: contextUrl
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                this.ctx = response.json();
                return this.ctx;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || "Error getting context"));
    }

    postContext(ctx: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let body = JSON.stringify(ctx);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Post,
            url: this.context_url,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error creating context'));
    }

    putContext(ctx: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId;
        let body = JSON.stringify(ctx);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put,
            url: ctxUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error updating context'));
    }

    openContext(ctx: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId + '/open';
        let body = JSON.stringify(ctx.lastModificationDate);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put,
            url: ctxUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error opening context'));
    }

    closeContext(ctx: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId + '/close';
        let body = JSON.stringify(ctx.lastModificationDate);

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put,
            url: ctxUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error closing context'));
    }

    delete(ctx: any, token: string): Observable<number> {
        let headers = new Headers();
        headers.set("Authorization", token);
        headers.append('Content-Type', 'application/json');
        let contextUrl = this.context_url + '/' + ctx.reference.objectId;
        let body = JSON.stringify(ctx.lastModificationDate);
        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Delete,
            url: contextUrl,
            body: body
        });
        return this.http.request(new Request(options))
            .map((response: Response) => {
                let status = response.status;
                return status;
            })
            .catch((error: any) => Observable.throw(JSON.stringify(error.json()) || 'Error deleting context'));
        }
}

