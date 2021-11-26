import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrganizationTreeComponent} from './organization-tree/organization-tree.component';
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {LoginGuardService} from 'app/base/services/login-guard.service';

const routes: Routes = [
  {path: 'organizations', component: OrganizationTreeComponent, canActivate: [LoginGuardService]},
  {path: 'organization/:id', component: OrganizationDetailsComponent, canActivate: [LoginGuardService]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
