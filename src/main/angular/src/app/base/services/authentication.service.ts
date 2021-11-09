import {Observable, BehaviorSubject, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {share, shareReplay} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {User} from '../common/model/inge';
import {MessagesService} from './messages.service';
import {ConnectionService} from './connection.service';

@Injectable()
export class AuthenticationService {
  private tokenUrl;
  private token = new BehaviorSubject<string>(null);
  private user = new BehaviorSubject<User>(null);
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private isAdmin = new BehaviorSubject<boolean>(false);

  token$ = this.token.asObservable().pipe(share());
  user$ = this.user.asObservable().pipe(share());
  isLoggedIn$ = this.isLoggedIn.asObservable().pipe(share());
  isAdmin$ = this.isAdmin.asObservable().pipe(shareReplay(1));

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

  constructor(
    private http: HttpClient,
    private messagesService: MessagesService,
    private connectionService: ConnectionService
  ) {
    this.connectionService.connectionService.subscribe((data) => this.tokenUrl = data + '/rest/login');
  }

  login(username, password) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // let body = ''' + username + ':' + password + ''';
    const body = username + ':' + password;
    return this.http.request('POST', this.tokenUrl, {
      body: body,
      headers: headers,
      observe: 'response',
      responseType: 'text',
    }).pipe(
      map((response) => {
        const token = response.headers.get('Token');
        if (token != null) {
          this.setToken(token);
          this.setIsLoggedIn(true);
          return token;
        } else {
          this.messagesService.error(response.status + ' ' + response.statusText);
        }
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }

  logout() {
    this.setIsLoggedIn(false);
    this.setIsAdmin(false);
    this.setToken(null);
    this.setUser(null);
  }

  who(token): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', token);
    const whoUrl = this.tokenUrl + '/who';
    let user: User;
    return this.http.request<User>('GET', whoUrl, {
      headers: headers,
      observe: 'body',
    }).pipe(
      map((response) => {
        user = response;
        this.setUser(user);
        if (user.grantList != null) {
          if (user.grantList.find((grant) => grant.role === 'SYSADMIN')) {
            this.setIsAdmin(true);
          }
        }
        return user;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }
}
