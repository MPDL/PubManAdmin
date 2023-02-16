import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PageNotFoundComponent} from './base/common/page-not-found.component';
import {SharedModule} from './base/common/shared.module';
import {FooterComponent} from './base/footer/footer.component';
import {HomeComponent} from './base/home/home.component';
import {LoginComponent} from './base/login/login.component';
import {MessagesComponent} from './base/messages/messages.component';
import {NavigationComponent} from './base/navigation/navigation.component';
import {AdminGuardService} from './base/services/admin-guard.service';
import {AuthenticationService} from './base/services/authentication.service';
import {ConnectionService} from './base/services/connection.service';
import {ElasticBaseService} from './base/services/elastic-base.service';
import {LoginGuardService} from './base/services/login-guard.service';
import {MessagesService} from './base/services/messages.service';
import {PubmanRestService} from './base/services/pubman-rest.service';
import {ContextsModule} from './contexts/contexts.module';
import {ElasticModule} from './elastic/elastic.module';
import {OrganizationsModule} from './organizations/organizations.module';
import {SearchModule} from './search/search.module';
import {UsersModule} from './users/users.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
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
  providers: [
    ConnectionService,
    AuthenticationService,
    ElasticBaseService,
    MessagesService,
    PubmanRestService,
    AdminGuardService,
    LoginGuardService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  // Order matters !!!
  // AppRouting has to be last in imports [], otherwise the '**' routing will match.
  // Diagnostic only: inspect router configuration
  constructor(
    //    private router: Router,
  ) { // TODO: wieder einkommentieren
    //    console.log('App Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
