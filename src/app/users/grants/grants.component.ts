import { Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from "../../base/services/authentication.service";
import { Grant, User } from '../../base/common/model';
import { Elastic4usersService } from '../services/elastic4users.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'grants',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss'],
  providers: [ ]
})

export class GrantsComponent implements OnInit, OnDestroy {

    @Input() selectedUser: User;
    @Output() selectedUserChange = new EventEmitter<User>();
    @Input() token: string;
    @Input() isNewGrant: boolean;
    @Output() isNewGrantChange = new EventEmitter<boolean>();

    grants: Grant[];
    roles: string[] = ["DEPOSITOR", "MODERATOR", "SYSADMIN"];
    ctxs: Array<any>;
    selectedGrant: Grant;
    selectedGrants: Grant[] = [];
    grantsToAdd: string;
    selectedRole: string;
    selectedCtx: any;
    idString: string;
    tokenSubscription: Subscription;

    constructor(
        private messageService: MessagesService,
        private loginService: AuthenticationService,
        private elasticService: Elastic4usersService,
        private usersService: UsersService,
        private router: Router
        ) { }

    ngOnInit() {
        this.tokenSubscription = this.loginService.token$.subscribe(token => {
            this.token = token
        });
        if (this.token != null) {
            this.getNewGrantSelect();
        }
    }

    ngOnDestroy() {
        this.tokenSubscription.unsubscribe();
    }

    getNewGrantSelect() {
        this.elasticService.listAllContextNames((contexts) => {
        this.ctxs = contexts;
        });

    }

    onChangeRole(val) {
        this.selectedRole = val;
    }

    onChangeCtx(val) {
        this.selectedCtx = val;
    }

    addGrant() {
        let rolename = this.selectedRole;
        let ctx_id = this.selectedCtx.reference.objectId;
        let grant2add = new Grant();
        grant2add.role = rolename;
        grant2add.objectRef = ctx_id;
        this.selectedGrants.push(grant2add);
        this.grantsToAdd = JSON.stringify(this.selectedGrants);
    }

    deleteGrant(grant) {
        this.selectedGrant = grant;
        this.selectedGrants.push(grant);
        this.grantsToAdd = JSON.stringify(this.selectedGrants);
    }

    addGrants() {
        this.usersService.addGrants(this.selectedUser, this.selectedGrants, this.token).subscribe(user => {
            this.selectedUser = user;
            this.selectedUserChange.emit(this.selectedUser);
            this.messageService.success("added Grants to " + this.selectedUser.userid);
            // this.selectedGrants.forEach(g => this.selectedUser.grants.push(g));
            // this.selectedGrants.slice(0, this.selectedGrants.length);
            this.selectedGrants = null;
            this.grantsToAdd = "";
            this.isNewGrantChange.emit(false);
        }, error => {
            this.messageService.error(error);
        });
    }
}

