import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ElasticComponent } from './elastic.component';
import { ElasticStartComponent } from './start/elastic-start.component';
import { IndexComponent } from './index/index.component';
import { IndexDetailComponent } from './index-detail/index-detail.component';
import { SearchComponent } from './search/search.component';
import { UploadComponent } from './upload/upload.component';
import { AdminGuard } from '../base/services/admin-guard.service';

const routes: Routes = [
  {
    path: 'elastic',
    component: ElasticComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'index', component: IndexComponent },
      { path: 'index/:name', component: IndexDetailComponent },
      { path: 'search', component: SearchComponent },
      // { path: 'upload', component: UploadComponent },
      { path: '', component: ElasticStartComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ElasticRoutingModule { }
