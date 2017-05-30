import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OrganizationDetailsResolverService } from './services/organization-details-resolver.service';

const routes: Routes = [
  {
    path: 'organizations',
    component: OrganizationListComponent
  },
  {
    path: 'organization/:id',
    component: OrganizationDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OrganizationDetailsResolverService]
})
export class OrganizationsRoutingModule { }
