
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {localAdminCtxs} from 'app/base/common/model/query-bodies';
import {ContextsService} from 'app/contexts/services/contexts.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Ctx, Grant, Ou, User} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {UsersService} from '../services/users.service';

@Component({
  selector: 'grants-component',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss'],
  standalone: true,
  imports: [
    FormsModule
],
})
export class GrantsComponent implements OnInit {
  @Input()
  isNewGrant: boolean;
  @Input()
  user: User;

  @Output()
  isNewGrantChange = new EventEmitter<boolean>();
  @Output()
  userChange = new EventEmitter<User>();

  ousPath: string = environment.restOus;
  ctxsPath: string = environment.restCtxs;

  roles: string[];
  selectedRole: string;

  ctx: Ctx;
  ctxs: Ctx[] = [];
  filteredCtxs: Ctx[] = [];
  selectedCtx: Ctx;

  ous: Ou[] = [];
  selectedOu: Ou;

  selectedGrantsToAdd: Grant[] = [];
  grantsToAdd: string;

  constructor(
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private usersService: UsersService,
  ) {
  }

  ngOnInit() {
    if (this.authenticationService.isAdmin) {
      this.roles = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR', 'CONE_CLOSED_VOCABULARY_EDITOR', 'REPORTER', 'LOCAL_ADMIN'];
    } else {
      this.roles = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR'];
    }

    this.getCtxsAndOus();
  }

  private getCtxsAndOus() {
    if (this.authenticationService.isAdmin) {
      this.organizationsService.getFirstLevelOus()
        .subscribe({
          next: (data: Ou[]) => {
            const ous: Ou[] = [];
            data.forEach((ou: Ou) => {
              if (ou.publicStatus === 'OPENED') {
                ous.push(ou);
              }
            });
            this.ous = ous;
          },
          error: (e) => this.messagesService.error(e),
        });
      const queryString = '?q=state:OPENED&size=300';
      this.usersService.filter(this.ctxsPath, queryString, 1)
        .subscribe({
          next: (data: { list: Ctx[], records: number }) => {
            this.ctxs = data.list;
            this.filteredCtxs = data.list;
          },
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
            const body = localAdminCtxs;
            body.query.bool.filter.terms['responsibleAffiliations.objectId'] = allOuIds;
            this.contextsService.query(this.ctxsPath, body)
              .subscribe({
                next: (data: { list: Ctx[], records: number }) => {
                  const ctxs: Ctx[] = [];
                  data.list.forEach((ctx: Ctx) => {
                    if (ctx.state === 'OPENED') {
                      ctxs.push(ctx);
                    }
                  });
                  this.ctxs = ctxs;
                  this.filteredCtxs = ctxs;
                },
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
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
    this.isNewGrantChange.emit(false);
    this.selectedGrantsToAdd = [];
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
      this.usersService.addGrants(this.user, this.selectedGrantsToAdd)
        .subscribe({
          next: (data: User) => {
            this.setUser(data);
            this.userChange.emit(this.user);
            this.isNewGrantChange.emit(false);
            this.selectedGrantsToAdd = [];
            this.grantsToAdd = '';
            this.messagesService.success('added Grants to ' + this.user.loginname);
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
    if (this.user.grantList != null) {
      this.user.grantList.forEach((grant) => {
        this.usersService.addAdditionalPropertiesOfGrantRefs(grant);
        this.usersService.addOuPathOfGrantRefs(grant);
      });
    }
  }
}
