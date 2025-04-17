import {Component, OnInit, OnDestroy} from '@angular/core';
import {ConnectionService} from '../services/connection.service';
import {Subscription} from 'rxjs';
import {environment} from 'environments/environment';

@Component({
    selector: 'home-component',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  hostSubscription: Subscription;

  hostName: string;

  icon: string = environment.icon;

  constructor(
    private connectionService: ConnectionService,
  ) {}

  ngOnInit() {
    this.hostSubscription = this.connectionService.connectionService$.subscribe((data: string) => this.hostName = data);
  }

  ngOnDestroy() {
    this.hostSubscription.unsubscribe();
  }
}
