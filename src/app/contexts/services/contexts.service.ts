import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { PubmanRestService } from '../../base/services/pubman-rest.service';

@Injectable()
export class ContextsService extends PubmanRestService {

    context_url = props.pubman_rest_url + "/contexts"
    ctx;
    ctxs: any[];

    constructor(http: Http) {
        super(http);
    }

    openContext(ctx: any, token: string): Observable<number> {
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId + '/open';
        let body = JSON.stringify(ctx.lastModificationDate);
        let options = new RequestOptions({
            headers: this.getHeaders(token, true),
            method: RequestMethod.Put,
            url: ctxUrl,
            body: body
        });
        return this.getHttpStatus(options);
    }

    closeContext(ctx: any, token: string): Observable<number> {
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId + '/close';
        let body = JSON.stringify(ctx.lastModificationDate);
        let options = new RequestOptions({
            headers: this.getHeaders(token, true),
            method: RequestMethod.Put,
            url: ctxUrl,
            body: body
        });
        return this.getHttpStatus(options);
    }

}

