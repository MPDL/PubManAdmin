import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

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
    SearchTermComponent,
    SuggestionComponent,
  ],
  exports: [
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
