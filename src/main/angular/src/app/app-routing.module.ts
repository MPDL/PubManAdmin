import {NgModule} from '@angular/core';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';
import {PageNotFoundComponent} from './base/common/page-not-found.component';
import {HomeComponent} from './base/home/home.component';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'}, // Default route
  {path: '**', component: PageNotFoundComponent}, // Wildcard route for page not found
];

const routerOptions: ExtraOptions = {enableTracing: true};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
