import { Component, OnInit, OnDestroy } from '@angular/core';

import { environment } from 'environments/environment';
import { MessagesService } from '../services/messages.service';
import { AuthenticationService } from '../services/authentication.service';
import { ConnectionService } from '../services/connection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  isLoggedIn: boolean = false;
  host: string = localStorage.getItem('base_url') || environment.base_url;

  constructor(private conn: ConnectionService,
    private login: AuthenticationService,
    private message: MessagesService) { }

  ngOnInit() {
    this.subscription = this.login.isLoggedIn$.subscribe(bool => {
      this.isLoggedIn = bool;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  info() {
    alert('NOT implemented yet ...');
  }

  connect() {
    if (!this.isLoggedIn) {
      let base_url = prompt('URL to connect 2', 'https://');
      if (base_url === null) {
        return;
      }
      localStorage.setItem('base_url', base_url);
      this.host = localStorage.getItem('base_url');
      this.conn.setConnection(this.host);
    } else {
      this.message.warning('you MUST logout, in order 2 change the connection!');
    }
  }
}
