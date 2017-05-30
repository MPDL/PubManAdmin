import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OrganizationsService } from './services/organizations.service';

@NgModule({
  imports: [
    CommonModule,
    OrganizationsRoutingModule
  ],
  declarations: [
    OrganizationListComponent,
    OrganizationDetailsComponent
  ],
  providers: [
    OrganizationsService
  ]
})
export class OrganizationsModule { }
