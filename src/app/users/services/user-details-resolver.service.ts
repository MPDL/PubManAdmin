import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

import { UsersService } from './users.service';
import { User, Grant, BasicRO } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class UserDetailsResolverService implements Resolve<User> {
    constructor(private userSvc: UsersService, private router: Router) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        const id = route.params['id'];
        if (id === 'new user') {
            const user = new User();
            user.loginname = 'new user';
            user.password = 'hard2Remember';
            user.grantList = new Array<Grant>();
            user.affiliation = new BasicRO();
            user.active = false;
            return of(user);
        } else {
            const token = route.queryParams['token'];
            return this.userSvc.get(props.pubman_rest_url_users, id, token)
                .pipe(
                    first()
                );
        }
    }
}
