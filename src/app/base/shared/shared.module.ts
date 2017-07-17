import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { SelectedColourDirective } from '../directives/selected-colour.directive';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationComponent } from '../pagination/pagination.component';
import { PaginationService } from '../services/pagination.service';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule
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
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PaginationService
  ]
})
export class SharedModule { }
