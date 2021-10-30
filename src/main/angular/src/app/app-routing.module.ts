import {NgModule} from '@angular/core';
import {Routes, RouterModule, ExtraOptions} from '@angular/router';

import {HomeComponent} from './base/home/home.component';
import {PageNotFoundComponent} from './base/common/page-not-found.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'}, // Default route
  {path: '**', component: PageNotFoundComponent}, // Wildcard route for page not found
];

const routerOptions: ExtraOptions = {
  relativeLinkResolution: 'legacy',
  // enableTracing: true, // TODO: wieder aubauen
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})

export class AppRoutingModule {}
