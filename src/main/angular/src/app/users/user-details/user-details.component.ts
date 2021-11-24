import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {User, Grant, BasicRO, Ou} from '../../base/common/model/inge';
import {UsersService} from '../services/users.service';
import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {environment} from 'environments/environment';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';

@Component({
  selector: 'user-details-component',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  url = environment.restUsers;
  ousUrl = environment.restOus;
  ctxsUrl = environment.restContexts;

  selectedUser: User;
  ous: Ou[] = [];
  ouSearchTerm: string = '';
  selectedOu: Ou;
  isNewUser: boolean = false;
  isNewGrant: boolean = false;
  isNewOu: boolean = false;
  isAdmin: boolean = true;
  grants2remove: boolean = false;
  selectedGrantToRemove: Grant;
  selectedGrantsToRemove: Grant[] = [];
  grantsToRemove: string;
  contextTitle: string;
  pw: string;

  token: string;
  tokenSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private organizationService: OrganizationsService,
    private usersService: UsersService,
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);

    this.selectedUser = this.activatedRoute.snapshot.data['user'];

    if (this.activatedRoute.snapshot.queryParams['admin']) {
      this.isAdmin = this.activatedRoute.snapshot.queryParams['admin'];
    }

    if (this.selectedUser.loginname === 'new user') {
      this.isNewUser = true;
      this.isNewOu = true;
    }
  }

  changeOu() {
    this.isNewOu = true;
    this.selectedUser.affiliation = null;
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  addGrant() {
    this.isNewGrant = true;
  }

  addToDeleteGrantsList(grant: Grant) {
    this.grants2remove = true;
    this.selectedGrantToRemove = grant;
    if (!this.selectedGrantsToRemove.some((data) => (data.objectRef === this.selectedGrantToRemove.objectRef && data.role === this.selectedGrantToRemove.role))) {
      this.selectedGrantsToRemove.push(this.selectedGrantToRemove);
    }
    this.grantsToRemove = JSON.stringify(this.selectedGrantsToRemove);
  }

  goToRef(grant: Grant) {
    this.selectedGrantToRemove = grant;
    const ref = this.selectedGrantToRemove.objectRef;
    if (ref === undefined) {
      this.messagesService.warning('the reference of the selected grant is undefined!');
    } else {
      if (ref.startsWith('ou')) {
        this.router.navigate(['/organization', ref]);
      } else {
        if (ref.startsWith('ctx')) {
          this.router.navigate(['/context', ref]);
        }
      }
    }
  }

  viewRefTitle(grant: { objectRef: any; }) {
    const ref = grant.objectRef;
    if (ref === undefined) {
      this.contextTitle = 'why do you point here?';
    } else {
      if (ref.startsWith('ou')) {
        this.usersService.get(this.ousUrl, ref, null).subscribe((data) => this.contextTitle = data.metadata.name);
      } else {
        if (ref.startsWith('ctx')) {
          this.usersService.get(this.ctxsUrl, ref, null).subscribe((data) => this.contextTitle = data.name);
        }
      }
    }
  }

  gotoUserList() {
    const userId = this.selectedUser ? this.selectedUser.loginname : null;
    this.router.navigate(['/users', {id: userId}]);
  }

  notAllowed(whatthehackever) {
    this.messagesService.warning('you\'re not authorized !');
  }

  generateRandomPassword(user: { password: string; }) {
    this.usersService.generateRandomPassword().subscribe((data) => user.password = data.toString());
  }

  resetPassword(user: User) {
    if (user.active === true) {
      this.usersService.changePassword(user, this.token)
        .subscribe({
          next: (data) => {
            this.selectedUser = data;
            this.messagesService.success(data.loginname + ':  password was reset to ' + user.password);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.messagesService.warning('password will not be reset for deactivated user!');
    }
  }

  changePassword(user: User) {
    if (user.password != null) {
      this.usersService.changePassword(user, this.token)
        .subscribe({
          next: (data) => {
            this.selectedUser = data;
            this.messagesService.success(data.loginname + ':  password has changed to ' + user.password);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.messagesService.error('password must not be empty!');
    }
  }

  activateUser(user: User) {
    this.selectedUser = user;
    if (this.selectedUser.active === true) {
      this.usersService.deactivate(this.selectedUser, this.token)
        .subscribe({
          next: (data) => {
            this.selectedUser = data;
            this.messagesService.success('Deactivated ' + this.selectedUser.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.usersService.activate(this.selectedUser, this.token)
        .subscribe({
          next: (data) => {
            this.selectedUser = data;
            this.messagesService.success('Activated ' + this.selectedUser.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  saveUser(user: User) {
    this.selectedUser = user;
    if (this.selectedUser.loginname.includes(' ')) {
      this.messagesService.warning('loginname MUST NOT contain spaces');
      return;
    }
    if (this.selectedUser.name == null) {
      this.messagesService.warning('name MUST NOT be empty');
      return;
    }
    if (this.isNewUser) {
      if (this.selectedOu != null) {
        const ouId = this.selectedOu.objectId;
        const aff = new BasicRO();
        aff.objectId = ouId;
        this.selectedUser.affiliation = aff;
      } else {
        this.messagesService.warning('you MUST select an organization');
        return;
      }
      this.usersService.post(this.url, this.selectedUser, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('added new user ' + this.selectedUser.loginname + ' with password ' + this.selectedUser.password);
            this.isNewUser = false;
            this.isNewOu = false;
            this.selectedUser = data;
          },
          error: (e) => this.messagesService.error(e),
        }
        );
    } else {
      if (this.isNewOu) {
        if (this.selectedOu != null) {
          const ouId = this.selectedOu.objectId;
          const aff = new BasicRO();
          aff.objectId = ouId;
          this.selectedUser.affiliation = aff;
        } else {
          this.messagesService.warning('you MUST select an organization');
          return;
        }
      }
      this.usersService.put(this.url + '/' + this.selectedUser.objectId, this.selectedUser, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('updated ' + this.selectedUser.loginname);
            this.isNewOu = false;
            this.isNewGrant = false;
            this.usersService.get(environment.restUsers, data.objectId, this.token)
              .subscribe((data) => {
                this.selectedUser = data;
                if (this.selectedUser.grantList) {
                  this.selectedUser.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
                }
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  removeGrants() {
    this.usersService.removeGrants(this.selectedUser, this.selectedGrantsToRemove, this.token)
      .subscribe({
        next: (data) => {
          this.selectedUser = data;
          if (this.selectedUser.grantList) {
            this.selectedUser.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
          }
          this.messagesService.success('removed Grants from ' + this.selectedUser.loginname);
          this.resetGrants();
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  deleteUser(user: User) {
    this.selectedUser = user;
    const id = this.selectedUser.loginname;
    if (confirm('delete '+user.name+' ?')) {
      this.usersService.delete(this.url + '/' + this.selectedUser.objectId, this.selectedUser, this.token)
        .subscribe({
          next: (data) => this.messagesService.success('deleted ' + id + ' ' + data),
          error: (e) => this.messagesService.error(e),
        });
      this.selectedUser = null;
      this.gotoUserList();
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

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.selectedOu = ou;
    this.ous = [];
  };

  resetGrants() {
    this.grantsToRemove = '';
    this.grants2remove = false;
    this.selectedGrantToRemove = null;
    this.selectedGrantsToRemove = [];
  }
}
