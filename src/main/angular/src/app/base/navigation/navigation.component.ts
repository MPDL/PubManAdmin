import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';

@Component({
    selector: 'navigation-component',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    standalone: false
})
export class NavigationComponent implements OnInit, OnDestroy {
  adminSubscription: Subscription;
  isAdmin: boolean;
  constructor(
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data: boolean) => this.isAdmin = data);
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
  }
}
