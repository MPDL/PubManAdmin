import {Injectable, OnDestroy} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild} from '@angular/router';
import {Subscription} from 'rxjs';

import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable()
export class AdminGuard implements CanActivate, CanActivateChild, OnDestroy {
  checked: boolean = false;
  adminSubscription: Subscription;

  constructor(
    private authentication: AuthenticationService,
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
    this.adminSubscription = this.authentication.isAdmin$.subscribe((checked) => this.checked = checked);
    if (this.checked) {
      return true;
    }
    this.messagesService.warning('This site requires admin authorization ...');
    return false;
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
  }
}
