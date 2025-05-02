import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {environment} from 'environments/environment';
import {Observable, of} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {Ou} from '../../base/common/model/inge';
import {OrganizationsService} from './organizations.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationDetailsResolverService {
  ousPath: string = environment.restOus;

  constructor(
    private organizationsService: OrganizationsService,
  ) {
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
      return this.organizationsService.get(this.ousPath, id)
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
