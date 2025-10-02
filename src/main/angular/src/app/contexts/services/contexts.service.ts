import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Ctx} from '../../base/common/model/inge';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable({
  providedIn: 'root',
})
export class ContextsService extends PubmanRestService {
  ctxsPath:string = environment.restCtxs;

  constructor(
    protected override httpClient: HttpClient,
  ) {
    super(httpClient);
  }

  openCtx(ctx: Ctx): Observable<Ctx> {
    const path = this.ctxsPath + '/' + ctx.objectId + '/open';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(true);

    return this.getResource('PUT', path, headers, body);
  }

  closeCtx(ctx: Ctx): Observable<Ctx> {
    const path = this.ctxsPath + '/' + ctx.objectId + '/close';
    const body = ctx.lastModificationDate;
    const headers = this.addHeaders(true);

    return this.getResource('PUT', path, headers, body);
  }
}

