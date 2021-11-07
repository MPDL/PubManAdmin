import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {User, Grant, BasicRO} from '../../base/common/model/inge';
import {UsersService} from '../services/users.service';
import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {environment} from 'environments/environment';
import {allOpenedOUs} from '../../base/common/model/query-bodies';

@Component({
  selector: 'user-details-component',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  url = environment.rest_users;
  ous_url = environment.rest_ous;
  ctxs_url = environment.rest_contexts;

  selected: User;
  ous: any[];
  ounames: any[] = [];
  searchTerm;
  selectedOu: any;
  isNewUser: boolean = false;
  isNewGrant: boolean = false;
  isNewOu: boolean = false;
  isAdmin: boolean = true;
  grants2remove: boolean = false;
  selectedGrant: Grant;
  selectedGrants: Grant[] = [];
  grantsToRemove: string;
  ctxTitle: string;
  pw: string;

  subscription: Subscription;
  token: string;
  tokenSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((token) => this.token = token);

    this.selected = this.route.snapshot.data['user'];

    if (this.route.snapshot.queryParams['admin']) {
      this.isAdmin = this.route.snapshot.queryParams['admin'];
    }

    if (this.selected.loginname === 'new user') {
      this.isNewUser = true;
      this.isNewOu = true;
    }

    this.listOuNames();
  }

  listOuNames() {
    const body = allOpenedOUs;
    this.usersService.query(this.ous_url, null, body)
      .subscribe((ous) => this.ous = ous.list);
  }

  onSelectOu(val) {
    this.selectedOu = val;
  }

  onChangeOu() {
    this.isNewOu = true;
    this.selected.affiliation = null;
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  addGrant() {
    this.isNewGrant = true;
  }

  deleteGrant(grant2delete) {
    this.grants2remove = true;
    this.selectedGrant = grant2delete;
    if (!this.selectedGrants.some((grant) => (grant2delete.objectRef === grant.objectRef && grant2delete.role === grant.role))) {
      this.selectedGrants.push(grant2delete);
    }
    this.grantsToRemove = JSON.stringify(this.selectedGrants);
  }

  goToRef(grant) {
    this.selectedGrant = grant;
    const ref = this.selectedGrant.objectRef;
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

  viewRefTitle(grant) {
    const ref = grant.objectRef;
    if (ref === undefined) {
      this.ctxTitle = 'why do you point here?';
    } else {
      if (ref.startsWith('ou')) {
        this.usersService.get(this.ous_url, ref, null)
          .subscribe((ou) => this.ctxTitle = ou.metadata.name);
      } else {
        if (ref.startsWith('ctx')) {
          this.usersService.get(this.ctxs_url, ref, null)
            .subscribe((ctx) => this.ctxTitle = ctx.name);
        }
      }
    }
  }

  gotoList() {
    const userId = this.selected ? this.selected.loginname : null;
    this.router.navigate(['/users', {id: userId}]);
  }

  notAllowed(whatthehackever) {
    this.messagesService.warning('you\'re not authorized !');
  }

  generateRandomPassword(user) {
    this.usersService.generateRandomPassword()
      .subscribe((pw) => user.password = pw.toString());
  }

  resetPassword(user) {
    if (user.active === true) {
      this.usersService.changePassword(user, this.token)
        .subscribe(
          (u) => {
            this.selected = u;
            this.messagesService.success(u.loginname + ':  password was reset to ' + user.password);
          },
          (error) => {
            this.messagesService.error(error);
          });
    } else {
      this.messagesService.warning('password will not be reset for deactivated user!');
    }
  }

  changePassword(user) {
    if (user.password != null) {
      this.usersService.changePassword(user, this.token)
        .subscribe(
          (u) => {
            this.selected = u;
            this.messagesService.success(u.loginname + ':  password has changed to ' + user.password);
          },
          (error) => {
            this.messagesService.error(error);
          });
    } else {
      this.messagesService.error('password must not be empty!');
    }
  }

  activateUser(user) {
    this.selected = user;
    if (this.selected.active === true) {
      this.usersService.deactivate(this.selected, this.token)
        .subscribe(
          (user2deactivate) => {
            this.selected = user2deactivate;
            this.messagesService.success('Deactivated ' + this.selected.objectId);
          },
          (error) => {
            this.messagesService.error(error);
          });
    } else {
      this.usersService.activate(this.selected, this.token)
        .subscribe(
          (user2activate) => {
            this.selected = user2activate;
            this.messagesService.success('Activated ' + this.selected.objectId);
          },
          (error) => {
            this.messagesService.error(error);
          });
    }
  }

  save(user2save) {
    this.selected = user2save;
    if (this.selected.loginname.includes(' ')) {
      this.messagesService.warning('loginname MUST NOT contain spaces');
      return;
    }
    if (this.selected.name == null) {
      this.messagesService.warning('name MUST NOT be empty');
      return;
    }
    if (this.isNewUser) {
      if (this.selectedOu != null) {
        const ouId = this.selectedOu.objectId;
        const aff = new BasicRO();
        aff.objectId = ouId;
        this.selected.affiliation = aff;
      } else {
        this.messagesService.warning('you MUST select an organization');
        return;
      }
      this.usersService.post(this.url, this.selected, this.token)
        .subscribe(
          (data) => {
            this.messagesService.success('added new user ' + this.selected.loginname + ' with password ' + this.selected.password);
            this.isNewUser = false;
            this.isNewOu = false;
            this.selected = data;
            // this.gotoList();
          },
          (error) => {
            this.messagesService.error(error);
          }
        );
    } else {
      if (this.isNewOu) {
        if (this.selectedOu != null) {
          const ouId = this.selectedOu.objectId;
          const aff = new BasicRO();
          aff.objectId = ouId;
          this.selected.affiliation = aff;
        } else {
          this.messagesService.warning('you MUST select an organization');
          return;
        }
      }
      this.usersService.put(this.url + '/' + this.selected.objectId, this.selected, this.token)
        .subscribe(
          (data) => {
            this.messagesService.success('updated ' + this.selected.loginname);
            // this.gotoList();
            this.isNewOu = false;
            this.isNewGrant = false;
            this.usersService.get(environment.rest_users, data.objectId, this.token)
              .subscribe((updated) => {
                this.selected = updated;
                if (this.selected.grantList) {
                  this.selected.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
                }
              });
          },
          (error) => {
            this.messagesService.error(error);
          }
        );
    }
  }

  removeGrants() {
    this.usersService.removeGrants(this.selected, this.selectedGrants, this.token).subscribe((user) => {
      this.selected = user;
      if (this.selected.grantList) {
        this.selected.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
      }
      this.messagesService.success('removed Grants from ' + this.selected.loginname);
      this.selectedGrants = null;
      this.grants2remove = false;
    }, (error) => {
      this.messagesService.error(error);
    });
  }

  delete(user) {
    this.selected = user;
    const id = this.selected.loginname;
    if (confirm('delete '+user.name+' ?')) {
      this.usersService.delete(this.url + '/' + this.selected.objectId, this.selected, this.token)
        .subscribe(
          (data) => {
            this.messagesService.success('deleted ' + id + ' ' + data);
          },
          (error) => {
            this.messagesService.error(error);
          }
        );
      this.selected = null;
      this.gotoList();
    }
  }

  getNames(term) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedOUs(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedOUs(term);
    }
  }

  returnSuggestedOUs(term) {
    const ouNames: any[] = [];
    const url = environment.rest_ous;
    const queryString = '?q=metadata.name.auto:' + term;
    this.usersService.filter(url, null, queryString, 1)
      .subscribe(
        (response) => {
          response.list.forEach((ou) => {
            ouNames.push(ou);
          });
          if (ouNames.length > 0) {
            this.ounames = ouNames;
          } else {
            this.ounames = [];
          }
        },
        (error) => {
          this.messagesService.error(error);
        });
  }

  close() {
    this.searchTerm = '';
    this.ounames = [];
  }

  select(term) {
    this.searchTerm = term.metadata.name;
    this.selectedOu = term;
    this.ounames = [];
  }
}
