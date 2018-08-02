import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectedItemColourDirective } from '../directives/selected-item-colour.directive';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { DocumentClickDirective } from '../directives/documentclick.directive';
import { ValueNotAllowedDirective } from '../directives/value-not-allowed.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationComponent } from '../pagination/pagination.component';
import { PaginationService } from '../services/pagination.service';
import { SearchTermComponent } from '../common/components/search-term/search-term.component';
import { SearchService } from '../common/services/search.service';
import { ElasticSearchService } from '../common/services/elastic-search.service';


@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule
  ],
  declarations: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    DocumentClickDirective,
    ValueNotAllowedDirective,
    PaginationComponent,
    SearchTermComponent
  ],
  exports: [
    SelectedItemColourDirective,
    ClickOutsideDirective,
    DocumentClickDirective,
    ValueNotAllowedDirective,
    PaginationComponent,
    NgxPaginationModule,
    SearchTermComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PaginationService,
    SearchService,
    ElasticSearchService
  ]
})
export class SharedModule { }
