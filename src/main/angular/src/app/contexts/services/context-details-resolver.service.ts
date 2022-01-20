
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {environment} from 'environments/environment';
import {Observable, of, Subscription, throwError} from 'rxjs';
import {catchError, first} from 'rxjs/operators';
import {Ctx} from '../../base/common/model/inge';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from './contexts.service';

@Injectable()
export class ContextDetailsResolverService implements Resolve<any> {
  ctxsPath: string = environment.restCtxs;

  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
  ) {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data: string) => this.token = data);
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
      return this.contextsService.get(this.ctxsPath, id, this.token)
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

