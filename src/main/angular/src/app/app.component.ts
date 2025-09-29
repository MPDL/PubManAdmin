import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NavigationComponent} from './base/navigation/navigation.component';
import {FooterComponent} from './base/footer/footer.component';
import {AuthenticationService} from './base/services/authentication.service';


@Component({
    selector: 'app-component',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterModule, NavigationComponent, FooterComponent]
})
export class AppComponent {
  constructor(
    private authenticationService: AuthenticationService
  ) {
    window.onfocus = function() {
      authenticationService.checkLoginChanged();
    };
  }}

