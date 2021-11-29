
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {environment} from 'environments/environment';
import {Observable, of, throwError} from 'rxjs';
import {catchError, first} from 'rxjs/operators';
import {Ctx} from '../../base/common/model/inge';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from './contexts.service';

@Injectable()
export class ContextDetailsResolverService implements Resolve<any> {
  constructor(
    private contextsService: ContextsService,
    private messagesService: MessagesService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Ctx> {
    const url = environment.restCtxs;
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
      const token = route.params['token'];
      return this.contextsService.get(url, id, token)
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

