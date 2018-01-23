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
    providers: []
})

export class GrantsComponent implements OnInit, OnDestroy {

    @Input() selectedUser: User;
    @Output() selectedUserChange = new EventEmitter<User>();
    @Input() token: string;
    @Input() isNewGrant: boolean;
    @Output() isNewGrantChange = new EventEmitter<boolean>();

    grants: Grant[];
    roles: string[] = ["DEPOSITOR", "MODERATOR", "CONE_OPEN_VOCABULARY_EDITOR", "CONE_CLOSED_VOCABULARY_EDITOR", "REPORTER", "USR_ADMIN", "YEARBOOK-EDITOR", "YEARBOOK-ADMIN"];
    ctxs: Array<any>;
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
        this.elasticService.listOuNames("parent", "persistent13", names => {
            this.ous = names;
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
        let rolename = this.selectedRole;

        if (rolename) {
            if (rolename === "USR_ADMIN") {
                let ref_id = this.selectedUser.affiliation.objectId;
                this.addGrant(rolename, ref_id);
            }
            if (rolename.startsWith("CONE") || rolename === "REPORTER" || rolename === "YEARBOOK-ADMIN") {
                let ref_id = this.selectedUser.affiliation.objectId;
                this.addGrant(rolename, ref_id);
            }
            if (rolename === "YEARBOOK-EDITOR") {
                if (this.selectedOu != null) {
                    let ref_id = this.selectedOu.objectId;
                    this.addGrant(rolename, ref_id);
                } else {
                    this.messageService.error("you must select an organization!");
                }
            }
            if (rolename === "DEPOSITOR" || rolename === "MODERATOR") {
                if (this.selectedCtx != null) {
                    let ref_id = this.selectedCtx.objectId;
                    this.addGrant(rolename, ref_id);
                } else {
                    this.messageService.error("you must select a context!");
                }
            }
        } else {
            this.messageService.error("ROLE!!!")
        }
    }

    resetGrants() {
        this.selectedGrants.splice(0, this.selectedGrants.length);
        this.grantsToAdd = "";
    }

    addGrant(rolename, ref_id) {

        let grant2add = new Grant();
        grant2add.role = rolename;
        grant2add.objectRef = ref_id;

        if (!this.selectedGrants.some(grant => (grant2add.objectRef === grant.objectRef && grant2add.role === grant.role))) {
            this.selectedGrants.push(grant2add);
        }
        this.grantsToAdd = JSON.stringify(this.selectedGrants);
    }

    addGrants() {
        if (this.selectedGrants.length > 0) {
            this.usersService.addGrants(this.selectedUser, this.selectedGrants, this.token).subscribe(user => {
                this.selectedUser = user;
                this.selectedUserChange.emit(this.selectedUser);
                this.messageService.success("added Grants to " + this.selectedUser.loginname);
                // this.selectedGrants.forEach(g => this.selected.user.grantList.push(g));
                // this.selectedGrants.slice(0, this.selectedGrants.length);
                this.selectedGrants = null;
                this.grantsToAdd = "";
                this.isNewGrantChange.emit(false);
            }, error => {
                this.messageService.error(error);
            });
        } else {
            this.messageService.warning("no grant(s) selected !");
        }
    }
}

