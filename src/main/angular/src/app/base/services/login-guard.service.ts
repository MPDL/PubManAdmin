import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';
import {filter, map} from 'rxjs/operators';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {CanActivate, Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginGuardService implements CanActivate {
  static instance: LoginGuardService;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private router: Router
  ) {
    LoginGuardService.instance = this;
  }

  canActivate(): Observable<boolean> {
    return this.authenticationService.isLoggedInObservable().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        }
        this.messagesService.warning('This site requires you to login ...');
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
