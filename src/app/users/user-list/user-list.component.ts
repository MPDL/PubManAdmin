import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/of';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { User, Grant } from '../../base/common/model';
import { UsersService } from '../services/users.service';
import { Elastic4usersService } from '../services/elastic4users.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { props } from '../../base/common/admintool.properties';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: []
})

export class UserListComponent implements OnInit, OnDestroy {

  users: User[];
  selected: User;
  selectedUserName: User;
  selectedNameIndex = 0;

  loggedInUser: User;
  isNewUser: boolean = false;
  token: string;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  userSubscription: Subscription;
  adminSubscription: Subscription;
  comingFrom;
  total: number;
  loading: boolean = false;
  pageSize: number = 25;
  currentPage: number = 1;
  usernames: User[] = [];
  userSearchTerm;


  constructor(
    private usersService: UsersService,
    private elastic: Elastic4usersService,
    private loginService: AuthenticationService,
    private messageService: MessagesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
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
        this.getAllUsersAsObservable(this.token, this.currentPage);
      } else if (this.loggedInUser != null) {
        this.messageService.warning("Only administartors are allowed to view this list");
        this.router.navigate(['/user', this.loggedInUser.reference.objectId], { queryParams: { token: this.token }, skipLocationChange: true });
      }
    }
    this.comingFrom = this.route.snapshot.params["id"];
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.adminSubscription.unsubscribe();
  }

  getAllUsersAsObservable(token, page) {
    this.usersService.getAll(props.pubman_rest_url_users, token, page)
      .subscribe(result => {
        this.users = result.list;
        this.total = result.records;
      }, (err) => {
        this.messageService.error(err);
      });
  }

  getPage(page: number) {
    if (this.token != null) {
      this.loading = true;
      this.usersService.getAll(props.pubman_rest_url_users, this.token, page)
        .subscribe(result => {
          this.users = result.list;
          this.total = result.records;
        }, (err) => {
          this.messageService.error(err);
        });
      this.currentPage = page;
      this.loading = false;
    }
  }

  isSelected(user) {
    if (this.comingFrom != null) {
      return this.comingFrom === user.userid;
    } else {
      return false;
    }
  }

  onSelect(user: User) {
    this.isNewUser = false;
    this.selected = user;
    this.router.navigate(['/user', user.reference.objectId], { queryParams: { token: this.token }, skipLocationChange: true });
  }

  addNewUser() {
    let userid = "new user";
    this.router.navigate(['/user', userid], { queryParams: { token: 'new' }, skipLocationChange: true });
  }

  delete(user) {
    this.selected = user;
    let id = this.selected.userid;
    this.usersService.delete(props.pubman_rest_url_users + "/" + this.selected.reference.objectId, this.selected, this.token)
      .subscribe(
      data => {
        this.messageService.success('deleted ' + id + ' ' + data);
      },
      error => {
        this.messageService.error(error);
      }
      );
    let index = this.users.indexOf(this.selected);
    this.users.splice(index, 1);
    this.selected = null;
  }

  getUserNames(a) {
    let userNames: User[] = [];
    this.elastic.users4auto(a, (names) => {
      names.forEach(name => userNames.push(name));
      if (userNames.length > 0) {
        this.usernames = userNames;
      } else {
        this.usernames = [];
      }
    });
  }

  close() {
    this.userSearchTerm = "";
    this.usernames = [];
  }

  select(term) {
    this.userSearchTerm = term.name;
    if (this.token != null) {
          this.router.navigate(['/user', term.reference.objectId], { queryParams: { token: this.token }, skipLocationChange: true });

    } else {
      this.messageService.warning("no login, no user !!!");
    }
    this.usernames = [];
  }

  isSelectedName(user: User) {
    return this.selectedUserName ? this.selectedUserName.userid === user.userid : false;
  }
  scrollDown(event) {
    event.preventDefault();
    if (event.keyCode === 40) {
        this.selectedUserName = this.usernames[++this.selectedNameIndex];
    } else if (event.keyCode === 38) {
        this.selectedUserName = this.usernames[--this.selectedNameIndex];
    } else return;
  }

}