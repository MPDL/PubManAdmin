import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Grant, Ou, User} from '../../base/common/model/inge';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class UsersService extends PubmanRestService {
  ctxsPath: string = environment.restCtxs;
  ousPath: string = environment.restOus;
  usersPath: string = environment.restUsers;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
    protected organizationsService: OrganizationsService,
  ) {
    super(connectionService, httpClient);
  }

  activate(user: User, token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/activate';
    const body = user.lastModificationDate;
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  deactivate(user: User, token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/deactivate';
    const body = user.lastModificationDate;
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  addGrants(user: User, grants: Grant[], token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/add';
    const body = JSON.stringify(grants);
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  removeGrants(user: User, grants: Grant[], token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/remove';
    const body = JSON.stringify(grants);
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  changePassword(user: User, token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/password';
    const body = user.password;
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  generateRandomPassword(token: string): Observable<string> {
    const path = this.usersPath + '/generateRandomPassword';
    const headers = this.addHeaders(token, true);

    return this.getStringResource('GET', path, headers);
  }

  addNamesOfGrantRefs(grant: Grant) {
    const ref = grant.objectRef;
    if (ref === undefined) {
    } else {
      if (ref.startsWith('ou')) {
        this.get(this.ousPath, ref, null).subscribe((data) => grant.objectName = data.name);
      } else {
        if (ref.startsWith('ctx')) {
          this.get(this.ctxsPath, ref, null).subscribe((data) => grant.objectName = data.name);
        }
      }
    }
  }

  addOuPathOfGrantRefs(grant: Grant) {
    const ref = grant.objectRef;
    if (ref === undefined) {
    } else {
      if (ref.startsWith('ou')) {
        this.get(this.ousPath, grant.objectRef, null).subscribe((data) => grant.parentName = data.parentAffiliation.name);
      } else {
        if (ref.startsWith('ctx')) {
          let ctx: any;
          this.get(this.ctxsPath, ref, null).subscribe((data) => {
            ctx = data;
            this.organizationsService.getOuPath(ctx.responsibleAffiliations[0].objectId, null).subscribe((data) => grant.parentName = data);
          });
        }
      }
    }
  }

  getListOfOusForLocalAdminFromGrants(grants: Grant[], searchField: string): string {
    let lst: string = '';
    grants.forEach((grant) => {
      if (grant.role === 'LOCAL_ADMIN') {
        if (lst.length > 0) {
          lst = lst + '+';
        }
        lst = lst + searchField + ':' + grant.objectRef;
      }
    });

    return lst;
  }

  getListOfOusForLocalAdminFromOus(ous: Ou[], searchField: string): string {
    let lst: string = '';
    ous.forEach((ou) => {
      if (lst.length > 0) {
        lst = lst + '+';
      }
      lst = lst + searchField + ':' + ou.objectId;
    });

    return lst;
  }
}
