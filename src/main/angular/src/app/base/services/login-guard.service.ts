import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable()
export class LoginGuardService implements CanActivate, CanActivateChild {
  isLoggedIn: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
  ) {}

  canActivate(): boolean {
    return this.checkLogin();
  }

  canActivateChild(): boolean {
    return this.canActivate();
  }

  checkLogin(): boolean {
    this.authenticationService.isLoggedIn$.subscribe((data) => this.isLoggedIn = data);
    if (this.isLoggedIn) {
      return true;
    }

    this.messagesService.warning('This site requires you to login ...');
    return false;
  }
}
