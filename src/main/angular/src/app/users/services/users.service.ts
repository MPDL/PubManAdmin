import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MessagesService} from 'app/base/services/messages.service';
import {ContextsService} from 'app/contexts/services/contexts.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {Ctx, Grant, Ou, User} from '../../base/common/model/inge';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class UsersService extends PubmanRestService {
  ctxsPath: string = environment.restCtxs;
  ousPath: string = environment.restOus;
  usersPath: string = environment.restUsers;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
  ) {
    super(connectionService, httpClient);
  }

  activate(user: User, token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/activate';
    const body = user.lastModificationDate;
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  deactivate(user: User, token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/deactivate';
    const body = user.lastModificationDate;
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  addGrants(user: User, grants: Grant[], token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/add';
    const body = JSON.stringify(grants);
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  removeGrants(user: User, grants: Grant[], token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/remove';
    const body = JSON.stringify(grants);
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  changePassword(user: User, token: string): Observable<User> {
    const path = this.usersPath + '/' + user.objectId + '/password';
    const body = user.password;
    const headers = this.addHeaders(token, true);

    return this.getResource('PUT', path, headers, body);
  }

  generateRandomPassword(token: string): Observable<string> {
    const path = this.usersPath + '/generateRandomPassword';
    const headers = this.addHeaders(token, true);

    return this.getStringResource('GET', path, headers);
  }

  addAdditionalPropertiesOfGrantRefs(grant: Grant) {
    const ref = grant.objectRef;
    if (ref === undefined) {
    } else {
      if (ref.startsWith('ou')) {
        this.organizationsService.get(this.ousPath, ref, null)
          .subscribe({
            next: (data: Ou) => {
              grant.objectName = data.name;
              grant.objectStatus = data.publicStatus;
            },
            error: (e) => this.messagesService.error(e),
          });
      } else {
        if (ref.startsWith('ctx')) {
          this.contextsService.get(this.ctxsPath, ref, null)
            .subscribe({
              next: (data: Ctx) => {
                grant.objectName = data.name;
                grant.objectStatus = data.state;
              },
              error: (e) => this.messagesService.error(e),
            });
        }
      }
    }
  }

  addOuPathOfGrantRefs(grant: Grant) {
    const ref = grant.objectRef;
    if (ref === undefined) {
    } else {
      if (ref.startsWith('ou')) {
        this.organizationsService.get(this.ousPath, grant.objectRef, null)
          .subscribe({
            next: (data: Ou) => grant.parentName = data.parentAffiliation.name,
            error: (e) => this.messagesService.error(e),
          });
      } else {
        if (ref.startsWith('ctx')) {
          this.contextsService.get(this.ctxsPath, ref, null)
            .subscribe({
              next: (data: Ctx) => {
                this.organizationsService.getOuPath(data.responsibleAffiliations[0].objectId, null)
                  .subscribe({
                    next: (data: string) => grant.parentName = data,
                    error: (e) => this.messagesService.error(e),
                  });
              },
              error: (e) => this.messagesService.error(e),
            });
        }
      }
    }
  }
}
