import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {Ctx, Grant, Ou, User} from '../../base/common/model/inge';
import {UsersService} from '../services/users.service';
import {environment} from 'environments/environment';
import {allOpenedOUs} from '../../base/common/model/query-bodies';

@Component({
  selector: 'grants-component',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss'],
})
export class GrantsComponent implements OnInit, OnDestroy {
    @Input()
      selectedUser: User;
    @Input()
      isNewGrant: boolean;

    @Output()
      isNewGrantChange = new EventEmitter<boolean>();
    @Output()
      selectedUserChange = new EventEmitter<User>();

    ousUrl = environment.restOus;
    ctxUrl = environment.restCtxs;
    roles: string[];
    ctxs: Ctx[] = [];
    filteredCtxs: Ctx[] = [];
    ous: Ou[] = [];
    selectedGrantToAdd: Grant;
    selectedGrantsToAdd: Grant[] = [];
    grantsToAdd: string;
    selectedRole: string;
    selectedCtx: Ctx;
    selectedOu: Ou;
    idString: string;

    isAdmin: boolean;
    adminSubscription: Subscription;
    token: string;
    tokenSubscription: Subscription;

    constructor(
        private messagesService: MessagesService,
        private authenticationService: AuthenticationService,
        private usersService: UsersService,
    ) {}

    ngOnInit() {
      this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
      if (this.token != null) {
        this.getCtxsAndOus();
      }
      this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
      if (this.isAdmin) {
        this.roles = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR', 'CONE_CLOSED_VOCABULARY_EDITOR', 'REPORTER', 'LOCAL_ADMIN'];
      } else {
        this.roles = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR'];
      }
    }

    ngOnDestroy() {
      this.adminSubscription.unsubscribe();
      this.tokenSubscription.unsubscribe();
    }

    getCtxsAndOus() {
      const ousBody = allOpenedOUs;
      this.usersService.filter(this.ctxUrl, null, '?q=state:OPENED&size=300', 1)
        .subscribe(
          (data) => {
            this.ctxs = data.list;
            this.filteredCtxs = data.list;
          });
      this.usersService.query(this.ousUrl, null, ousBody).subscribe((data) => this.ous = data.list);
    }

    onChangeRole(val: string) {
      this.selectedRole = val;
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
        this.usersService.addGrants(this.selectedUser, this.selectedGrantsToAdd, this.token)
          .subscribe({
            next: (data) => {
              this.selectedUser = data;
              if (this.selectedUser.grantList) {
                this.selectedUser.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
              }
              this.selectedUserChange.emit(this.selectedUser);
              this.messagesService.success('added Grants to ' + this.selectedUser.loginname);
              this.selectedGrantsToAdd = null;
              this.grantsToAdd = '';
              this.isNewGrantChange.emit(false);
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
}

