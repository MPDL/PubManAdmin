import {Component} from '@angular/core';

import {RouterModule} from '@angular/router';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'home-component',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
  imports: [RouterModule],
})
export class HomeComponent {
  hostName: string = environment.baseUrl;

  constructor(
  ) {}
}
