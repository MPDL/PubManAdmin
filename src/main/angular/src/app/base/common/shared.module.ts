import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {SearchTermComponent} from '../common/components/search-term/search-term.component';
import {ElasticSearchService} from '../common/services/elastic-search.service';
import {SearchService} from '../common/services/search.service';
import {ClickOutsideDirective} from '../directives/clickoutside.directive';
import {SelectedItemColourDirective} from '../directives/selected-item-colour.directive';
import {ForbiddenCharacterDirective} from '../directives/forbidden-character.directive';
import {ForbiddenNameDirective} from '../directives/forbidden-name.directive';
import {ValidLoginnameDirective} from '../directives/valid-loginname.directive';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    ForbiddenCharacterDirective,
    ForbiddenNameDirective,
    SearchTermComponent,
    ValidLoginnameDirective,
  ],
  exports: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    ForbiddenCharacterDirective,
    ForbiddenNameDirective,
    NgxPaginationModule,
    SearchTermComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ValidLoginnameDirective,
  ],
  providers: [
    SearchService,
    ElasticSearchService,
  ],
})
export class SharedModule {}
