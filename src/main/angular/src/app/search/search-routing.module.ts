import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SearchComponent} from './search.component';
import {UserSearchComponent} from './user-search/user-search.component';
import {SearchInfoComponent} from './search-info/search-info.component';
import {ItemSearchComponent} from './item-search/item-search.component';
import {AdminGuard} from '../base/services/admin-guard.service';

const routes: Routes = [
  {path: 'search', component: SearchComponent, canActivate: [AdminGuard],
    children: [
      {path: 'users', component: UserSearchComponent, canActivate: [AdminGuard]},
      {path: 'organizations', redirectTo: '/organizations', pathMatch: 'full'},
      {path: 'contexts', redirectTo: '/contexts', pathMatch: 'full'},
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
