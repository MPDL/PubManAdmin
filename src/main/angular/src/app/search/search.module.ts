import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../base/common/shared.module';
import {ItemSearchComponent} from './item-search/item-search.component';
import {SearchInfoComponent} from './search-info/search-info.component';
import {SearchRoutingModule} from './search-routing.module';
import {SearchComponent} from './search.component';
import {UserSearchComponent} from './user-search/user-search.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SearchRoutingModule,
  ],
  declarations: [
    SearchComponent,
    UserSearchComponent,
    SearchInfoComponent,
    ItemSearchComponent,
  ],
})
export class SearchModule {}
