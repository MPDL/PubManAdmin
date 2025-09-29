import {Component, OnInit, ViewChild} from '@angular/core';

import {FormsModule, NgForm} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {MessagesService} from '../services/messages.service';
import {tap, finalize} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [FormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  @ViewChild('form1') form1?: NgForm;

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
          tap(p => {
          }),
          finalize(() => {
            this.form1?.resetForm();
            this.credentials = {};
          })
        )
        .subscribe({
          error: (e) => {
            this.messagesService.error(e);
          }
        });
  }

  logout() {
    this.authenticationService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']), // selbst bei Fehler nicht eingeloggt lassen
    });
    this.credentials = {};
  }
}
