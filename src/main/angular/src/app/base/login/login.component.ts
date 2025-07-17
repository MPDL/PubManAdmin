import {Component, OnInit} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {MessagesService} from '../services/messages.service';
import {tap} from 'rxjs';

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  credentials: any = {};

  constructor(
    protected authenticationService: AuthenticationService,
    private messagesService: MessagesService,
  ) {}

  ngOnInit() {
  }

  login(): void {
      this.authenticationService.login(this.credentials.userName, this.credentials.password)
        .pipe(
          tap( p=> {
          })
        )
        .subscribe(
          {
            error : (e) => {
              this.messagesService.error(e)
            }
          }
        )

  }

  logout() {
    this.authenticationService.logout();
    this.credentials = {};
  }
}
