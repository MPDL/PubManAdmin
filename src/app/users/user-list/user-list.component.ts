import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { User, Grant } from '../../base/common/model';
import { UsersService } from '../services/users.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: []
})

export class UserListComponent implements OnInit, OnDestroy {

  users: Observable<User[]>;
  selected: User;
  loggedInUser: User;
  isNewUser: boolean = false;
  token: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  loginSubscription: Subscription;
  tokenSubscription: Subscription;
  userSubscription: Subscription;
  adminSubscription: Subscription;


  constructor(
    private usersService: UsersService,
    private loginService: AuthenticationService,
    private messageService: MessagesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.loginSubscription = this.loginService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    this.tokenSubscription = this.loginService.token$.subscribe(token => {
      this.token = token;
    });
    this.userSubscription = this.loginService.user$.subscribe(user => {
      this.loggedInUser = user;
    });
    this.adminSubscription = this.loginService.isAdmin$.subscribe(admin => {
      this.isAdmin = admin;
    });
    if (this.token != null) {
      if (this.isAdmin) {
        this.getAllUsersAsObservable(this.token);
      } else if (this.loggedInUser != null) {
        this.messageService.warning("Only administartors are allowed to view this list");
        this.router.navigate(['/user', this.loggedInUser.userid, this.token]);
      }
    }
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.adminSubscription.unsubscribe();
  }

  getAllUsersAsObservable(token) {
    this.users = this.usersService.listAllUsers(token);
  }

  isSelected(user: User) {
    this.selected = user;
    return user.id === this.selected.id;
  }

  onSelect(user: User) {
    this.isNewUser = false;
    this.selected = user;
    this.router.navigate(['/user', user.userid, this.token]);
  }

  addNewUser() {
    let userid = "new user";
    this.router.navigate(['/user', userid, 'new']);
  }

  delete(user) {
    this.selected = user;
    this.usersService.delete(this.selected, this.token)
      .subscribe(
      data => {
        this.messageService.success('deleted ' + this.selected.userid + ' ' + data);
      },
      error => {
        this.messageService.error(error);
      }
      );
    this.selected = null;
    this.getAllUsersAsObservable(this.token);
  }
}