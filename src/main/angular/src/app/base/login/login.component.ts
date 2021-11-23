import {Component, OnInit} from '@angular/core';

import {MessagesService} from '../services/messages.service';
import {AuthenticationService} from '../services/authentication.service';

import {User} from '../common/model/inge';

@Component({
  selector: 'login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  credentials: any = {};
  loggedIn = false;
  hasToken = false;
  empty = true;
  token = '';
  user: User;

  constructor(
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {}

  login() {
    this.authenticationService.login(this.credentials.userName, this.credentials.password)
      .subscribe({
        next: (data) => {
          this.token = data;
          this.who();
          this.loggedIn = true;
        },
        error: (e) => {
          this.messagesService.error(e);
          this.loggedIn = false;
        },
      });
  }

  logout() {
    this.authenticationService.logout();
    this.credentials.userName = '';
    this.credentials.password = '';
    this.loggedIn = false;
    // required because ngForm cannot be reset.
    // restore 'pristine' class state.
    this.empty = false;
    setTimeout(() => this.empty = true, 0);
  }

  who() {
    if (this.token !== '') {
      this.authenticationService.who(this.token)
        .subscribe({
          next: (data) => {
            this.user = data;
            this.hasToken = true;
            this.credentials.userName = this.user.name;
          },
          error: (e) => {
            this.messagesService.error(e);
            this.hasToken = false;
          },
        });
    }
  }
}
