import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {LoginComponent} from '../login/login.component';

@Component({
    selector: 'navigation-component',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, LoginComponent]
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
