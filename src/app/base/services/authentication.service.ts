import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';

import { User } from '../common/model';
import { MessagesService } from "../services/messages.service";
import { props } from '../common/admintool.properties';

@Injectable()
export class AuthenticationService {

  private token = new BehaviorSubject<string>(null);
  private user = new BehaviorSubject<User>(null);
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private isAdmin = new BehaviorSubject<boolean>(false);

  token$ = this.token.asObservable().share();
  user$ = this.user.asObservable().share();
  isLoggedIn$ = this.isLoggedIn.asObservable().share();
  isAdmin$ = this.isAdmin.asObservable().share();

  setToken(token) {
    this.token.next(token);
  }

  setUser(user) {
    this.user.next(user);
  }

  setIsLoggedIn(isLoggedIn) {
    this.isLoggedIn.next(isLoggedIn);
  }

  setIsAdmin(isAdmin) {
    this.isAdmin.next(isAdmin);
  }

  private tokenUrl: string = props.auth_token_url;

  constructor(
    private http: Http,
    private messages: MessagesService
  ) { }

  login(username, password) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let body = '{"userid": "' + username + '", "password": "' + password + '"}';

    let options = new RequestOptions({
      method: RequestMethod.Post,
      url: this.tokenUrl,
      headers: headers,
      body: body
    });

    return this.http.request(new Request(options))

      .map((response: Response) => {
        let token = response.headers.get('Token');
        if (token != null) {
          this.setToken(token);
          this.setIsLoggedIn(true);
          return token;
        } else {
          this.messages.error(response.statusText);
        }
      });
  }

  logout() {
    this.setIsLoggedIn(false);
    this.setIsAdmin(false);
    this.setToken(null);
    this.setUser(null);
  }

  who(token): Observable<User> {
    let headers = new Headers();
    headers.append('Authorization', token);
    let whoUrl = this.tokenUrl + '/who';
    let options = new RequestOptions({
      method: RequestMethod.Get,
      url: whoUrl,
      headers: headers
    });
    let user: User;
    return this.http.request(new Request(options))
      .map((response: Response) => {
        user = response.json();
        this.setUser(user);
        if (user.grants.find(role => role.role.name == "SYSADMIN")) {
          this.setIsAdmin(true);
        }
        return user;
      });
  }

}
