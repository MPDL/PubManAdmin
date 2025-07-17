import {Component} from '@angular/core';

import {RouterModule} from '@angular/router';
import {LoginComponent} from '../login/login.component';

@Component({
    selector: 'navigation-component',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    standalone: true,
    imports: [RouterModule, LoginComponent]
})
export class NavigationComponent {
}
