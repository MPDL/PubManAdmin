import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {SearchTermComponent} from '../common/components/search-term/search-term.component';
import {ElasticSearchService} from '../common/services/elastic-search.service';
import {SearchService} from '../common/services/search.service';
import {ClickOutsideDirective} from '../directives/clickoutside.directive';
import {SelectedItemColourDirective} from '../directives/selected-item-colour.directive';
import {ForbiddenNameDirective} from '../directives/forbidden-name.directive';
import {SuggestionComponent} from './components/suggestion/suggestion.component';
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
    ForbiddenNameDirective,
    SearchTermComponent,
    SuggestionComponent,
    ValidLoginnameDirective,
  ],
  exports: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    ForbiddenNameDirective,
    NgxPaginationModule,
    SearchTermComponent,
    SuggestionComponent,
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
