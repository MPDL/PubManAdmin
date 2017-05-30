import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from "../../base/services/authentication.service";
import { Grant, Role, User } from '../../base/common/model';
import { GrantsService } from '../services/grants.service';
import { RolesService } from '../services/roles.service';
import { Elastic4usersService } from '../services/elastic4users.service';

@Component({
  selector: 'grants',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss'],
  providers: [ GrantsService, RolesService ]
})

export class GrantsComponent implements OnInit, OnDestroy {

    @Input() selectedUser: User;
    @Input() token: string;

    grants: Grant[];
    roles: Role[];
    ctxs: Array<any>;
    selectedGrant: Grant;
    selectedRole: Role;
    selectedCtx: any;
    idString: string;
    isNewGrant: boolean = false;
    // token: string;
    isLoggedIn: boolean;
    loginSubscription: Subscription;
    tokenSubscription: Subscription;

    constructor(private grantsService: GrantsService,
        private rolesService: RolesService,
        private messageService: MessagesService,
        private loginService: AuthenticationService,
        private elasticService: Elastic4usersService) {

    }

    ngOnInit() {
        this.loginSubscription = this.loginService.isLoggedIn$.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn
        });
        this.tokenSubscription = this.loginService.token$.subscribe(token => {
            this.token = token
            console.log("do i get the token ? " + this.token)
        });
        if (this.token != null) {
            //this.getAllGrants(this.token);
            this.getNewGrantSelect();
        }
    }

    ngOnDestroy() {
        this.loginSubscription.unsubscribe();
        this.tokenSubscription.unsubscribe();
    }

    getAllGrants(token) {
        this.grantsService.listAllGrants(token)
            .subscribe(
            data => {
                this.grants = data;
                this.grants.map(g => {
                    if (g.targetId.startsWith("vm44")) {
                        let id = g.targetId.substring(g.targetId.lastIndexOf("/") + 1);
                        this.elasticService.getContextName(id, (s) => g.targetId = s)
                    }
                });
                this.grants.sort((a, b) => {
                    if (a.targetId < b.targetId) return -1;
                    else if (a.targetId > b.targetId) return 1;
                    else return 0;
                });
            },
            error => {
                this.messageService.error(error);
            });
    }

    getName4Ctx(ctxId: string) {
        let id = ctxId.substring(ctxId.lastIndexOf("/") + 1);
        console.log("ctx id passed to elastic " + id);
        this.elasticService.getContextName(id, (s) => this.selectedGrant.targetId = s);
    }

    onSelect(grant: Grant) {
        this.selectedGrant = grant;
        let id = grant.targetId.substring(grant.targetId.lastIndexOf("/") + 1);
        console.log("ctx id passed to elastic " + id);
        let result = this.elasticService.getContextName(id, (s) => this.selectedGrant.targetId = s);
    }

    getNewGrantSelect() {
        this.isNewGrant = true;
        this.rolesService.listAllRoles(this.token)
            .subscribe(
            data => {
                this.roles = data;
                this.roles.sort((a, b) => {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            });
            },
            error => {
                this.messageService.error(error);
            }
            );
        this.elasticService.listAllContextNames((contexts) => {
            this.ctxs = contexts;
            /*
            this.ctxs.sort((a, b) => {
                if (a < b) return -1;
                else if (a > b) return 1;
                else return 0;
            });
            */
        });

    }

    onChangeRole(val) {
        this.selectedRole = val;
        console.log("selected role: " + this.selectedRole.name);
    }

    onChangeCtx(val) {
        this.selectedCtx = val;
        console.log("selected ctx: " + val);
        console.log("displayed ctx: " + val.name);
    }

    addNewGrant() {
        let grant2add = new Grant();
        grant2add.role = this.selectedRole;
        grant2add.targetType = "CONTEXT";
        let id: string = this.selectedCtx.reference.objectId;
        console.log('setting id ' + id);
        grant2add.targetId = id;
        this.grantsService.postGrant(grant2add, this.token)
            .subscribe(
            data => {
                this.getAllGrants(this.token);
                this.messageService.success('added grant ' + data);
                // this.grants.push(grant2add);
                this.selectedUser.grants.push(grant2add);

            },
            error => {
                this.messageService.error(error);
            }
            );
    }

    addExistingOrCreate() {
        let rolename = this.selectedRole.name;
        let ctx_id = this.selectedCtx.reference.objectId;
        this.grantsService.getExistingOrCreate(rolename, ctx_id, this.token)
        .subscribe(
            data => {
                this.messageService.success('added grant ' + data);
                this.selectedUser.grants.push(data);
            },
            error => {
                this.messageService.error(error);
            }
        );
    }

    deleteGrant(grant) {
        this.selectedGrant = grant;
        this.grantsService.delete(this.selectedGrant, this.token)
            .subscribe(
            data => {
                this.messageService.success('deleted grant ' + data);
            },
            error => {
                this.messageService.error(error);
            }
            );
        let index = this.grants.indexOf(grant);
        this.grants.splice(index, 1);
    }
}

