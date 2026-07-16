import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    template: '<h2 class="text-warning">Page not found</h2>',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class PageNotFoundComponent {}
