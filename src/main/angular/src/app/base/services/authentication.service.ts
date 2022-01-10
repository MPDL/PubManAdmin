import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, map, share, shareReplay} from 'rxjs/operators';
import {User} from '../common/model/inge';
import {ConnectionService} from './connection.service';
import {MessagesService} from './messages.service';

@Injectable()
export class AuthenticationService {
  private isAdmin = new BehaviorSubject<boolean>(false);
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private token = new BehaviorSubject<string>(null);
  private user = new BehaviorSubject<User>(null);
  private localAdminOus = new BehaviorSubject<string[]>(null);

  isAdmin$ = this.isAdmin.asObservable().pipe(shareReplay(1));
  isLoggedIn$ = this.isLoggedIn.asObservable().pipe(share());
  token$ = this.token.asObservable().pipe(shareReplay(1));
  user$ = this.user.asObservable().pipe(shareReplay(1));
  localAdminOus$ = this.localAdminOus.asObservable().pipe(shareReplay(1));

  private tokenUrl: string;

  private setToken(token: string) {
    this.token.next(token);
  }

  private setUser(user: User) {
    this.user.next(user);
  }

  private setIsLoggedIn(isLoggedIn: boolean) {
    this.isLoggedIn.next(isLoggedIn);
  }

  private setIsAdmin(isAdmin: boolean) {
    this.isAdmin.next(isAdmin);
  }

  private setLocalAdminOus(ous: string[]) {
    this.localAdminOus.next(ous);
  }

  constructor(
    private connectionService: ConnectionService,
    private http: HttpClient,
    private messagesService: MessagesService,
  ) {
    this.connectionService.connectionService.subscribe((data) => this.tokenUrl = data + '/rest/login');
  }

  login(userName: string, password: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = userName + ':' + password;
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
    this.setLocalAdminOus(null);
  }

  who(token: string | string[]): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', token);
    const whoUrl = this.tokenUrl + '/who';
    let user: User;
    let allowed = false;
    const ous: string[] = [];
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
            allowed = true;
          } else if (user.grantList.find((grant) => grant.role === 'LOCAL_ADMIN')) {
            allowed = true;
            user.grantList.forEach((grant) => {
              if (grant.role === 'LOCAL_ADMIN') {
                ous.push(grant.objectRef);
              }
            });
            this.setLocalAdminOus(ous);
          }
        }
        return allowed ? user : null;
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      })
    );
  }
}
