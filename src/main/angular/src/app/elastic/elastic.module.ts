import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../base/common/shared.module';
import {ElasticRoutingModule} from './elastic-routing.module';
import {ElasticSearchComponent} from './elastic-search/elastic-search.component';
import {ElasticStartComponent} from './elastic-start/elastic-start.component';
import {ElasticComponent} from './elastic.component';
import {IndexAliasComponent} from './index-alias/index-alias.component';
import {IndexDetailComponent} from './index-detail/index-detail.component';
import {IndexListComponent} from './index-list/index-list.component';
import {ElasticService} from './services/elastic.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ElasticRoutingModule,
  ],
  declarations: [
    ElasticComponent,
    ElasticStartComponent,
    IndexListComponent,
    ElasticSearchComponent,
    IndexDetailComponent,
    IndexAliasComponent],
  providers: [
    ElasticService,
  ],
})
export class ElasticModule {}
