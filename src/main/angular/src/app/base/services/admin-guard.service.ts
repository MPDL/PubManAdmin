import {Injectable} from '@angular/core';

import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuardService {
  isAdmin: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
  ) {}

  canActivate(): boolean {
    return this.checkAdmin();
  }

  canActivateChild(): boolean {
    return this.canActivate();
  }

  checkAdmin(): boolean {
    this.authenticationService.isAdmin$.subscribe((data: boolean) => this.isAdmin = data);
    if (this.isAdmin) {
      return true;
    }

    this.messagesService.warning('This site requires admin authorization ...');
    return false;
  }
}
