import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../base/common/shared.module';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { OrganizationSearchComponent } from './organization-search/organization-search.component';
import { ContextSearchComponent } from './context-search/context-search.component';
import { ItemSearchComponent } from './item-search/item-search.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SearchRoutingModule
  ],
  declarations: [
    SearchComponent,
    UserSearchComponent,
    OrganizationSearchComponent,
    ContextSearchComponent,
    ItemSearchComponent
  ]
})
export class SearchModule { }
