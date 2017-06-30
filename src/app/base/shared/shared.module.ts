import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { SelectedColourDirective } from '../directives/selected-colour.directive';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationComponent } from '../pagination/pagination.component';
import { PaginationService } from '../services/pagination.service';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule
  ],
  declarations: [
    SelectedColourDirective,
    ClickOutsideDirective,
    PaginationComponent
  ],
  exports: [
    SelectedColourDirective,
    ClickOutsideDirective,
    PaginationComponent,
    NgxPaginationModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    PaginationService
  ]
})
export class SharedModule { }
