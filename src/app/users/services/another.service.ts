import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import { MessagesService } from '../../base/services/messages.service';
import { User } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class AnotherService {

  users: Observable<User[]>
  private _users: BehaviorSubject<User[]>;
  private baseUrl: string;
  private userStore: {
    users: User[]
  };

  constructor(private http: Http,
    private messages: MessagesService) {
    this.baseUrl = props.pubman_rest_url + "/users";
    this.userStore = { users: [] };
    this._users = <BehaviorSubject<User[]>>new BehaviorSubject([]);
    this.users = this._users.asObservable();
  }

  getAll(token: string) {
    let headers = new Headers();
    headers.set("Authorization", token);
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: this.baseUrl
    });
    return this.http.request(new Request(options))
      .map(response => {
        this.userStore.users = response.json();
        this._users.next(Object.assign({}, this.userStore).users);
      },
      error => this.messages.error(error));
  }

  getUser(id: string, token: string) {
    let headers = new Headers();
    headers.set("Authorization", token);
    let userUrl = this.baseUrl + '/' + id;
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Get,
      url: userUrl
    });
    return this.http.request(new Request(options))
      .map(response => {
        let notFound = true;
        this.userStore.users.forEach((user, index) => {
          if (user.userid === response.json().userid) {
            this.userStore.users[index] = response.json();
            notFound = false;
          }
        });

        if (notFound) {
          this.userStore.users.push(response.json());
        }
        this._users.next(Object.assign({}, this.userStore).users);
      },
      error => this.messages.error(error));
  }

  postUser(user: User, token: string) {
    let headers = new Headers();
    headers.set("Authorization", token);
    headers.append('Content-Type', 'application/json');
    let body = JSON.stringify(user);

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Post,
      url: this.baseUrl,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        this.userStore.users.push(response.json());
        this._users.next(Object.assign({}, this.userStore).users);
      },
      error => this.messages.error(error));
  }

  putUser(user: User, token: string) {
    let headers = new Headers();
    headers.set("Authorization", token);
    headers.append('Content-Type', 'application/json');
    let userUrl = this.baseUrl + '/' + user.reference.objectId;
    let body = JSON.stringify(user);

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Put,
      url: userUrl,
      body: body
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        this.userStore.users.forEach((user, index) => {
          if (user.userid === response.json().userid) {
            this.userStore.users[index] = response.json();
          }
        });
        this._users.next(Object.assign({}, this.userStore).users);
      },
      error => this.messages.error(error));
  }

  delete(user2delete: User, token: string) {
    let headers = new Headers();
    headers.set("Authorization", token);
    let userUrl = this.baseUrl + '/' + user2delete.reference.objectId;

    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Delete,
      url: userUrl
    });
    return this.http.request(new Request(options))
      .map((response: Response) => {
        this.userStore.users.forEach((user, index) => {
          if (user.userid === user2delete.userid) {
            this.userStore.users.splice(index, 1);
          }
        });
        this._users.next(Object.assign({}, this.userStore).users);
      },
      error => this.messages.error(error));
  }

}
