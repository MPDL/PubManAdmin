import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectedItemColourDirective} from '../directives/selected-item-colour.directive';
import {ClickOutsideDirective} from '../directives/click-outside.directive';
import {DocumentClickDirective} from '../directives/documentclick.directive';
import {ValueNotAllowedDirective} from '../directives/value-not-allowed.directive';
import {NgxPaginationModule} from 'ngx-pagination';
import {SearchTermComponent} from '../common/components/search-term/search-term.component';
import {SearchService} from '../common/services/search.service';
import {ElasticSearchService} from '../common/services/elastic-search.service';
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
    DocumentClickDirective,
    ValueNotAllowedDirective,
    SearchTermComponent,
    SuggestionComponent,
  ],
  exports: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    DocumentClickDirective,
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
