import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ContextsService} from 'app/contexts/services/contexts.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {Ctx, Grant, Ou, User} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {UsersService} from '../services/users.service';

@Component({
  selector: 'grants-component',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss'],
})
export class GrantsComponent implements OnInit, OnDestroy {
  @Input()
    isNewGrant: boolean;
  @Input()
    user: User;

  @Output()
    isNewGrantChange = new EventEmitter<boolean>();
  @Output()
    userChange = new EventEmitter<User>();

  ousUrl = environment.restOus;
  ctxsUrl = environment.restCtxs;

  roles: string[];
  selectedRole: string;

  ctx: Ctx;
  ctxs: Ctx[] = [];
  filteredCtxs: Ctx[] = [];
  selectedCtx: Ctx;

  ou: Ou;
  ouPath: string;
  ous: Ou[] = [];
  selectedOu: Ou;

  selectedGrantToAdd: Grant;
  selectedGrantsToAdd: Grant[] = [];
  grantsToAdd: string;
  idString: string;

  isAdmin: boolean;
  adminSubscription: Subscription;
  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);

    if (this.isAdmin) {
      this.roles = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR', 'CONE_CLOSED_VOCABULARY_EDITOR', 'REPORTER', 'LOCAL_ADMIN'];
      this.getCtxsAndOus();
    } else {
      this.roles = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR'];
    }
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
  }

  getCtxsAndOus() {
    this.organizationsService.getFirstLevelOus(this.token).subscribe((data) => this.ous = data);

    this.usersService.filter(this.ctxsUrl, null, '?q=state:OPENED&size=300', 1)
      .subscribe(
        (data) => {
          this.ctxs = data.list;
          this.filteredCtxs = data.list;
        });
  }

  onChangeRole(role: string) {
    this.selectedRole = role;
  }

  onChangeCtx(ctx: Ctx) {
    this.selectedCtx = ctx;
  }

  onChangeOu(ou: Ou) {
    this.selectedOu = ou;
  }

  validateSelection() {
    const role = this.selectedRole;
    if (role) {
      if (role.startsWith('CONE') || role === 'REPORTER') {
        this.addGrant(role, null);
      } else if (role === 'LOCAL_ADMIN') {
        if (this.selectedOu != null) {
          const refId = this.selectedOu.objectId;
          this.addGrant(role, refId);
        } else {
          this.messagesService.error('you must select an organization!');
        }
      } else if (role === 'DEPOSITOR' || role === 'MODERATOR') {
        if (this.selectedCtx != null) {
          const refId = this.selectedCtx.objectId;
          this.addGrant(role, refId);
        } else {
          this.messagesService.error('you must select a context!');
        }
      }
    } else {
      this.messagesService.error('ROLE!!!');
    }
  }

  resetGrants() {
    this.selectedGrantsToAdd.splice(0, this.selectedGrantsToAdd.length);
    this.grantsToAdd = '';
  }

  addGrant(role: string, refId: string) {
    const grantToAdd = new Grant();
    grantToAdd.role = role;
    grantToAdd.objectRef = refId;
    if (!this.selectedGrantsToAdd.some((data) => (grantToAdd.objectRef === data.objectRef && grantToAdd.role === data.role))) {
      this.selectedGrantsToAdd.push(grantToAdd);
    }
    this.grantsToAdd = JSON.stringify(this.selectedGrantsToAdd);
  }

  addGrants() {
    if (this.selectedGrantsToAdd.length > 0) {
      this.usersService.addGrants(this.user, this.selectedGrantsToAdd, this.token)
        .subscribe({
          next: (data) => {
            this.setUser(data);
            if (this.user.grantList) {
              this.user.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
            }
            this.userChange.emit(this.user);
            this.isNewGrantChange.emit(false);
            this.messagesService.success('added Grants to ' + this.user.loginname);
            this.selectedGrantsToAdd = [];
            this.grantsToAdd = '';
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.messagesService.warning('no grant(s) selected !');
    }
  }

  filterCtxs(event: string) {
    this.filteredCtxs = this.ctxs;
    if (typeof event === 'string') {
      this.filteredCtxs = this.ctxs.filter((ctx) => ctx.name.toLowerCase().includes(event.toLowerCase()));
      this.selectedCtx = this.filteredCtxs[0];
    }
  }

  private setUser(user: User) {
    this.user = user;
    this.updateParents();
  }

  private updateParents() {
    this.user.grantList.forEach((grant) => {
      if (grant.objectRef != null && grant.objectRef.startsWith('ou')) {
        this.organizationsService.get(this.ousUrl, grant.objectRef, this.token).subscribe((data) => {
          this.ou = data;
          grant.parentName = this.ou.parentAffiliation.name;
        });
      } else if (grant.objectRef != null && grant.objectRef.startsWith('ctx')) {
        this.contextsService.get(this.ctxsUrl, grant.objectRef, this.token).subscribe((data1) => {
          this.ctx = data1;
          this.organizationsService.getOuPath(this.ctx.responsibleAffiliations[0].objectId, this.token).subscribe((data2) => {
            this.ouPath = data2;
            grant.parentName = this.ouPath;
          });
        });
      }
    });
  }
}
