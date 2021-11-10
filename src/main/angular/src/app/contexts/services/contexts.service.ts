import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Context} from '../../base/common/model/inge';
import {environment} from 'environments/environment';
import {PubmanRestService} from '../../base/services/pubman-rest.service';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class ContextsService extends PubmanRestService {
  contextUrl = environment.restContexts;

  constructor(
    protected httpClient: HttpClient,
    protected connectionService: ConnectionService
  ) {
    super(httpClient, connectionService);
  }

  openContext(ctx: Context, token: string): Observable<number> {
    const ctxUrl = this.baseUrl + this.contextUrl + '/' + ctx.objectId + '/open';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ctxUrl, headers, body);
  }

  closeContext(ctx: Context, token: string): Observable<number> {
    const ctxUrl = this.baseUrl + this.contextUrl + '/' + ctx.objectId + '/close';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ctxUrl, headers, body);
  }
}

