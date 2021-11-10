import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {Router} from '@angular/router'; // keep 4 diagnostics

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {AuthenticationComponent} from './base/authentication/authentication.component';
import {MessagesComponent} from './base/messages/messages.component';
import {NavigationComponent} from './base/navigation/navigation.component';
import {HomeComponent} from './base/home/home.component';
import {PageNotFoundComponent} from './base/common/page-not-found.component';
import {SharedModule} from './base/common/shared.module';
import {UsersModule} from './users/users.module';
import {OrganizationsModule} from './organizations/organizations.module';
import {ContextsModule} from './contexts/contexts.module';
import {SearchModule} from './search/search.module';
import {ElasticModule} from './elastic/elastic.module';

import {ConnectionService} from './base/services/connection.service';
import {AuthenticationService} from './base/services/authentication.service';
import {ElasticService} from './base/services/elastic.service';
import {MessagesService} from './base/services/messages.service';
import {PubmanRestService} from './base/services/pubman-rest.service';
import {AdminGuard} from './base/services/admin-guard.service';
import {LoginGuard} from './base/services/login-guard.service';

import {FooterComponent} from './base/footer/footer.component';
import {HttpErrorInterceptor} from './base/common/http-error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    MessagesComponent,
    NavigationComponent,
    HomeComponent,
    PageNotFoundComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatInputModule,
    UsersModule,
    OrganizationsModule,
    ContextsModule,
    SearchModule,
    ElasticModule,
    SharedModule,
    AppRoutingModule,
  ],
  entryComponents: [
    MessagesComponent,
  ],
  providers: [
    ConnectionService,
    AuthenticationService,
    ElasticService,
    MessagesService,
    PubmanRestService,
    AdminGuard,
    LoginGuard,
    {provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  // Order matters !!!
  // AppRouting has to be last in imports [], otherwise the '**' routing will match.
  // Diagnostic only: inspect router configuration
  constructor(
    private router: Router
  ) { // TODO: wieder einkommentieren
    console.log('App Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
