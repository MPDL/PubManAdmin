import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {Grant, User} from '../../base/common/model/inge';
import {UsersService} from '../services/users.service';
import {environment} from 'environments/environment';
import {allOpenedOUs} from '../../base/common/model/query-bodies';

@Component({
  selector: 'grants-component',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss'],
  providers: [],
})
export class GrantsComponent implements OnInit, OnDestroy {
    @Input() selectedUser: User;
    @Output() selectedUserChange = new EventEmitter<User>();
    @Input() token: string;
    @Input() isNewGrant: boolean;
    @Output() isNewGrantChange = new EventEmitter<boolean>();

    ous_url = environment.rest_ous;
    ctx_url = environment.rest_contexts;

    grants: Grant[];
    roles: string[] = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR', 'CONE_CLOSED_VOCABULARY_EDITOR', 'REPORTER'];
    ctxs: Array<any>;
    ctxs_filtered: Array<any>;
    ous: Array<any>;
    selectedGrant: Grant;
    selectedGrants: Grant[] = [];
    grantsToAdd: string;
    selectedRole: string;
    selectedCtx: any;
    selectedOu: any;
    idString: string;
    tokenSubscription: Subscription;

    constructor(
        private messageService: MessagesService,
        private loginService: AuthenticationService,
        private usersService: UsersService,
    ) {}

    ngOnInit() {
      this.tokenSubscription = this.loginService.token$.subscribe((token) => {
        this.token = token;
      });
      if (this.token != null) {
        this.getNewGrantSelect();
      }
    }

    ngOnDestroy() {
      this.tokenSubscription.unsubscribe();
    }

    getNewGrantSelect() {
      const ousBody = allOpenedOUs;
      this.usersService.filter(this.ctx_url, null, '?q=state:OPENED&size=300', 1)
        .subscribe((ctxs) => {
          this.ctxs = ctxs.list;
          this.ctxs_filtered = ctxs.list;
        });

      this.usersService.query(this.ous_url, null, ousBody)
        .subscribe((ous) => {
          this.ous = ous.list;
        });
    }

    onChangeRole(val) {
      this.selectedRole = val;
    }

    onChangeCtx(val) {
      this.selectedCtx = val;
    }

    onChangeOu(val) {
      this.selectedOu = val;
    }

    validateSelection() {
      const rolename = this.selectedRole;

      if (rolename) {
        if (rolename.startsWith('CONE') || rolename === 'REPORTER') {
          this.addGrant(rolename, null);
        }
        if (rolename === 'DEPOSITOR' || rolename === 'MODERATOR') {
          if (this.selectedCtx != null) {
            const refId = this.selectedCtx.objectId;
            this.addGrant(rolename, refId);
          } else {
            this.messageService.error('you must select a context!');
          }
        }
      } else {
        this.messageService.error('ROLE!!!');
      }
    }

    resetGrants() {
      this.selectedGrants.splice(0, this.selectedGrants.length);
      this.grantsToAdd = '';
    }

    addGrant(rolename, refId) {
      const grant2add = new Grant();
      grant2add.role = rolename;
      grant2add.objectRef = refId;

      if (!this.selectedGrants.some((grant) => (grant2add.objectRef === grant.objectRef && grant2add.role === grant.role))) {
        this.selectedGrants.push(grant2add);
      }
      this.grantsToAdd = JSON.stringify(this.selectedGrants);
    }

    addGrants() {
      if (this.selectedGrants.length > 0) {
        this.usersService.addGrants(this.selectedUser, this.selectedGrants, this.token).subscribe((user) => {
          this.selectedUser = user;
          if (this.selectedUser.grantList) {
            this.selectedUser.grantList.forEach((grant) => this.usersService.addNamesOfGrantRefs(grant));
          }
          this.selectedUserChange.emit(this.selectedUser);
          this.messageService.success('added Grants to ' + this.selectedUser.loginname);
          this.selectedGrants = null;
          this.grantsToAdd = '';
          this.isNewGrantChange.emit(false);
        }, (error) => {
          this.messageService.error(error);
        });
      } else {
        this.messageService.warning('no grant(s) selected !');
      }
    }

    filterCtxs(event) {
      this.ctxs_filtered = this.ctxs;
      if (typeof event === 'string') {
        this.ctxs_filtered = this.ctxs.filter((c) => c.name.toLowerCase()
          .includes(event.toLowerCase()));
        this.selectedCtx = this.ctxs_filtered[0];
      }
    }
}

