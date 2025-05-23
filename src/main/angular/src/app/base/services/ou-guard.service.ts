import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Ou} from '../common/model/inge';
import {BaseGuardService} from './base-guard.service';
import {OrganizationsService} from '../../organizations/services/organizations.service';
import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';

@Injectable({
  providedIn: 'root',
})
export class OuGuardService extends BaseGuardService {
  static instance: OuGuardService;

  constructor(
    protected authenticationService: AuthenticationService,
    protected messagesService: MessagesService,
    protected router: Router,
    private organizationsService: OrganizationsService
  ) {
    super(authenticationService, messagesService, router);
    OuGuardService.instance = this;
  }
  protected checkAccess(route: ActivatedRouteSnapshot): Observable<boolean> {
    const ouId: string = route.params['ouId'];

    if (ouId === 'ou_unselected') return of(true);
    if (ouId === 'new ou') return of(true);

    return this.organizationsService.getallChildOus(
      this.authenticationService.loggedInUser.topLevelOuIds,
      null
    ).pipe(
      map((data: Ou[]) => {
        const hasAccess = data.some((ou: Ou) => ouId === ou.objectId);

        if (hasAccess) {
          return true;
        } else {
          this.denyAccess('You are not allowed to see the organization with id ' + ouId, '/organizations');
          return false;
        }
      })
    );
  }
}
