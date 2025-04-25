import {Routes} from '@angular/router';
import {PageNotFoundComponent} from './base/common/page-not-found.component';
import {HomeComponent} from './base/home/home.component';
import {LoginGuardService} from './base/services/login-guard.service';
import {UserDetailsResolverService} from './users/services/user-details-resolver.service';
import {UserDetailsComponent} from './users/user-details/user-details.component';
import {UserListComponent} from './users/user-list/user-list.component';
import {ContextListComponent} from './contexts/context-list/context-list.component';
import {ContextDetailsComponent} from './contexts/context-details/context-details.component';
import {ContextDetailsResolverService} from './contexts/services/context-details-resolver.service';
import {OrganizationTreeComponent} from './organizations/organization-tree/organization-tree.component';
import {OrganizationDetailsComponent} from './organizations/organization-details/organization-details.component';
import {OrganizationDetailsResolverService} from './organizations/services/organization-details-resolver.service';

export const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'}, // Default route

  // Users routes
  {path: 'users', component: UserListComponent, canActivate: [LoginGuardService]},
  {path: 'users/:ouId/:page', component: UserListComponent, canActivate: [LoginGuardService]},
  {path: 'user/:id', component: UserDetailsComponent, canActivate: [LoginGuardService], resolve: {user: UserDetailsResolverService}},

  // Contexts routes
  {path: 'contexts', component: ContextListComponent, canActivate: [LoginGuardService]},
  {path: 'contexts/:ouId/:page', component: ContextListComponent, canActivate: [LoginGuardService]},
  {path: 'context/:id', component: ContextDetailsComponent, canActivate: [LoginGuardService], resolve: {ctx: ContextDetailsResolverService}},

  // Organizations routes
  {path: 'organizations', component: OrganizationTreeComponent, canActivate: [LoginGuardService]},
  {path: 'organizations/:ouId', component: OrganizationTreeComponent, canActivate: [LoginGuardService]},
  {path: 'organization/:id', component: OrganizationDetailsComponent, canActivate: [LoginGuardService], resolve: {ou: OrganizationDetailsResolverService}},

  {path: '**', component: PageNotFoundComponent}, // Wildcard route for page not found
];
