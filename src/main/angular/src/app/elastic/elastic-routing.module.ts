import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ElasticComponent} from './elastic.component';
import {ElasticStartComponent} from './start/elastic-start.component';
import {IndexListComponent} from './index-list/index-list.component';
import {IndexDetailComponent} from './index-detail/index-detail.component';
import {ElasticSearchComponent} from './elastic-search/elastic-search.component';
import {AdminGuard} from '../base/services/admin-guard.service';

const routes: Routes = [
  {path: 'elastic', component: ElasticComponent, canActivate: [AdminGuard],
    children: [
      {path: 'index', component: IndexListComponent},
      {path: 'index/:name', component: IndexDetailComponent},
      {path: 'search', component: ElasticSearchComponent},
      {path: '', component: ElasticStartComponent}, // Default route
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ElasticRoutingModule {}
