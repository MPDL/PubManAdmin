import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

import {SharedModule} from '../base/common/shared.module';

import {ContextsRoutingModule} from './contexts-routing.module';
import {ContextDetailsComponent} from './context-details/context-details.component';
import {ContextListComponent} from './context-list/context-list.component';
import {ContextsService} from './services/contexts.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ContextsRoutingModule,
  ],
  declarations: [
    ContextDetailsComponent,
    ContextListComponent,
  ],
  providers: [
    ContextsService,
  ],
})

export class ContextsModule {}
