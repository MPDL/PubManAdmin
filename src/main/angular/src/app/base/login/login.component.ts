import {Component, OnInit} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {MessagesService} from '../services/messages.service';
import {tap} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  appDisclaimer: any;
  appPrivacy: any;
  appHelp: any;
  credentials: any = {};

  constructor(
    protected authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.appDisclaimer = environment.appDisclaimer;
    this.appPrivacy = environment.appPrivacy;
    this.appHelp = environment.appHelp;
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
    this.authenticationService.logout().subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => this.router.navigate(['/home']), // selbst bei Fehler nicht eingeloggt lassen
    });
    this.credentials = {};
  }
}
