import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContextsRoutingModule } from './contexts-routing.module';
import { ContextDetailsComponent } from './context-details/context-details.component';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextsService } from './services/contexts.service';

@NgModule({
  imports: [
    CommonModule,
    ContextsRoutingModule
  ],
  declarations: [
    ContextDetailsComponent,
    ContextListComponent
  ],
  providers: [
    ContextsService
  ]
})
export class ContextsModule { }
