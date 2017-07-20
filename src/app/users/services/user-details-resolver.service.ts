import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { UsersService } from './users.service';
import { User, Grant, Affiliation } from '../../base/common/model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/first';

@Injectable()
export class UserDetailsResolverService implements Resolve<User> {
    constructor(private userSvc: UsersService, private router: Router) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        let id = route.params['id'];
        if (id == 'new user') {
            let user = new User();
            user.userid = "new user";
            user.grants = new Array<Grant>();
            user.affiliations = new Array<Affiliation>();
            user.active = false;
            return Observable.of(user);
        } else {
            let token = route.queryParams['token'];
            return this.userSvc.getUser(id, token).first(); // add first() to ensure observable completion 
        }
    }
}
