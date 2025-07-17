
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ous4autoSelect, users4autoSelectByLogin, users4autoSelectByName} from 'app/base/common/model/query-bodies';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Ou, User} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {UsersService} from '../services/users.service';
import {NgxPaginationModule} from 'ngx-pagination';
import {ClickOutsideDirective} from '../../base/directives/clickoutside.directive';

@Component({
  selector: 'user-list-component',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgxPaginationModule,
    ClickOutsideDirective
]
})
export class UserListComponent implements OnInit {
  ousPath: string = environment.restOus;
  usersPath: string = environment.restUsers;

  title: string = 'Users';
  dummyOu: string = 'ou_unselected';

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

  constructor(
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private usersService: UsersService,
  ) {
  }

  ngOnInit() {
    const ouId: string = this.activatedRoute.snapshot.params['ouId'];
    const page: string = this.activatedRoute.snapshot.params['page'];

    if (page != null) {
      this.currentPage = +page;
    } else {
      this.currentPage = 1;
    }

    if (ouId != null && ouId !== this.dummyOu) {
      this.organizationsService.get(this.ousPath, ouId)
        .subscribe({
          next: (data: Ou) => {
            this.selectOu(data);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else if (page != null) {
      this.getPage(this.currentPage);
    } else if (this.authenticationService.isAdmin) {
      this.listAllUsers(this.currentPage);
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            this.listUsers(this.searchService.getListOfOusForLocalAdminFromOus(data, 'affiliation.objectId'), 1);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  addNewUser() {
    this.router.navigate(['/user', 'new user']);
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }

  closeUsersByLogin() {
    this.userLoginSearchTerm = '';
    this.usersByLogin = [];
  }

  closeUsersByName() {
    this.userNameSearchTerm = '';
    this.usersByName = [];
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
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

  getUsersByName(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedUsersByName(convertedSearchTerm);
    } else {
      this.closeUsersByName();
    }
  }

  gotoFilteredOu(ou: Ou) {
    this.currentPage = 1;
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    this.router.navigate(['/users', ou.objectId, this.currentPage]);
  }

  gotoFilteredPage(page: number) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    this.router.navigate(['/users', this.selectedOu != null ? this.selectedOu.objectId : this.dummyOu, page]);
  }

  gotoUser(user: User) {
    this.selectedUser = user;
    this.router.navigate(['/user', this.selectedUser.objectId]);
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

  private getPage(page: number) {
    if (this.selectedOu === undefined) {
      if (this.authenticationService.isAdmin) {
        this.listAllUsers(page);
      } else {
        this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
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
  }

  private listAllUsers(page: number) {
    this.usersService.getAll(this.usersPath, page)
      .subscribe({
        next: (data: { list: User[], records: number }) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private listUsers(listOfOuIds: string, page: number) {
    const queryString = '?q=' + listOfOuIds;
    this.usersService.filter(this.usersPath, queryString, page)
      .subscribe({
        next: (data: { list: User[], records: number }) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private returnSuggestedOus(term: string) {
    if (this.authenticationService.isAdmin) {
      const queryString = '?q=metadata.name.auto:' + term;
      this.organizationsService.filter(this.ousPath, queryString, 1)
        .subscribe({
          next: (data: { list: Ou[], records: number }) => this.ous = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId),
            );
            const body = ous4autoSelect;
            body.query.bool.filter.terms['objectId'] = allOuIds;
            body.query.bool.must.term['metadata.name.auto'] = term.toLowerCase();
            this.organizationsService.query(this.ousPath, body)
              .subscribe({
                next: (data: { list: Ou[], records: number }) => this.ous = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private returnSuggestedUsersByLogin(loginName: string) {
    if (this.authenticationService.isAdmin) {
      const queryString = '?q=loginname.auto:' + loginName;
      this.usersService.filter(this.usersPath, queryString, 1)
        .subscribe({
          next: (data: { list: User[], records: number }) => this.usersByLogin = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId),
            );
            const body = users4autoSelectByLogin;
            body.query.bool.filter.terms['affiliation.objectId'] = allOuIds;
            body.query.bool.must.term['loginname.auto'] = loginName.toLowerCase();
            this.usersService.query(this.usersPath, body)
              .subscribe({
                next: (data: { list: User[], records: number }) => this.usersByLogin = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private returnSuggestedUsersByName(userName: string) {
    if (this.authenticationService.isAdmin) {
      const queryString = '?q=name.auto:' + userName;
      this.usersService.filter(this.usersPath, queryString, 1)
        .subscribe({
          next: (data: { list: User[], records: number }) => this.usersByName = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId),
            );
            const body = users4autoSelectByName;
            body.query.bool.filter.terms['affiliation.objectId'] = allOuIds;
            body.query.bool.must.term['name.auto'] = userName.toLowerCase();
            this.usersService.query(this.usersPath, body)
              .subscribe({
                next: (data: { list: User[], records: number }) => this.usersByName = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private selectOu(ou: Ou) {
    this.selectedOu = ou;
    const queryString = '?q=affiliation.objectId:' + ou.objectId;
    this.usersService.filter(this.usersPath, queryString, this.currentPage)
      .subscribe({
        next: (data: { list: User[], records: number }) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
    this.title = 'Users of ' + this.selectedOu.name;
    this.closeOus();
  }
}
