import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/first';

import { UsersService } from './users.service';
import { User, Grant, RO } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class UserDetailsResolverService implements Resolve<User> {
    constructor(private userSvc: UsersService, private router: Router) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        let id = route.params['id'];
        if (id == 'new user') {
            let user = new User();
            user.userid = "new user";
            user.grants = new Array<Grant>();
            user.affiliations = new Array<RO>();
            user.active = false;
            return Observable.of(user);
        } else {
            let token = route.queryParams['token'];
            return this.userSvc.get(props.pubman_rest_url_users, id, token).first(); // add first() to ensure observable completion 
        }
    }
}
