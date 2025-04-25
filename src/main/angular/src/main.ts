import {enableProdMode, importProvidersFrom} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {AppComponent} from 'app/app.component';
import {environment} from 'environments/environment';
import {AdminGuardService} from 'app/base/services/admin-guard.service';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {ConnectionService} from 'app/base/services/connection.service';
import {LoginGuardService} from 'app/base/services/login-guard.service';
import {MessagesService} from 'app/base/services/messages.service';
import {PubmanRestService} from 'app/base/services/pubman-rest.service';
import {routes} from 'app/app-routes';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    importProvidersFrom(
      MatDialogModule,
      MatInputModule,
    ),
    ConnectionService,
    AuthenticationService,
    MessagesService,
    PubmanRestService,
    AdminGuardService,
    LoginGuardService
  ]
})
  .then((success) => console.log(`Bootstrap success`))
  .catch((error) => console.error(error));
