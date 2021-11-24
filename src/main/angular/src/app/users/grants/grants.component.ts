import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {Context, Grant, Ou, User} from '../../base/common/model/inge';
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
      token: string;
    @Input()
      isNewGrant: boolean;

    @Output()
      isNewGrantChange = new EventEmitter<boolean>();
    @Output()
      selectedUserChange = new EventEmitter<User>();

    ousUrl = environment.restOus;
    contextUrl = environment.restContexts;
    roles: string[] = ['DEPOSITOR', 'MODERATOR', 'CONE_OPEN_VOCABULARY_EDITOR', 'CONE_CLOSED_VOCABULARY_EDITOR', 'REPORTER', 'LOCAL_ADMIN'];
    contexts: Context[] = [];
    filteredContexts: Context[] = [];
    ous: Ou[] = [];
    selectedGrantToAdd: Grant;
    selectedGrantsToAdd: Grant[] = [];
    grantsToAdd: string;
    selectedRole: string;
    selectedContext: Context;
    selectedOu: Ou;
    idString: string;
    tokenSubscription: Subscription;

    constructor(
        private messagesService: MessagesService,
        private authenticationService: AuthenticationService,
        private usersService: UsersService,
    ) {}

    ngOnInit() {
      this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
      if (this.token != null) {
        this.getContextsAndOus();
      }
    }

    ngOnDestroy() {
      this.tokenSubscription.unsubscribe();
    }

    getContextsAndOus() {
      const ousBody = allOpenedOUs;
      this.usersService.filter(this.contextUrl, null, '?q=state:OPENED&size=300', 1)
        .subscribe(
          (data) => {
            this.contexts = data.list;
            this.filteredContexts = data.list;
          });
      this.usersService.query(this.ousUrl, null, ousBody).subscribe((data) => this.ous = data.list);
    }

    onChangeRole(val: string) {
      this.selectedRole = val;
    }

    onChangeContext(context: Context) {
      this.selectedContext = context;
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
          if (this.selectedContext != null) {
            const refId = this.selectedContext.objectId;
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

    filterContexts(event: string) {
      this.filteredContexts = this.contexts;
      if (typeof event === 'string') {
        this.filteredContexts = this.contexts.filter((context) => context.name.toLowerCase().includes(event.toLowerCase()));
        this.selectedContext = this.filteredContexts[0];
      }
    }
}

