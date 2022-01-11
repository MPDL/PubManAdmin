import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Grant, User} from '../../base/common/model/inge';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class UsersService extends PubmanRestService {
  ctxsUrl: string = environment.restCtxs;
  ousUrl: string = environment.restOus;
  usersUrl: string = environment.restUsers;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
  ) {
    super(connectionService, httpClient);
  }

  activate(user: User, token: string): Observable<User> {
    const url = this.usersUrl + '/' + user.objectId + '/activate';
    const body = user.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }

  deactivate(user: User, token: string): Observable<User> {
    const url = this.usersUrl + '/' + user.objectId + '/deactivate';
    const body = user.lastModificationDate;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }

  addGrants(user: User, grants: Grant[], token: string): Observable<User> {
    const url = this.usersUrl + '/' + user.objectId + '/add';
    const body = JSON.stringify(grants);
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }

  removeGrants(user: User, grants: Grant[], token: string): Observable<User> {
    const url = this.usersUrl + '/' + user.objectId + '/remove';
    const body = JSON.stringify(grants);
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }

  changePassword(user: User, token: string): Observable<User> {
    const url = this.usersUrl + '/' + user.objectId + '/password';
    const body = user.password;
    const headers = this.addHeaders(token, true);
    return this.getResource('PUT', url, headers, body);
  }

  generateRandomPassword(token: string): Observable<string> {
    const url = this.usersUrl + '/generateRandomPassword';
    const headers = this.addHeaders(token, true);
    return this.getStringResource('GET', url, headers);
  }

  addNamesOfGrantRefs(grant: Grant) {
    const ref = grant.objectRef;
    if (ref === undefined) {
    } else {
      if (ref.startsWith('ou')) {
        this.get(this.ousUrl, ref, null).subscribe((data) => grant.objectName = data.name);
      } else {
        if (ref.startsWith('ctx')) {
          this.get(this.ctxsUrl, ref, null).subscribe((data) => grant.objectName = data.name);
        }
      }
    }
  }

  getListOfOusForLocalAdmin(grants: Grant[], searchField: string): string {
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
}
