import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {SearchTermComponent} from '../common/components/search-term/search-term.component';
import {ElasticSearchService} from '../common/services/elastic-search.service';
import {SearchService} from '../common/services/search.service';
import {ClickOutsideDirective} from '../directives/clickoutside.directive';
import {SelectedItemColourDirective} from '../directives/selected-item-colour.directive';
import {ValueNotAllowedDirective} from '../directives/value-not-allowed.directive';
import {SuggestionComponent} from './components/suggestion/suggestion.component';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    ValueNotAllowedDirective,
    SearchTermComponent,
    SuggestionComponent,
  ],
  exports: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    ValueNotAllowedDirective,
    NgxPaginationModule,
    SearchTermComponent,
    SuggestionComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    SearchService,
    ElasticSearchService,
  ],
})
export class SharedModule {}
