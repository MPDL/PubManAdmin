import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {environment} from 'environments/environment';
import {Observable, of, Subscription} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {Ou} from '../../base/common/model/inge';
import {OrganizationsService} from './organizations.service';

@Injectable()
export class OrganizationDetailsResolverService  {
  ousPath: string = environment.restOus;

  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private organizationsService: OrganizationsService,
  ) {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data: string) => this.token = data);
  }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Ou> {
    const id = activatedRouteSnapshot.params['id'];

    if (id === 'new ou') {
      const ou = new Ou();
      ou.parentAffiliation = this.organizationsService.makeAffiliation('', '');
      ou.metadata = this.organizationsService.makeMetadata('new ou');
      return of(ou);
    } else {
      let ou: Ou;
      return this.organizationsService.get(this.ousPath, id, this.token)
        .pipe(
          first(),
          map((response) => {
            ou = response;
            return ou;
          })
        );
    }
  }
}
