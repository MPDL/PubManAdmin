import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User, Grant } from '../../base/common/model';
import { PubmanRestService } from '../../base/services/pubman-rest.service';
import { props } from '../../base/common/admintool.properties';


@Injectable()
export class UsersService extends PubmanRestService {
  constructor(httpc: HttpClient) {
    super(httpc);
  }

  usersUrl: string = props.pubman_rest_url_users;

  users: User[] = [];
  user: User;

  activate(user: User, token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.objectId + '/activate';
    let body = JSON.stringify(user.lastModificationDate);
    let headers = this.addHeaders(token, true);
    return this.getResource('PUT', userUrl, headers, body);
  }

  deactivate(user: User, token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.objectId + '/deactivate';
    let body = JSON.stringify(user.lastModificationDate);
    let headers = this.addHeaders(token, true);
    return this.getResource('PUT', userUrl, headers, body);
  }

  addGrants(user: User, grants: Grant[], token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.objectId + '/add';
    let body = JSON.stringify(grants);
    let headers = this.addHeaders(token, true);
    return this.getResource('PUT', userUrl, headers, body);
  }

  removeGrants(user: User, grants: Grant[], token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.objectId + '/remove';
    let body = JSON.stringify(grants);
    let headers = this.addHeaders(token, true);
    return this.getResource('PUT', userUrl, headers, body);
  }

  changePassword(user: User, token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.objectId + '/password';
    let body = user.password;
    let headers = this.addHeaders(token, false);
    return this.getResource('PUT', userUrl, headers, body);     
  } 

}

