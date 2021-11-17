import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {User, Ou} from '../../base/common/model/inge';
import {UsersService} from '../services/users.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {environment} from 'environments/environment';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {SearchService} from 'app/base/common/services/search.service';

@Component({
  selector: 'user-list-component',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [],
})
export class UserListComponent implements OnInit, OnDestroy {
  url = environment.restUsers;
  title: string = 'Users';
  users: User[];
  selectedUser: User;
  selectedOu: Ou;

  loggedInUser: User;
  isNewUser: boolean = false;
  token: string;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  userSubscription: Subscription;
  adminSubscription: Subscription;
  total: number;
  pageSize: number = 50;
  currentPage: number = 1;
  usersByName: User[] = [];
  usersByLogin: User[] = [];
  ous: Ou[] = [];
  userNameSearchTerm: string = '';
  userLoginSearchTerm: string = '';
  ouSearchTerm: string = '';

  constructor(private usersService: UsersService,
    private authenticationService: AuthenticationService,
    private organizationService: OrganizationsService,
    private searchService: SearchService,
    private messagesService: MessagesService,
    private router: Router) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);

    if (this.token != null) {
      if (this.isAdmin) {
        this.getAllUsersAsObservable(this.token, this.currentPage);
      } else if (this.loggedInUser != null) {
        this.messagesService.warning('Only admins are allowed to view the list');
        this.router.navigate(['/user', this.loggedInUser.objectId], {queryParams: {token: this.token, admin: false}, skipLocationChange: true});
      }
    }
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
      if (this.selectedOu === undefined) {
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
        this.usersService.filter(this.url, this.token, '?q=affiliation.objectId:' + this.selectedOu.objectId, page)
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

  selectUser(user: User) {
    this.isNewUser = false;
    this.selectedUser = user;
    this.router.navigate(['/user', user.objectId], {queryParams: {token: this.token}, skipLocationChange: true});
  }

  addNewUser() {
    const userid = 'new user';
    this.router.navigate(['/user', userid], {queryParams: {token: 'new'}, skipLocationChange: true});
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  getUsersByName(term: string) {
    if (this.token != null) {
      const convertedSearchTerm = this.searchService.convertSearchTerm(term);
      if (convertedSearchTerm.length > 0) {
        this.returnSuggestedUsersByName(convertedSearchTerm);
      } else {
        this.closeUsersByName();
      }
    } else {
      this.messagesService.warning('no token, no users!');
    }
  }

  getUsersByLogin(term: string) {
    if (this.token != null) {
      const convertedSearchTerm = this.searchService.convertSearchTerm(term);
      if (convertedSearchTerm.length > 0) {
        this.returnSuggestedUsersByLogin(convertedSearchTerm);
      } else {
        this.closeUsersByLogin();
      }
    } else {
      this.messagesService.warning('no token, no users!');
    }
  }

  returnSuggestedOus(term: string) {
    const ous: Ou[] = [];
    const url = environment.restOus;
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationService.filter(url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ou: Ou) => {
            ous.push(ou);
          });
          if (ous.length > 0) {
            this.ous = ous;
          } else {
            this.ous = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  returnSuggestedUsersByName(userName: string) {
    const usersByName: User[] = [];
    const queryString = '?q=name.auto:' + userName;
    this.usersService.filter(this.url, this.token, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((user: User) => usersByName.push(user) );
          if (usersByName.length > 0) {
            this.usersByName = usersByName;
          } else {
            this.usersByName = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  returnSuggestedUsersByLogin(loginName: string) {
    const usersByLogin: User[] = [];
    const queryString = '?q=loginname.auto:' + loginName;
    this.usersService.filter(this.url, this.token, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((user: User) => usersByLogin.push(user) );
          if (usersByLogin.length > 0) {
            this.usersByLogin = usersByLogin;
          } else {
            this.usersByLogin = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  selectOu(ou: Ou) {
    this.selectedOu = ou;
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
    this.title = 'Users of ' + this.selectedOu.name;
    this.closeOus();
  }

  selectUserByName(user: User) {
    this.userNameSearchTerm = user.name;
    if (this.token != null) {
      this.router.navigate(['/user', user.objectId], {queryParams: {token: this.token}, skipLocationChange: true});
    } else {
      this.messagesService.warning('no login, no user !!!');
    }
    this.usersByName = [];
  }

  selectUserByLogin(user: User) {
    this.userLoginSearchTerm = user.loginname;
    if (this.token != null) {
      this.router.navigate(['/user', user.objectId], {queryParams: {token: this.token}, skipLocationChange: true});
    } else {
      this.messagesService.warning('no login, no user !!!');
    }
    this.usersByLogin = [];
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }

  closeUsersByName() {
    this.userNameSearchTerm = '';
    this.usersByName = [];
  }

  closeUsersByLogin() {
    this.userLoginSearchTerm = '';
    this.usersByLogin = [];
  }
}
