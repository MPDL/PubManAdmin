import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextDetailsComponent } from './context-details/context-details.component';
import { ContextDetailsResolverService } from './services/context-details-resolver.service';
import { AuthGuard } from '../base/services/auth-guard.service';


const routes: Routes = [
    {
    path: 'contexts',
    component: ContextListComponent
  },
  {
    path: 'context/:id',
    component: ContextDetailsComponent,
    canActivate: [AuthGuard],
    resolve: {ctx: ContextDetailsResolverService}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ContextDetailsResolverService]
})
export class ContextsRoutingModule { }
