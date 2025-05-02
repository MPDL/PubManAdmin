import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {environment} from 'environments/environment';
import {Observable, of, throwError} from 'rxjs';
import {catchError, first} from 'rxjs/operators';
import {Ctx} from '../../base/common/model/inge';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from './contexts.service';

@Injectable({
  providedIn: 'root',
})
export class ContextDetailsResolverService {
  ctxsPath: string = environment.restCtxs;

  constructor(
    private contextsService: ContextsService,
    private messagesService: MessagesService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Ctx> {
    const id = route.params['id'];

    if (id === 'new ctx') {
      const ctx = new Ctx();
      ctx.name = 'new ctx';
      ctx.responsibleAffiliations = [];
      ctx.allowedGenres = [];
      ctx.allowedSubjectClassifications = [];
      ctx.workflow = 'STANDARD';
      return of(ctx);
    } else {
      return this.contextsService.get(this.ctxsPath, id)
        .pipe(
          first(),
          catchError((error) => {
            this.messagesService.error(error);
            return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
          })
        );
    }
  }
}

