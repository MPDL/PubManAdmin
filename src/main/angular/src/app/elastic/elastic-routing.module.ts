import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminGuardService} from '../base/services/admin-guard.service';
import {ElasticSearchComponent} from './elastic-search/elastic-search.component';
import {ElasticStartComponent} from './elastic-start/elastic-start.component';
import {ElasticComponent} from './elastic.component';
import {IndexDetailComponent} from './index-detail/index-detail.component';
import {IndexListComponent} from './index-list/index-list.component';

const routes: Routes = [
  {path: 'elastic', component: ElasticComponent, canActivate: [AdminGuardService],
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
