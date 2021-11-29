import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuardService} from 'app/base/services/login-guard.service';
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {OrganizationTreeComponent} from './organization-tree/organization-tree.component';

const routes: Routes = [
  {path: 'organizations', component: OrganizationTreeComponent, canActivate: [LoginGuardService]},
  {path: 'organization/:id', component: OrganizationDetailsComponent, canActivate: [LoginGuardService]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
