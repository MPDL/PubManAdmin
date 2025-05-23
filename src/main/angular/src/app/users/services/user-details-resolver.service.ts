import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {environment} from 'environments/environment';
import {Observable, of} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {User} from '../../base/common/model/inge';
import {UsersService} from './users.service';

@Injectable({
  providedIn: 'root',
})
export class UserDetailsResolverService {
  usersPath: string = environment.restUsers;

  constructor(
    private usersService: UsersService,
  ) {
  }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User> {
    const id = activatedRouteSnapshot.params['userId'];

    if (id === 'new user') {
      const user = new User();
      user.loginname = 'new user';
      user.grantList = [];
      user.affiliation = null;
      user.active = true;
      return of(user);
    } else {
      let user: User;
      return this.usersService.get(this.usersPath, id)
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
