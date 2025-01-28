import {NgModule} from '@angular/core';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';
import {PageNotFoundComponent} from './base/common/page-not-found.component';
import {HomeComponent} from './base/home/home.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'}, // Default route
  {path: '**', component: PageNotFoundComponent}, // Wildcard route for page not found
];

const routerOptions: ExtraOptions = {};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
