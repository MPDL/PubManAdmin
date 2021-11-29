import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../base/common/shared.module';
import {GrantsComponent} from './grants/grants.component';
import {UsersService} from './services/users.service';
import {UserDetailsComponent} from './user-details/user-details.component';
import {UserListComponent} from './user-list/user-list.component';
import {UsersRoutingModule} from './users-routing.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    UsersRoutingModule,
  ],
  declarations: [
    UserListComponent,
    UserDetailsComponent,
    GrantsComponent,
  ],
  providers: [
    UsersService,
  ],
})
export class UsersModule {}
