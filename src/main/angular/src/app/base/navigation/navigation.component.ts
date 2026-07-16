import {Component, ChangeDetectionStrategy} from '@angular/core';

import {RouterModule} from '@angular/router';
import {LoginComponent} from '../login/login.component';

@Component({
    selector: 'navigation-component',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterModule, LoginComponent]
})
export class NavigationComponent {
}
