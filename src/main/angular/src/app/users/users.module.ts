import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../base/common/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UsersService } from './services/users.service';
import { GrantsComponent } from './grants/grants.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    UsersRoutingModule
  ],
  declarations: [
    UserListComponent,
    UserDetailsComponent,
    GrantsComponent
  ],
  providers: [
    UsersService
  ]
})
export class UsersModule { }
