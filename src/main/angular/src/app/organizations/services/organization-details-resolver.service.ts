
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {environment} from 'environments/environment';
import {Observable, of, Subscription, throwError} from 'rxjs';
import {catchError, first} from 'rxjs/operators';
import {Ou} from '../../base/common/model/inge';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationsService} from './organizations.service';

@Injectable()
export class OrganizationDetailsResolverService implements Resolve<any> {
  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationsService,
    private messagesService: MessagesService,
  ) {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Ou> {
    const url = environment.restOus;
    const id = route.params['id'];
    if (id === 'new org') {
      const ou = new Ou();
      ou.parentAffiliation = this.organizationService.makeAffiliation('');
      ou.metadata = this.organizationService.makeMetadata('new ou');
      return of(ou);
    } else {
      return this.organizationService.get(url, id, this.token)
        .pipe(
          first(),
          catchError((error) => {
            this.messagesService.error(error);
            return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
          })
        );
    }
  }
}

