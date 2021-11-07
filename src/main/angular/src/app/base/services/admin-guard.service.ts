import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild} from '@angular/router';

import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable()
export class AdminGuard implements CanActivate, CanActivateChild {
  checked: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): boolean {
    this.authenticationService.isAdmin$.subscribe((data) => this.checked = data);
    if (this.checked) {
      return true;
    }
    this.messagesService.warning('This site requires admin authorization ...');
    return false;
  }
}
