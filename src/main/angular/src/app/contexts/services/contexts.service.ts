import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Context} from '../../base/common/model/inge';
import {environment} from 'environments/environment';
import {PubmanRestService} from '../../base/services/pubman-rest.service';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class ContextsService extends PubmanRestService {
  context_url = environment.rest_contexts;

  constructor(
    httpc: HttpClient,
    conn: ConnectionService
  ) {
    super(httpc, conn);
  }

  openContext(ctx: Context, token: string): Observable<number> {
    const ctxUrl = this.base_url + this.context_url + '/' + ctx.objectId + '/open';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ctxUrl, headers, body);
  }

  closeContext(ctx: Context, token: string): Observable<number> {
    const ctxUrl = this.base_url + this.context_url + '/' + ctx.objectId + '/close';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getHttpStatus('PUT', ctxUrl, headers, body);
  }
}

