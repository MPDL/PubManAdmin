import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ous4autoSelect, users4autoSelectByLogin, users4autoSelectByName} from 'app/base/common/model/query-bodies';
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
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data: boolean) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data: string) => this.token = data);
    this.userSubscription = this.authenticationService.loggedInUser$.subscribe((data: User) => this.loggedInUser = data);

    if (this.isAdmin) {
      this.listAllUsers(1);
    } else {
      this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, null, null)
        .subscribe({
          next: (data: Ou[]) => {
            this.listUsers(this.searchService.getListOfOusForLocalAdminFromOus(data, 'affiliation.objectId'), 1);
          },
          error: (e) => this.messagesService.error(e),
        });
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
        next: (data: {list: User[], records: number}) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private listUsers(listOfUserIds: string, page: number) {
    const queryString = '?q=' + listOfUserIds;
    this.usersService.filter(this.usersPath, this.token, queryString, page)
      .subscribe({
        next: (data: {list: User[], records: number}) => {
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
      } else {
        this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, null, null)
          .subscribe({
            next: (data: Ou[]) => {
              this.listUsers(this.searchService.getListOfOusForLocalAdminFromOus(data, 'affiliation.objectId'), page);
            },
            error: (e) => this.messagesService.error(e),
          });
      }
    } else {
      this.listUsers(this.selectedOu.objectId, page);
    }
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

  private returnSuggestedUsersByName(userName: string) {
    if (this.isAdmin) {
      const queryString = '?q=name.auto:' + userName;
      this.usersService.filter(this.usersPath, this.token, queryString, 1)
        .subscribe({
          next: (data: {list: User[], records: number}) => this.usersByName = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, null, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId)
            );
            const body = users4autoSelectByName;
            body.query.bool.filter.terms['affiliation.objectId'] = allOuIds;
            body.query.bool.must.term['name.auto'] = userName;
            this.usersService.query(this.usersPath, this.token, body)
              .subscribe({
                next: (data: {list: User[], records: number}) => this.usersByName = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
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

  private returnSuggestedUsersByLogin(loginName: string) {
    if (this.isAdmin) {
      const queryString = '?q=loginname.auto:' + loginName;
      this.usersService.filter(this.usersPath, this.token, queryString, 1)
        .subscribe({
          next: (data: {list: User[], records: number}) => this.usersByLogin = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, null, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId)
            );
            const body = users4autoSelectByLogin;
            body.query.bool.filter.terms['affiliation.objectId'] = allOuIds;
            body.query.bool.must.term['loginname.auto'] = loginName;
            this.usersService.query(this.usersPath, this.token, body)
              .subscribe({
                next: (data: {list: User[], records: number}) => this.usersByLogin = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
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
    if (this.isAdmin) {
      const queryString = '?q=metadata.name.auto:' + term;
      this.organizationsService.filter(this.ousPath, null, queryString, 1)
        .subscribe({
          next: (data: {list: Ou[], records: number}) => this.ous = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, null, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId)
            );
            const body = ous4autoSelect;
            body.query.bool.filter.terms['objectId'] = allOuIds;
            body.query.bool.must.term['metadata.name.auto'] = term;
            this.organizationsService.query(this.ousPath, null, body)
              .subscribe({
                next: (data: {list: Ou[], records: number}) => this.ous = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  selectOu(ou: Ou) {
    this.selectedOu = ou;
    this.currentPage = 1;
    const queryString = '?q=affiliation.objectId:' + ou.objectId;
    this.usersService.filter(this.usersPath, this.token, queryString, 1)
      .subscribe({
        next: (data: {list: User[], records: number}) => {
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
