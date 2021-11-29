import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {environment} from 'environments/environment';
import {Observable, of} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {BasicRO, User} from '../../base/common/model/inge';
import {UsersService} from './users.service';

@Injectable()
export class UserDetailsResolverService implements Resolve<User> {
  constructor(
    private usersService: UsersService,
  ) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User> {
    const url = environment.restUsers;
    const id = activatedRouteSnapshot.params['id'];
    if (id === 'new user') {
      const user = new User();
      user.loginname = 'new user';
      user.grantList = [];
      user.affiliation = new BasicRO();
      user.active = true;
      this.generateRandomPassword(user);
      return of(user);
    } else {
      const token = activatedRouteSnapshot.queryParams['token'];
      let user: User;
      return this.usersService.get(url, id, token)
        .pipe(
          first(),
          map((response) => {
            user = response;
            if (user.grantList) {
              user.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
            }
            return user;
          })
        );
    }
  }

  generateRandomPassword(user: User) {
    this.usersService.generateRandomPassword().subscribe((data) => user.password = data.toString());
  }
}
