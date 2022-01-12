import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {Ou, User} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {UsersService} from '../services/users.service';

@Component({
  selector: 'user-list-component',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [],
})
export class UserListComponent implements OnInit, OnDestroy {
  ousPath: string = environment.restOus;
  usersPath: string = environment.restUsers;

  title: string = 'Users';

  users: User[];
  selectedUser: User;

  selectedOu: Ou;
  ous: Ou[] = [];
  ouSearchTerm: string = '';

  total: number;
  pageSize: number = 50;
  currentPage: number = 1;

  usersByName: User[] = [];
  userNameSearchTerm: string = '';

  usersByLogin: User[] = [];
  userLoginSearchTerm: string = '';

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.loggedInUser$.subscribe((data) => this.loggedInUser = data);

    if (this.token != null) {
      if (this.isAdmin) {
        this.listAllUsers(1);
      } else if (this.loggedInUser != null) {
        this.listUsers(this.usersService.getListOfOusForLocalAdmin(this.loggedInUser.grantList, 'affiliation.objectId'), 1);
      }
    } else {
      this.messagesService.warning('no token, no users!');
    }
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private listAllUsers(page: number) {
    this.usersService.getAll(this.usersPath, this.token, page)
      .subscribe({
        next: (data) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private listUsers(searchTerm: string, page: number) {
    this.usersService.filter(this.usersPath, this.token, '?q=' + searchTerm, page)
      .subscribe({
        next: (data) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  getPage(page: number) {
    if (this.selectedOu === undefined) {
      if (this.isAdmin) {
        this.listAllUsers(page);
      } else if (this.loggedInUser != null) {
        this.listUsers(this.usersService.getListOfOusForLocalAdmin(this.loggedInUser.grantList, 'affiliation.objectId'), page);
      }
    } else {
      this.listUsers(this.selectedOu.objectId, page);
    }
    this.users.forEach((user) => {
      console.log(user.name + ':' + user.affiliation.objectId +',' + user.affiliation.creator +',' + user.affiliation.creationDate +',' + user.affiliation.lastModificationDate +',' + user.affiliation.modifier + ',' + user.affiliation.name);
    });
    this.currentPage = page;
  }

  gotoUser(user: User) {
    this.selectedUser = user;
    this.router.navigate(['/user', this.selectedUser.objectId]);
  }

  addNewUser() {
    this.router.navigate(['/user', 'new user']);
  }

  getUsersByName(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedUsersByName(convertedSearchTerm);
    } else {
      this.closeUsersByName();
    }
  }

  getUsersByLogin(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedUsersByLogin(convertedSearchTerm);
    } else {
      this.closeUsersByLogin();
    }
  }

  private returnSuggestedUsersByName(userName: string) {
    const queryString = '?q=name.auto:' + userName;
    this.usersService.filter(this.usersPath, this.token, queryString, 1)
      .subscribe({
        next: (data) => {
          const usersByName: User[] = [];
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

  private returnSuggestedUsersByLogin(loginname: string) {
    const queryString = '?q=loginname.auto:' + loginname;
    this.usersService.filter(this.usersPath, this.token, queryString, 1)
      .subscribe({
        next: (data) => {
          const usersByLogin: User[] = [];
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

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  private returnSuggestedOus(term: string) {
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationsService.filter(this.ousPath, null, queryString, 1)
      .subscribe({
        next: (data) => {
          const ous: Ou[] = [];
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

  selectOu(ou: Ou) {
    this.selectedOu = ou;
    this.currentPage = 1;
    this.usersService.filter(this.usersPath, this.token, '?q=affiliation.objectId:' + ou.objectId, 1)
      .subscribe({
        next: (data) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
    this.title = 'Users of ' + this.selectedOu.name;
    this.closeOus();
  }

  selectUserByName(user: User) {
    this.userNameSearchTerm = user.name;
    this.router.navigate(['/user', user.objectId]);
    this.usersByName = [];
  }

  selectUserByLogin(user: User) {
    this.userLoginSearchTerm = user.loginname;
    this.router.navigate(['/user', user.objectId]);
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
