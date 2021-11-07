import {Component, OnInit, OnDestroy} from '@angular/core';
import {MessagesService} from '../services/messages.service';
import {AuthenticationService} from '../services/authentication.service';
import {ConnectionService} from '../services/connection.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  loginSubscription: Subscription;
  hostSubscription: Subscription;

  isLoggedIn: boolean = false;
  hostName: string;

  constructor(
    private connectionService: ConnectionService,
    private login: AuthenticationService,
    private messagesService: MessagesService
  ) {}

  ngOnInit() {
    this.loginSubscription = this.login.isLoggedIn$.subscribe((data) => this.isLoggedIn = data);
    this.hostSubscription = this.connectionService.connectionService.subscribe((data) => this.hostName = data);
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.hostSubscription.unsubscribe();
  }

  connect() {
    if (!this.isLoggedIn) {
      const baseUrl = prompt('URL to connect 2', 'https://');
      if (baseUrl === null) {
        return;
      }
      this.connectionService.setConnection(baseUrl);
    } else {
      this.messagesService.warning('you MUST logout, in order 2 change the connection!');
    }
  }
}
