import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ContextListComponent} from './context-list/context-list.component';
import {ContextDetailsComponent} from './context-details/context-details.component';
import {ContextDetailsResolverService} from './services/context-details-resolver.service';
import {LoginGuardService} from 'app/base/services/login-guard.service';

const routes: Routes = [
  {path: 'contexts', component: ContextListComponent, canActivate: [LoginGuardService]},
  {path: 'context/:id', component: ContextDetailsComponent, canActivate: [LoginGuardService], resolve: {ctx: ContextDetailsResolverService}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ContextDetailsResolverService],
})
export class ContextsRoutingModule {}
