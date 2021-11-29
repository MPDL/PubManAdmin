import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuardService} from 'app/base/services/login-guard.service';
import {UserDetailsResolverService} from './services/user-details-resolver.service';
import {UserDetailsComponent} from './user-details/user-details.component';
import {UserListComponent} from './user-list/user-list.component';

const routes: Routes = [
  {path: 'users', component: UserListComponent, canActivate: [LoginGuardService]},
  {path: 'user/:id', component: UserDetailsComponent, canActivate: [LoginGuardService], resolve: {user: UserDetailsResolverService}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserDetailsResolverService],
})
export class UsersRoutingModule {}
