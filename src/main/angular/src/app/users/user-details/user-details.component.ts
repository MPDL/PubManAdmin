import {Location} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ous4autoSelect} from 'app/base/common/model/query-bodies';
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
    standalone: false
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('form')
    form: NgForm;

  ctxsPath: string = environment.restCtxs;
  ousPath: string = environment.restOus;
  usersPath: string = environment.restUsers;

  user: User;
  isNewUser: boolean = false;

  ousForLoggedInUser: Ou[];
  ous: Ou[] = [];
  ouSearchTerm: string = '';
  selectedOu: Ou;
  isNewOu: boolean = false;

  isNewGrant: boolean = false;

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private location: Location,
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

    this.setUser(this.activatedRoute.snapshot.data['user']);

    if (!this.isAdmin) {
      this.getLoggedInUserFirstLevelOpenOus();
    }

    if (this.user.loginname === 'new user') {
      this.user.loginname = null;
      this.usersService.generateRandomPassword(this.token)
        .subscribe({
          next: (data: string) => {
            this.user.password = data;
          },
          error: (e) => this.messagesService.error(e),
        });

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

  changeOu() {
    this.isNewOu = true;
    this.closeOus();
    this.user.affiliation = null;
  }

  changeUserState() {
    if (this.user.active === true) {
      this.usersService.deactivate(this.user, this.token)
        .subscribe({
          next: (data: User) => {
            this.setUser(data);
            this.messagesService.success('deactivated ' + this.user.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.usersService.activate(this.user, this.token)
        .subscribe({
          next: (data: User) => {
            this.setUser(data);
            this.messagesService.success('activated ' + this.user.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.selectedOu = null;
    this.ous = [];
  }

  deleteUser() {
    if (confirm('Delete ' + this.user.name + '?')) {
      if (this.checkForm()) {
        this.usersService.delete(this.usersPath + '/' + this.user.objectId, this.token)
          .subscribe({
            next: (_data) => {
              this.messagesService.success('deleted user ' + this.user.loginname);
              this.user = null;
              this.router.navigate(['/users']);
            },
            error: (e) => this.messagesService.error(e),
          });
      }
    }
  }

  generatePassword() {
    if (confirm('Generate a new random password?')) {
      this.usersService.generateRandomPassword(this.token)
        .subscribe({
          next: (data: string) => {
            const pw: string = data;
            this.user.password = pw;
            this.usersService.changePassword(this.user, this.token)
              .subscribe({
                next: (data: User) => {
                  this.setUser(data);
                  this.messagesService.success(data.loginname + ':  password was reset to ' + pw);
                },
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

  gotoRef(id: string) {
    if (this.checkForm()) {
      this.router.navigate(['/organization', id]);
    }
  }

  gotoRefByGrant(grant: Grant) {
    if (this.checkForm()) {
      const ref = grant.objectRef;
      if (ref && ref.startsWith('ou')) {
        this.router.navigate(['/organization', ref]);
      } else if (ref && ref.startsWith('ctx')) {
        this.router.navigate(['/context', ref]);
      }
    }
  }

  gotoUserList() {
    if (this.checkForm()) {
      this.location.back();
    }
  }

  removeGrant(grant: Grant) {
    if (confirm('Remove the selected grant ' + grant.role + '?')) {
      const grantsToRemove: Grant[] = [];
      grantsToRemove.push(grant);
      this.usersService.removeGrants(this.user, grantsToRemove, this.token)
        .subscribe({
          next: (data: User) => {
            this.setUser(data);
            this.messagesService.success('removed grant ' + grant.role + ' from ' + this.user.loginname);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  saveUser() {
    if (!this.user.affiliation) {
      this.messagesService.warning('you MUST select an organization');
      return;
    }

    if (this.isNewUser) {
      const pw = this.user.password;
      this.usersService.post(this.usersPath, this.user, this.token)
        .subscribe({
          next: (data: User) => {
            this.setUser(data);
            this.form.form.markAsPristine(); // resets form.dirty
            this.isNewUser = false;
            this.messagesService.success('added new user ' + this.user.loginname + ' with password ' + pw);
          },
          error: (e) => {
            if (e.message.includes('already exists')) {
              this.messagesService.error('the user with loginname ' + this.user.loginname + ' already exists!');
            } else {
              this.messagesService.error(e);
            }
          },
        });
    } else {
      this.usersService.put(this.usersPath + '/' + this.user.objectId, this.user, this.token)
        .subscribe({
          next: (data: User) => {
            this.usersService.get(environment.restUsers, data.objectId, this.token)
              .subscribe({
                next: (data: User) => {
                  this.setUser(data);
                  this.form.form.markAsPristine(); // resets form.dirty
                  this.messagesService.success('updated user ' + data.loginname);
                },
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.selectedOu = ou;
    this.user.affiliation = this.organizationsService.makeAffiliation(this.selectedOu.objectId, this.selectedOu.name);
    this.ous = [];
    this.isNewOu = false;
  };

  private checkForm(): boolean {
    if (!this.form.dirty && !this.isNewGrant) {
      return true;
    }

    if (confirm('You have unsaved changes. Proceed?')) {
      this.isNewGrant = false;
      this.isNewOu = false;
      return true;
    }

    return false;
  }

  private getLoggedInUserFirstLevelOpenOus() {
    const ous: Ou[] = [];
    this.loggedInUser.topLevelOuIds.forEach((ouId: string) => {
      this.organizationsService.get(this.ousPath, ouId, null)
        .subscribe({
          next: (data: Ou) => {
            if (data.publicStatus === 'OPENED') {
              ous.push(data);
            }
            this.ousForLoggedInUser = ous;
          },
          error: (e) => this.messagesService.error(e),
        });
    });
  }

  private returnSuggestedOus(ouName: string) {
    const ous: Ou[] = [];
    if (this.isAdmin) {
      const queryString = '?q=metadata.name.auto:' + ouName;
      this.organizationsService.filter(this.ousPath, null, queryString, 1)
        .subscribe({
          next: (data: {list: Ou[], records: number}) => {
            data.list.forEach((ou: Ou) => {
              if (ou.publicStatus === 'OPENED') {
                ous.push(ou);
              }
            });
            this.ous = ous;
            this.user.affiliation = null;
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      const body = ous4autoSelect;
      body.query.bool.filter.terms['objectId'] = this.loggedInUser.topLevelOuIds;
      body.query.bool.must.term['metadata.name.auto'] = ouName;
      this.organizationsService.query(this.ousPath, null, body)
        .subscribe({
          next: (data: {list: Ou[], records: number}) => {
            data.list.forEach((ou: Ou) => {
              if (ou.publicStatus === 'OPENED') {
                ous.push(ou);
              }
            });
            this.ous = ous;
            this.user.affiliation = null;
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private setUser(user: User) {
    this.user = user;

    if (this.user.grantList != null) {
      this.user.grantList.forEach((grant) => {
        this.usersService.addAdditionalPropertiesOfGrantRefs(grant);
        this.usersService.addOuPathOfGrantRefs(grant);
      });
    }
  }
}
