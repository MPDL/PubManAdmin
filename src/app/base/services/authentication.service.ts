import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/shareReplay';

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
  isAdmin$ = this.isAdmin.asObservable().shareReplay(1);

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

  private tokenUrl: string = props.pubman_rest_url + "/login";

  constructor(
    private http: HttpClient,
    private messages: MessagesService
  ) { }

  login(username, password) {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    let body = '"' + username + ":" + password + '"';
    return this.http.request('POST', this.tokenUrl, {
      body: body,
      headers: headers,
      observe: 'response',
      responseType: 'text'
    }).map((response) => {
      let token = response.headers.get('Token');
      if (token != null) {
        this.setToken(token);
        this.setIsLoggedIn(true);
        return token;
      } else {
        this.messages.error(response.status + " " + response.statusText);
      }
    }).catch(err => Observable.throw(JSON.stringify(err) || "UNKNOWN ERROR!"));
  }

  logout() {
    this.setIsLoggedIn(false);
    this.setIsAdmin(false);
    this.setToken(null);
    this.setUser(null);
  }

  who(token): Observable<User> {
    let headers = new HttpHeaders().set('Authorization', token);
    let whoUrl = this.tokenUrl + '/who';
    let user: User;
    return this.http.request<User>('GET', whoUrl, {
      headers: headers,
      observe: 'body'
    }).map((response) => {
        user = response;
        this.setUser(user);
        if (user.grantList.find(grant => grant.role == "SYSADMIN")) {
          this.setIsAdmin(true);
        }
        return user;
      }).catch(err => Observable.throw(JSON.stringify(err) || "UNKNOWN ERROR!"));
  }

}
