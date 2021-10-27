import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {AdminGuard} from '../base/services/admin-guard.service';
import {OrganizationTreeComponent} from './organization-tree/organization-tree.component';
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';

const routes: Routes = [
  {path: 'organizations', component: OrganizationTreeComponent},
  {path: 'organization/:id', component: OrganizationDetailsComponent, canActivate: [AdminGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class OrganizationsRoutingModule {}
