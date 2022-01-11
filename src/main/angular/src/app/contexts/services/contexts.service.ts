import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Ctx} from '../../base/common/model/inge';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class ContextsService extends PubmanRestService {
  ctxsUrl:string = environment.restCtxs;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
  ) {
    super(connectionService, httpClient);
  }

  openCtx(ctx: Ctx, token: string): Observable<Ctx> {
    const url = this.ctxsUrl + '/' + ctx.objectId + '/open';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }

  closeCtx(ctx: Ctx, token: string): Observable<Ctx> {
    const url = this.ctxsUrl + '/' + ctx.objectId + '/close';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }
}

