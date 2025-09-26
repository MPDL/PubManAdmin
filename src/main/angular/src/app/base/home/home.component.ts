import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../services/authentication.service';

@Component({
    selector: 'home-component',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
  imports: [RouterModule],
})
export class HomeComponent implements OnInit {
  hostName: string = environment.baseUrl;

  constructor(private authenticationService: AuthenticationService) {} // <- Service injizieren

  ngOnInit(): void {
    // Stößt einen einmaligen Auth-Refresh an, der den BehaviorSubject 'principal'
    // aktualisiert. Die login.component zieht ihren Status daraus.
    this.authenticationService.checkLogin().subscribe();
  }
}
