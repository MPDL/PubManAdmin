import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {User} from '../common/model/inge';
import {AuthenticationService} from '../services/authentication.service';
import {MessagesService} from '../services/messages.service';

const {disclaimer: appDisclaimer} = require('../../../../package.json');
const {privacy: appPrivacy} = require('../../../../package.json');
const {help: appHelp} = require('../../../../package.json');

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  appDisclaimer: any;
  appPrivacy: any;
  appHelp: any;
  credentials: any = {};
  empty: boolean = true;
  loggedIn: boolean = false;
  token: string = '';
  user: User;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
  ) {}

  ngOnInit() {
    this.appDisclaimer = appDisclaimer;
    this.appPrivacy = appPrivacy;
    this.appHelp = appHelp;
  }

  login() {
    this.authenticationService.login(this.credentials.userName, this.credentials.password)
      .subscribe({
        next: (data: string) => {
          this.token = data;
          this.who();
          this.loggedIn = true;
        },
        error: (e) => this.messagesService.error(e),
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
          next: (data: User) => {
            this.user = data;
            if (this.user == null) {
              this.logout();
              this.messagesService.error('you are not allowed to login!');
            } else {
              this.credentials.userName = this.user.name;
            }
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }
}
