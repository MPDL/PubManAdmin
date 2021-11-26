import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Ctx} from '../../base/common/model/inge';
import {environment} from 'environments/environment';
import {PubmanRestService} from '../../base/services/pubman-rest.service';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class ContextsService extends PubmanRestService {
  ctxUrl = environment.restCtxs;

  constructor(
    protected httpClient: HttpClient,
    protected connectionService: ConnectionService
  ) {
    super(httpClient, connectionService);
  }

  openCtx(ctx: Ctx, token: string): Observable<number> {
    const ctxUrl = this.baseUrl + this.ctxUrl + '/' + ctx.objectId + '/open';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ctxUrl, headers, body);
  }

  closeCtx(ctx: Ctx, token: string): Observable<number> {
    const ctxUrl = this.baseUrl + this.ctxUrl + '/' + ctx.objectId + '/close';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ctxUrl, headers, body);
  }
}

