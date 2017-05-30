import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../base/shared/shared.module';
import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OrganizationsService } from './services/organizations.service';
import { Elastic4ousService } from './services/elastic4ous.service';

@NgModule({
  imports: [
    FormsModule,
    HttpModule,
    CommonModule,
    SharedModule,
    OrganizationsRoutingModule
  ],
  declarations: [
    OrganizationListComponent,
    OrganizationDetailsComponent
  ],
  providers: [
    OrganizationsService,
    Elastic4ousService
  ]
})
export class OrganizationsModule { }
