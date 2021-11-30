import {Component, OnInit} from '@angular/core';
import {User} from '../common/model/inge';
import {AuthenticationService} from '../services/authentication.service';
import {MessagesService} from '../services/messages.service';

@Component({
  selector: 'login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  credentials: any = {};
  empty = true;
  loggedIn = false;
  token = '';
  user: User;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
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
            if (this.user == null) {
              this.logout();
              this.messagesService.error('You are not allowed to login...');
            } else {
              this.credentials.userName = this.user.name;
            }
          },
          error: (e) => {
            this.messagesService.error(e);
          },
        });
    }
  }
}
