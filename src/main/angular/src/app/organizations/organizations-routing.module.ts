import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuardService} from 'app/base/services/login-guard.service';
import {OrganizationDetailsComponent} from './organization-details/organization-details.component';
import {OrganizationTreeComponent} from './organization-tree/organization-tree.component';
import {OrganizationDetailsResolverService} from './services/organization-details-resolver.service';

const routes: Routes = [
  {path: 'organizations', component: OrganizationTreeComponent, canActivate: [LoginGuardService]},
  {path: 'organization/:id', component: OrganizationDetailsComponent, canActivate: [LoginGuardService], resolve: {ou: OrganizationDetailsResolverService}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OrganizationDetailsResolverService],
})
export class OrganizationsRoutingModule {}
