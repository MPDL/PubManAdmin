import {Component, OnInit, OnDestroy} from '@angular/core';
import {ConnectionService} from '../services/connection.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  hostSubscription: Subscription;

  hostName: string;

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
