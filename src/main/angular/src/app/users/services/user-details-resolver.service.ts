import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {UsersService} from './users.service';
import {User, BasicRO} from '../../base/common/model/inge';
import {environment} from 'environments/environment';

@Injectable()
export class UserDetailsResolverService implements Resolve<User> {
  constructor(
    private usersService: UsersService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    const url = environment.rest_users;
    const id = route.params['id'];
    if (id === 'new user') {
      const user = new User();
      user.loginname = 'new user';
      user.grantList = [];
      user.affiliation = new BasicRO();
      user.active = false;
      this.generateRandomPassword(user);
      return of(user);
    } else {
      const token = route.queryParams['token'];
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
