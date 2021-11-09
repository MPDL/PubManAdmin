import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild} from '@angular/router';

import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable()
export class LoginGuard implements CanActivate, CanActivateChild {
  checked: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService
  ) {}

  canActivate(_activatedRouteSnapshot: ActivatedRouteSnapshot, _routerStateSnapshot: RouterStateSnapshot): boolean {
    return this.checkLogin();
  }

  canActivateChild(activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot): boolean {
    return this.canActivate(activatedRouteSnapshot, routerStateSnapshot);
  }

  checkLogin(): boolean {
    this.authenticationService.isLoggedIn$.subscribe((data) => this.checked = data);
    if (this.checked) {
      return true;
    }
    this.messagesService.warning('This site requires you to login ...');
    return false;
  }
}
