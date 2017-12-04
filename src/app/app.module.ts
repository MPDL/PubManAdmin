import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthenticationComponent } from './base/authentication/authentication.component';
import { MessagesComponent } from './base/messages/messages.component';
import { NavigationComponent } from './base/navigation/navigation.component';
import { HomeComponent } from './base/home/home.component';
import { PageNotFoundComponent } from './base/common/page-not-found.component';
import { props } from './base/common/admintool.properties';
import { SharedModule } from './base/shared/shared.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ContextsModule } from './contexts/contexts.module';
import { SearchModule } from './search/search.module';
import { IndicesModule } from './more/indices.module';

import { AuthenticationService } from './base/services/authentication.service';
import { ElasticService } from './base/services/elastic.service';
import { MessagesService } from './base/services/messages.service';
import { NavigationService } from './base/services/navigation.service';
import { PubmanRestService } from './base/services/pubman-rest.service';
import { AdminGuard } from './base/services/admin-guard.service';
import { LoginGuard } from './base/services/login-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    MessagesComponent,
    NavigationComponent,
    HomeComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    UsersModule,
    OrganizationsModule,
    ContextsModule,
    SearchModule,
    IndicesModule,
    SharedModule,
    AppRoutingModule
  ],
  providers: [
    AuthenticationService,
    ElasticService,
    MessagesService,
    NavigationService,
    PubmanRestService,
    AdminGuard,
    LoginGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  // Order matters !!!
  // AppRouting has to be last in imports [], otherwise the '**' routing will match.
  // Diagnostic only: inspect router configuration
  /*
  constructor(router: Router) {
    console.log('App Routes: ', JSON.stringify(router.config, undefined, 2));
  }
  */
 }
