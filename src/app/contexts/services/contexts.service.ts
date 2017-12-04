import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Context } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';
import { PubmanRestService } from '../../base/services/pubman-rest.service';

@Injectable()
export class ContextsService extends PubmanRestService {

    context_url = props.pubman_rest_url + "/contexts"

    constructor(httpc: HttpClient) {
        super(httpc);
    }

    openContext(ctx: Context, token: string): Observable<number> {
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId + '/open';
        let body = JSON.stringify(ctx.lastModificationDate);
        let headers = this.addHeaders(token, true);
        return this.getHttpStatus('PUT', ctxUrl, headers, body);
    }

    closeContext(ctx: Context, token: string): Observable<number> {
        let ctxUrl = this.context_url + '/' + ctx.reference.objectId + '/close';
        let body = JSON.stringify(ctx.lastModificationDate);
        let headers = this.addHeaders(token, true);
        return this.getHttpStatus('PUT', ctxUrl, headers, body);
    }

}

