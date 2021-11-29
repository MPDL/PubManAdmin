import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../base/common/shared.module';
import {ContextDetailsComponent} from './context-details/context-details.component';
import {ContextListComponent} from './context-list/context-list.component';
import {ContextsRoutingModule} from './contexts-routing.module';
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
