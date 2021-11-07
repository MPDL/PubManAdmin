import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {User, OU} from '../../base/common/model/inge';
import {UsersService} from '../services/users.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {environment} from 'environments/environment';
import {mpgOus4auto} from '../../base/common/model/query-bodies';

@Component({
  selector: 'user-list-component',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [],
})
export class UserListComponent implements OnInit, OnDestroy {
  url = environment.rest_users;
  title: string = 'Users';
  users: User[];
  selected: User;
  selectedUserName: User;
  selectedOUName: OU;
  selectedNameIndex = 0;

  loggedInUser: User;
  isNewUser: boolean = false;
  token: string;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  userSubscription: Subscription;
  adminSubscription: Subscription;
  comingFrom: any;
  total: number;
  pageSize: number = 50;
  currentPage: number = 1;
  usernames: User[] = [];
  ounames: OU[] = [];
  userSearchTerm: any;
  ouSearchTerm: any;

  constructor(private usersService: UsersService,
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((token) => this.token = token);
    this.userSubscription = this.authenticationService.user$.subscribe((user) => this.loggedInUser = user);
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((admin) => this.isAdmin = admin);

    if (this.token != null) {
      if (this.isAdmin) {
        this.getAllUsersAsObservable(this.token, this.currentPage);
      } else if (this.loggedInUser != null) {
        this.messagesService.warning('Only admins are allowed to view the list');
        this.router.navigate(['/user', this.loggedInUser.objectId], {queryParams: {token: this.token, admin: false}, skipLocationChange: true});
      }
    }
    this.comingFrom = this.route.snapshot.params['id'];
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.adminSubscription.unsubscribe();
  }

  getAllUsersAsObservable(token: string, page: number) {
    this.usersService.getAll(this.url, token, page)
      .subscribe({
        next: (data) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  getPage(page: number) {
    if (this.token != null) {
      if (this.selectedOUName === undefined) {
        this.usersService.getAll(this.url, this.token, page)
          .subscribe({
            next: (data) => {
              this.users = data.list;
              this.total = data.records;
            },
            error: (e) => this.messagesService.error(e),
          });
        this.currentPage = page;
      } else {
        this.usersService.filter(this.url, this.token, '?q=affiliation.objectId:' + this.selectedOUName.objectId, page)
          .subscribe({
            next: (data) => {
              this.users = data.list;
              this.total = data.records;
            },
            error: (e) => this.messagesService.error(e),
          });
        this.currentPage = page;
      }
    }
  }

  isSelected(user: { loginname: any; }) {
    if (this.comingFrom != null) {
      return this.comingFrom === user.loginname;
    } else {
      return false;
    }
  }

  onSelect(user: User) {
    this.isNewUser = false;
    this.selected = user;
    this.router.navigate(['/user', user.objectId], {queryParams: {token: this.token}, skipLocationChange: true});
  }

  addNewUser() {
    const userid = 'new user';
    this.router.navigate(['/user', userid], {queryParams: {token: 'new'}, skipLocationChange: true});
  }

  delete(user: User) {
    this.selected = user;
    const loginName = this.selected.loginname;
    this.usersService.delete(this.url + '/' + this.selected.objectId, this.selected, this.token)
      .subscribe({
        next: (data) => this.messagesService.success('deleted ' + loginName + ' ' + data),
        error: (e) => this.messagesService.error(e),
      });
    const index = this.users.indexOf(this.selected);
    this.users.splice(index, 1);
    this.selected = null;
  }

  getUserNames(term: string) {
    if (this.token != null) {
      if (term.length > 0 && !term.startsWith('"')) {
        this.returnSuggestedUsers(term);
      } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
        this.returnSuggestedUsers(term);
      }
    } else {
      this.messagesService.warning('no token, no users!');
    }
  }

  returnSuggestedUsers(term: string) {
    const userNames: any[] = [];
    const queryString = '?q=name.auto:' + term;
    this.usersService.filter(this.url, this.token, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((user: User) => userNames.push(user) );
          if (userNames.length > 0) {
            this.usernames = userNames;
          } else {
            this.usernames = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  getOUNames(term: string) {
    const ouNames: OU[] = [];
    const body = mpgOus4auto;
    body.query.bool.must.term['metadata.name.auto'] = term;
    const url = environment.rest_ous;
    this.usersService.query(url, null, body)
      .subscribe({
        next: (data) => {
          data.list.forEach((ou: OU) => ouNames.push(ou));
          if (ouNames.length > 0) {
            this.ounames = ouNames;
          } else {
            this.ounames = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  filter(ou) {
    this.selectedOUName = ou;
    if (this.token != null) {
      this.currentPage = 1;
      this.usersService.filter(this.url, this.token, '?q=affiliation.objectId:' + ou.objectId, 1)
        .subscribe({
          next: (data) => {
            this.users = data.list;
            this.total = data.records;
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.messagesService.warning('no token, no users!');
    }
    this.title = 'Users of ' + this.selectedOUName.name;
    this.closeOUNames();
  }

  closeUserNames() {
    this.userSearchTerm = '';
    this.usernames = [];
  }

  closeOUNames() {
    this.ouSearchTerm = '';
    this.ounames = [];
  }

  select(term) {
    this.userSearchTerm = term.name;
    if (this.token != null) {
      this.router.navigate(['/user', term.objectId], {queryParams: {token: this.token}, skipLocationChange: true});
    } else {
      this.messagesService.warning('no login, no user !!!');
    }
    this.usernames = [];
  }

  isSelectedName(user: User) {
    return this.selectedUserName ? this.selectedUserName.loginname === user.loginname : false;
  }
}
