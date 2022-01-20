import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable()
export class AdminGuardService implements CanActivate, CanActivateChild {
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
