import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { MessagesService } from './messages.service';

@Injectable()
export abstract class BaseGuardService implements CanActivate {
  constructor(
    protected authenticationService: AuthenticationService,
    protected messagesService: MessagesService,
    protected router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authenticationService.isLoggedInObservable().pipe(
      switchMap(isLoggedIn => {
        if (this.authenticationService.isAdmin) return of(true);

        return this.checkAccess(route);
      })
    );
  }

  protected abstract checkAccess(route: ActivatedRouteSnapshot): Observable<boolean>;

  protected denyAccess(message: string, redirectPath: string): Observable<boolean> {
    this.messagesService.warning(message);
    this.router.navigate([redirectPath]);
    return of(false);
  }
}
