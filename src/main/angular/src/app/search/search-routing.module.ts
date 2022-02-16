import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminGuardService} from '../base/services/admin-guard.service';
import {ContextSearchComponent} from './context-search/context-search.component';
import {ItemSearchComponent} from './item-search/item-search.component';
import {OrganizationSearchComponent} from './organization-search/organization-search.component';
import {SearchInfoComponent} from './search-info/search-info.component';
import {SearchComponent} from './search.component';
import {UserSearchComponent} from './user-search/user-search.component';

const routes: Routes = [
  {path: 'search', component: SearchComponent, canActivate: [AdminGuardService],
    children: [
      {path: 'users', component: UserSearchComponent, canActivate: [AdminGuardService]},
      {path: 'organizations', component: OrganizationSearchComponent},
      {path: 'contexts', component: ContextSearchComponent},
      {path: 'items', component: ItemSearchComponent},
      {path: '', component: SearchInfoComponent}, // Default route
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule {}
