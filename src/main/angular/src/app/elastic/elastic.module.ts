import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from '../base/common/shared.module';
import {ElasticRoutingModule} from './elastic-routing.module';
import {ElasticComponent} from './elastic.component';
import {ElasticStartComponent} from './elastic-start/elastic-start.component';
import {IndexListComponent} from './index-list/index-list.component';
import {ElasticSearchComponent} from './elastic-search/elastic-search.component';
import {ElasticService} from './services/elastic.service';
import {IndexDetailComponent} from './index-detail/index-detail.component';
import {UploadComponent} from './upload/upload.component';
import {IndexAliasComponent} from './index-alias/index-alias.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ElasticRoutingModule,
  ],
  declarations: [ElasticComponent, ElasticStartComponent, IndexListComponent, ElasticSearchComponent, IndexDetailComponent, UploadComponent, IndexAliasComponent],
  providers: [
    ElasticService,
  ],
})

export class ElasticModule {}
