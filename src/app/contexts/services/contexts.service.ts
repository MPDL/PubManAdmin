import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';




import { Context } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';
import { PubmanRestService } from '../../base/services/pubman-rest.service';

@Injectable()
export class ContextsService extends PubmanRestService {

    context_url = props.pubman_rest_url + '/contexts'

    constructor(httpc: HttpClient) {
        super(httpc);
    }

    openContext(ctx: Context, token: string): Observable<number> {
        const ctxUrl = this.context_url + '/' + ctx.objectId + '/open';
        const body = ctx.lastModificationDate;
        const headers = this.addHeaders(token, true);
        return this.getHttpStatus('PUT', ctxUrl, headers, body);
    }

    closeContext(ctx: Context, token: string): Observable<number> {
        const ctxUrl = this.context_url + '/' + ctx.objectId + '/close';
        const body = ctx.lastModificationDate;
        const headers = this.addHeaders(token, true);
        return this.getHttpStatus('PUT', ctxUrl, headers, body);
    }

}

