import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material';
import { CdkTreeModule } from '@angular/cdk/tree';
import { SharedModule } from '../base/common/shared.module';
import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OrganizationsService } from './services/organizations.service';
import { OrganizationTreeComponent } from './organization-tree/organization-tree.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatTreeModule,
    CdkTreeModule,
    SharedModule,
    OrganizationsRoutingModule
  ],
  declarations: [
    OrganizationDetailsComponent,
    OrganizationTreeComponent
  ],
  providers: [
    OrganizationsService
  ]
})
export class OrganizationsModule { }
