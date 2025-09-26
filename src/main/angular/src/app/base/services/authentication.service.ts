import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, finalize, Observable, of, switchMap, tap, throwError} from 'rxjs';
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
      map(principal => principal.loggedIn),
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

  logoutInProgress = new BehaviorSubject<boolean>(false);

  logout(): Observable<void> {
    this.logoutInProgress.next(true);
    return this.http.request('GET', this.logoutUrl, {
      observe: 'response', responseType: 'text', withCredentials: true,
    }).pipe(
      tap(res => {
        if (res.status === 200) {
          console.log('Successfully logged out from backend');
        }
        // Client-Zustand sofort zurücksetzen
        sessionStorage.clear();
        localStorage.clear();
        this.principal.next(new Principal());
        this.messagesService.info('Logged out successfully');
      }),
      finalize(() => this.logoutInProgress.next(false)),
      map(() => void 0),
    );
  }

  checkLogin(): Observable<Principal> {
    const localAdminTopLevelOuIds: string[] = [];

    // Wenn gerade ein Logout läuft, keinen Server-Check durchführen und garantiert "ausgeloggt" melden
    if (this.logoutInProgress.getValue()) {
      const principal = new Principal();
      this.principal.next(principal);
      return of(principal);
    }

    return this.who().pipe(
      map(user => {
        // Standardmäßig: ausgeloggt
        let principal = new Principal();

        if (!user?.active) {
          // nicht aktiv → ausgeloggt bleiben
          this.principal.next(principal);
          return principal;
        }

        // Benutzer ist aktiv → prüfen, ob berechtigt
        const grants = user.grantList || [];
        if (grants.length === 0) {
          this.messagesService.error('User has no permissions (grantList is undefined or empty)');
          // KEIN logout() hier; einfach ausgeloggt signalisieren
          this.principal.next(principal);
          return principal;
        }

        // Berechtigt → eingeloggt setzen
        principal.loggedIn = true;
        principal.user = user;

        if (grants.find((g: any) => g.role === 'SYSADMIN')) {
          principal.isAdmin = true;
        } else if (grants.find((g: any) => g.role === 'LOCAL_ADMIN')) {
          grants.forEach((grant: any) => {
            if (grant.role === 'LOCAL_ADMIN') {
              localAdminTopLevelOuIds.push(grant.objectRef);
            }
          });
          (user as any).topLevelOuIds = localAdminTopLevelOuIds;
        } else {
          // keine passende Rolle → ausgeloggt signalisieren
          this.messagesService.error('User is no admin oder local admin.');
          principal = new Principal();
          this.principal.next(principal);
          return principal;
        }

        this.principal.next(principal);
        console.log('User:' + JSON.stringify(user, null, 2));
        console.log('Prinzipal:' + JSON.stringify(principal, null, 2));
        return principal;
      }),
      catchError(error => {
        console.log(error);
        const principal = new Principal();
        this.principal.next(principal);
        return of(principal); // Return a default principal with loggedIn = false
      }),
    );
  }

  private who(): Observable<User> {
    const whoUrl = this.loginUrl + '/who';
    const headers = new HttpHeaders({
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    });
    const urlWithTs = `${whoUrl}?ts=${Date.now()}`; // Cache-Buster

    return this.http.request<User>('GET', urlWithTs, {
      observe: 'body',
      withCredentials: true,
      headers,
    }).pipe(
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(JSON.stringify(error) || 'UNKNOWN ERROR!'));
      }),
    );
  }
}
