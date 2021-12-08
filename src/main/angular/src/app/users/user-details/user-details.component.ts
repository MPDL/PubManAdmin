import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {Grant, Ou, User} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {UsersService} from '../services/users.service';

@Component({
  selector: 'user-details-component',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  ctxsUrl = environment.restCtxs;
  ousUrl = environment.restOus;
  usersUrl = environment.restUsers;

  user: User;
  isNewUser: boolean = false;

  ous: Ou[] = [];
  ouSearchTerm: string = '';
  selectedOu: Ou;
  isNewOu: boolean = false;

  isNewGrant: boolean = false;
  grants2remove: boolean = false;
  selectedGrantToRemove: Grant;
  selectedGrantsToRemove: Grant[] = [];
  grantsToRemove: string;

  ctxTitle: string;

  pw: string;

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private organizationService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);

    this.user = this.activatedRoute.snapshot.data['user'];

    if (this.user.loginname === 'new user') {
      this.isNewUser = true;
      this.isNewOu = true;
    }
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
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

  gotoUserList() {
    this.router.navigate(['/users']);
  }

  generateRandomPassword(user: { password: string; }) {
    this.usersService.generateRandomPassword().subscribe((data) => user.password = data.toString());
  }

  resetPassword(user: User) {
    if (user.active === true) {
      this.usersService.changePassword(user, this.token)
        .subscribe({
          next: (data) => {
            this.user = data;
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
            this.user = data;
            this.messagesService.success(data.loginname + ':  password has changed to ' + user.password);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.messagesService.error('password must not be empty!');
    }
  }

  activateUser(user: User) {
    this.user = user;
    if (this.user.active === true) {
      this.usersService.deactivate(this.user, this.token)
        .subscribe({
          next: (data) => {
            this.user = data;
            this.messagesService.success('Deactivated ' + this.user.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.usersService.activate(this.user, this.token)
        .subscribe({
          next: (data) => {
            this.user = data;
            this.messagesService.success('Activated ' + this.user.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  saveUser(user: User) {
    this.user = user;

    if (this.user.loginname.includes('new user')) {
      this.messagesService.warning('name MUST NOT be new user');
      return;
    }

    if (this.user.loginname.includes(' ')) {
      this.messagesService.warning('loginname MUST NOT contain spaces');
      return;
    }

    if (!this.user.affiliation) {
      this.messagesService.warning('you MUST select an organization');
      return;
    }

    if (!this.user.name) {
      this.messagesService.warning('name MUST NOT be empty');
      return;
    }

    if (this.isNewUser) {
      this.usersService.post(this.usersUrl, this.user, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('added new user ' + this.user.loginname + ' with password ' + this.user.password);
            this.isNewUser = false;
            this.isNewOu = false;
            this.user = data;
          },
          error: (e) => this.messagesService.error(e),
        }
        );
    } else {
      this.usersService.put(this.usersUrl + '/' + this.user.objectId, this.user, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('updated user ' + this.user.loginname);
            this.isNewOu = false;
            this.isNewGrant = false;
            this.usersService.get(environment.restUsers, data.objectId, this.token)
              .subscribe((data) => {
                this.user = data;
                if (this.user.grantList) {
                  this.user.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
                }
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  removeGrants() {
    this.usersService.removeGrants(this.user, this.selectedGrantsToRemove, this.token)
      .subscribe({
        next: (data) => {
          this.user = data;
          if (this.user.grantList) {
            this.user.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
          }
          this.messagesService.success('removed Grants from ' + this.user.loginname);
          this.resetGrants();
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  deleteUser(user: User) {
    this.user = user;
    const id = this.user.loginname;
    if (confirm('delete '+user.name+' ?')) {
      this.usersService.delete(this.usersUrl + '/' + this.user.objectId, this.token)
        .subscribe({
          next: (data) => this.messagesService.success('deleted user ' + id),
          error: (e) => this.messagesService.error(e),
        });
      this.user = null;
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
          this.user.affiliation = null;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.selectedOu = null;
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.selectedOu = ou;
    this.user.affiliation = this.organizationService.makeAffiliation(this.selectedOu.objectId);

    this.ous = [];
  };

  changeOu() {
    this.isNewOu = true;
    this.closeOus();
    this.user.affiliation = null;
  }

  resetGrants() {
    this.grantsToRemove = '';
    this.grants2remove = false;
    this.selectedGrantToRemove = null;
    this.selectedGrantsToRemove = [];
  }
}
