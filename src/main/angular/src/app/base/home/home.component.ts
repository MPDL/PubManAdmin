import { Component, OnInit, OnDestroy } from '@angular/core';
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

  login_subscription: Subscription;
  host_subscription: Subscription;

  isLoggedIn: boolean = false;
  host: string;

  constructor(private conn: ConnectionService,
    private login: AuthenticationService,
    private message: MessagesService) { }

  ngOnInit() {
    this.login_subscription = this.login.isLoggedIn$.subscribe(bool => {
      this.isLoggedIn = bool;
    });
    this.host_subscription = this.conn.conn.subscribe(name => {
      this.host = name;
    });
  }

  ngOnDestroy() {
    this.login_subscription.unsubscribe();
    this.host_subscription.unsubscribe();
  }

  info() {
    const message = 'hosd afan gnobf druggd?';
    this.message.warning(message);
    // alert('NOT implemented yet ...');
  }

  connect() {
    if (!this.isLoggedIn) {
      let base_url = prompt('URL to connect 2', 'https://');
      if (base_url === null) {
        return;
      }
      this.conn.setConnection(base_url);
    } else {
      this.message.warning('you MUST logout, in order 2 change the connection!');
    }
  }
}
