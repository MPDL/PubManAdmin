import {enableProdMode, importProvidersFrom, inject, provideAppInitializer} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {AppComponent} from 'app/app.component';
import {environment} from 'environments/environment';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {LoginGuardService} from 'app/base/services/login-guard.service';
import {MessagesService} from 'app/base/services/messages.service';
import {PubmanRestService} from 'app/base/services/pubman-rest.service';
import {routes} from 'app/app-routes';
import {lastValueFrom} from 'rxjs';


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    importProvidersFrom(
      MatDialogModule,
      MatInputModule,
    ),
    AuthenticationService,
    MessagesService,
    PubmanRestService,
    LoginGuardService,
    provideAppInitializer(async () => {
      const authenticationService = inject(AuthenticationService);
      await lastValueFrom(authenticationService.checkLogin())
    })
  ]
})
  .then((success) => console.log(`Bootstrap success`))
  .catch((error) => console.error(error));
