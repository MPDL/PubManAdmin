import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {User} from '../common/model/inge';
import {MessagesService} from './messages.service';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

export class Principal {
  user?: User;
  loggedIn: boolean = false;
  isAdmin: boolean = false;
}

@Injectable({
  providedIn: 'root',
})

export class AuthenticationService {
  static instance: AuthenticationService;

  private loginUrl = environment.baseUrl.concat(environment.restLogin);
  private logoutUrl = environment.baseUrl.concat(environment.restLogout);

  principal: BehaviorSubject<Principal>;

  isLoggedInObservable(): Observable<boolean> {
    // Return an observable that completes only after the authentication check
    return this.checkLogin().pipe(
      map(principal => principal.loggedIn)
    );
  }

  get isLoggedIn(): boolean {
    return this.principal.getValue().loggedIn;
  }

  get isAdmin(): boolean {
    return this.principal.getValue().isAdmin;
  }

  get loggedInUser(): User {
    return this.principal.getValue().user;
  }

  constructor(
    private http: HttpClient,
    private messagesService: MessagesService,
    private router: Router,
  ) {
    const principal: Principal = new Principal();
    this.principal = new BehaviorSubject<Principal>(principal);
    this.checkLogin();
    AuthenticationService.instance = this;
  }

  login(userName: string, password: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = userName + ':' + password;

    return this.http.request('POST', this.loginUrl, {
      body: body,
      headers: headers,
      observe: 'response',
      responseType: 'text',
      withCredentials: true,
    }).pipe(
      switchMap((response) => {
        if (response.status === 200) {
          return this.checkLogin();
        } else {
          this.messagesService.error(response.status + ' ' + response.statusText);
          return EMPTY;
        }
      }),
      catchError((error) => {
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      }),
    );
  }

  logout(): void {
    this.http.request('GET', this.logoutUrl, {observe: 'response', responseType: 'text'}).pipe(
      tap(res => {
        if (res.status === 200) {
          console.log('Successfully logged out from backend');
        }
        sessionStorage.clear();
        localStorage.clear();
        this.principal.next(new Principal());
        this.messagesService.info('Logged out successfully');
        this.router.navigate(['/home']);
      }),
    ).subscribe();
  }

  private checkLogin(): Observable<Principal> {
    const localAdminTopLevelOuIds: string[] = [];

    return this.who().pipe(
      map(user => {
        let principal: Principal = new Principal();
        if (user) {
          principal.loggedIn = true;
          principal.user = user;
          if (user.grantList.find((grant: any) => grant.role === 'SYSADMIN')) {
            principal.isAdmin = true;
          } else if (user.grantList.find((grant) => grant.role === 'LOCAL_ADMIN')) {
            user.grantList.forEach((grant) => {
              if (grant.role === 'LOCAL_ADMIN') {
                localAdminTopLevelOuIds.push(grant.objectRef);
              }
            });
            user.topLevelOuIds = localAdminTopLevelOuIds;
          }
          this.principal.next(principal);
          console.log('User:' + JSON.stringify(user, null, 2));
          console.log('Prinzipal:' + JSON.stringify(principal, null, 2));
        }
        return principal;
      }),
      catchError(error => {
        console.log(error);
        return of(new Principal()); // Return a default principal with loggedIn = false
      })
    );
  }

  private who(): Observable<User> {
    const whoUrl = this.loginUrl + '/who';

    return this.http.request<User>('GET', whoUrl, {
      observe: 'body',
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      }),
    );
  }
}
