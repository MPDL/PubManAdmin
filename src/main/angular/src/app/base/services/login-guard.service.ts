import {Injectable} from '@angular/core';

import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuardService {
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
    this.authenticationService.isLoggedIn$.subscribe((data: boolean) => this.isLoggedIn = data);
    if (this.isLoggedIn) {
      return true;
    }

    this.messagesService.warning('This site requires you to login ...');
    return false;
  }
}
