import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {environment} from 'environments/environment';
import {Observable, of, Subscription} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {User} from '../../base/common/model/inge';
import {UsersService} from './users.service';

@Injectable()
export class UserDetailsResolverService {
  usersPath: string = environment.restUsers;

  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private usersService: UsersService,
  ) {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data: string) => this.token = data);
  }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User> {
    const id = activatedRouteSnapshot.params['id'];

    if (id === 'new user') {
      const user = new User();
      user.loginname = 'new user';
      user.grantList = [];
      user.affiliation = null;
      user.active = true;
      return of(user);
    } else {
      let user: User;
      return this.usersService.get(this.usersPath, id, this.token)
        .pipe(
          first(),
          map((response) => {
            user = response;
            return user;
          })
        );
    }
  }
}
