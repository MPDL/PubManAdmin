import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../base/common/shared.module';
import { ElasticRoutingModule } from './elastic-routing.module';
import { ElasticComponent } from './elastic.component';
import { ElasticStartComponent } from './start/elastic-start.component';
import { IndexComponent } from './index/index.component';
import { SearchComponent } from './search/search.component';
import { ElasticService } from './service/elastic.service';
import { IndexDetailComponent } from './index-detail/index-detail.component';
import { UploadComponent } from './upload/upload.component';
import { IndexAliasComponent } from './index-alias/index-alias.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ElasticRoutingModule
  ],
  declarations: [ElasticComponent, ElasticStartComponent, IndexComponent, SearchComponent, IndexDetailComponent, UploadComponent, IndexAliasComponent],
  providers: [
    ElasticService
  ]
})
export class ElasticModule { }
