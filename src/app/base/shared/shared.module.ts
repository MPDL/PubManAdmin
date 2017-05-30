import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { SelectedColourDirective } from '../directives/selected-colour.directive';
import { ClickOutsideDirective } from '../directives/click-outside.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SelectedColourDirective,
    ClickOutsideDirective
  ],
  exports: [
    SelectedColourDirective,
    ClickOutsideDirective,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
