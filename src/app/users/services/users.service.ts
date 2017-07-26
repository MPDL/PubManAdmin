import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User, Grant } from '../../base/common/model';
import { PubmanRestService } from '../../base/services/pubman-rest.service';
import { props } from '../../base/common/admintool.properties';


@Injectable()
export class UsersService extends PubmanRestService {
  constructor(http: Http) {
    super(http);
  }

  usersUrl: string = props.pubman_rest_url_users;

  users: User[] = [];
  user: User;

  activate(user: User, token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.reference.objectId + '/activate';
    let body = JSON.stringify(user.lastModificationDate);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.getResource(options);
  }

  deactivate(user: User, token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.reference.objectId + '/deactivate';
    let body = JSON.stringify(user.lastModificationDate);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.getResource(options);
  }

  addGrants(user: User, grants: Grant[], token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.reference.objectId + '/add';
    let body = JSON.stringify(grants);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.getResource(options);
  }

  removeGrants(user: User, grants: Grant[], token: string): Observable<User> {
    let userUrl = this.usersUrl + '/' + user.reference.objectId + '/remove';
    let body = JSON.stringify(grants);
    let options = new RequestOptions({
      headers: this.getHeaders(token, true),
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.getResource(options);
  }

}

