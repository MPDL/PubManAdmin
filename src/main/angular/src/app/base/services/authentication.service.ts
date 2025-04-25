import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, map, share, shareReplay} from 'rxjs/operators';
import {User} from '../common/model/inge';
import {ConnectionService} from './connection.service';
import {MessagesService} from './messages.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private isAdmin = new BehaviorSubject<boolean>(false);
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private token = new BehaviorSubject<string>(null);
  private loggedInUser = new BehaviorSubject<User>(null);

  isAdmin$ = this.isAdmin.asObservable().pipe(shareReplay(1));
  isLoggedIn$ = this.isLoggedIn.asObservable().pipe(share());
  token$ = this.token.asObservable().pipe(shareReplay(1));
  loggedInUser$ = this.loggedInUser.asObservable().pipe(shareReplay(1));

  private tokenUrl: string;

  private setToken(token: string) {
    this.token.next(token);
  }

  private setLoggedInUser(user: User) {
    this.loggedInUser.next(user);
  }

  private setIsLoggedIn(isLoggedIn: boolean) {
    this.isLoggedIn.next(isLoggedIn);
  }

  private setIsAdmin(isAdmin: boolean) {
    this.isAdmin.next(isAdmin);
  }

  constructor(
    private connectionService: ConnectionService,
    private http: HttpClient,
    private messagesService: MessagesService,
  ) {
    this.connectionService.connectionService$.subscribe((data: string) => this.tokenUrl = data + '/rest/login');
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
    this.setLoggedInUser(null);
  }

  who(token: string | string[]): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', token);
    const whoUrl = this.tokenUrl + '/who';
    const localAdminTopLevelOuIds: string[] = [];
    let user: User;
    let allowed = false;

    return this.http.request<User>('GET', whoUrl, {
      headers: headers,
      observe: 'body',
    }).pipe(
      map((response) => {
        user = response;
        this.setLoggedInUser(user);
        if (user.grantList != null) {
          if (user.grantList.find((grant) => grant.role === 'SYSADMIN')) {
            this.setIsAdmin(true);
            allowed = true;
          } else if (user.grantList.find((grant) => grant.role === 'LOCAL_ADMIN')) {
            allowed = true;
            user.grantList.forEach((grant) => {
              if (grant.role === 'LOCAL_ADMIN') {
                localAdminTopLevelOuIds.push(grant.objectRef);
              }
            });
            user.topLevelOuIds = localAdminTopLevelOuIds;
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
