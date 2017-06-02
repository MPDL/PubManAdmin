import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ElasticService } from '../../base/services/elastic.service';
import { User, Grant } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';


@Injectable()
export class UsersService {
  constructor(
    private http: Http,
    private elastic: ElasticService
    ) { }

  usersUrl: string = props.pubman_rest_url + '/users';

  users: User[];
  user: User;

  listAllUsers(token: string): Observable<User[]> {
    let headers = new Headers();
    headers.set("Authorization", token);
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: this.usersUrl
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        this.users = response.json();
        this.users.sort((a, b) => {
          if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        return this.users;
      });
  }

  getUser(id: string, token: string): Observable<User> {
    let headers = new Headers();
    headers.set("Authorization", token);
    let userUrl = this.usersUrl + '/' + id;
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: userUrl
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        this.user = response.json();
        return this.user;
      });
  }

  postUser(user: User, token: string): Observable<number> {
    let headers = new Headers();
    headers.set("Authorization", token);
    headers.append('Content-Type', 'application/json');
    let body = JSON.stringify(user);

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Post,
      url: this.usersUrl,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let status = response.status;
        return status;
      });
  }

  putUser(user: User, token: string): Observable<number> {
    let headers = new Headers();
    headers.set("Authorization", token);
    headers.append('Content-Type', 'application/json');
    let userUrl = this.usersUrl + '/' + user.reference.objectId;
    let body = JSON.stringify(user);

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let status = response.status;
        return status;
      });
  }

  addGrants(user: User, grants: Grant[], token: string): Observable<number> {
    let headers = new Headers();
    headers.set("Authorization", token);
    headers.append('Content-Type', 'application/json');
    let userUrl = this.usersUrl + '/' + user.reference.objectId + '/add';
    let body = JSON.stringify(grants);

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let status = response.status;
        return status;
      });
  }

  removeGrants(user: User, grants: Grant[], token: string): Observable<number> {
    let headers = new Headers();
    headers.set("Authorization", token);
    headers.append('Content-Type', 'application/json');
    let userUrl = this.usersUrl + '/' + user.reference.objectId + '/remove';
    let body = JSON.stringify(grants);

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let status = response.status;
        return status;
      });
  }

  delete(user: User, token: string): Observable<number> {
    let headers = new Headers();
    headers.set("Authorization", token);
    let userUrl = this.usersUrl + '/' + user.reference.objectId;

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Delete,
      url: userUrl
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        let status = response.status;
        return status;
      });
  }
}

