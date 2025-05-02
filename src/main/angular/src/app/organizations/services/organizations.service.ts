import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BasicRO, Ou, OuMetadata} from 'app/base/common/model/inge';
import {MessagesService} from 'app/base/services/messages.service';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService extends PubmanRestService {
  ousPath: string = environment.restOus;
  ous: Ou[];

  constructor(
    protected messagesService: MessagesService,
    protected httpClient: HttpClient,
  ) {
    super(httpClient);
  }

  getallChildOus(parentAffiliationIds: string[], ignoreOuId: string): Observable<Ou[]> {
    const path = this.ousPath + '/allchildren/' + ignoreOuId;
    const headers = this.addHeaders(false);
    const body = parentAffiliationIds;

    return this.getResource('POST', path, headers, body);
  }

  getTopLevelOus(): Observable<Ou[]> {
    const path = this.ousPath + '/toplevel';
    const headers = this.addHeaders(false);

    return this.getResource('GET', path, headers, null);
  }

  getFirstLevelOus(): Observable<Ou[]> {
    const path = this.ousPath + '/firstlevel';
    const headers = this.addHeaders(false);

    return this.getResource('GET', path, headers, null);
  }

  listChildren4Ou(id: string): Observable<Ou[]> {
    const path = this.ousPath + '/' + id + '/children';
    const headers = this.addHeaders(false);

    return this.getResource('GET', path, headers, null);
  }

  getIdPath(id: string): Observable<string> {
    const path = this.ousPath + '/' + id + '/idPath';
    const headers = this.addHeaders(false);

    return this.getStringResource('GET', path, headers);
  }

  getOuPath(id: string): Observable<string> {
    const path = this.ousPath + '/' + id + '/ouPath';
    const headers = this.addHeaders(false);

    return this.getStringResource('GET', path, headers);
  }

  openOu(ou: Ou): Observable<Ou> {
    const path = this.ousPath + '/' + ou.objectId + '/open';
    const headers = this.addHeaders(true);
    const body = ou.lastModificationDate;

    return this.getResource('PUT', path, headers, body);
  }

  closeOu(ou: Ou): Observable<Ou> {
    const path = this.ousPath + '/' + ou.objectId + '/close';
    const headers = this.addHeaders(true);
    const body = ou.lastModificationDate;

    return this.getResource('PUT', path, headers, body);
  }

  makeAffiliation(id: string, name: string): BasicRO {
    const aff = new BasicRO();
    aff.objectId = id;
    aff.name = name;

    return aff;
  }

  makeMetadata(name: string): OuMetadata {
    const meta = new OuMetadata();
    meta.name = name;

    return meta;
  }

  removePredecessor(ou: Ou, predecessorId: string): Observable<Ou> {
    const path = this.ousPath + '/' + ou.objectId + '/remove/' + predecessorId;
    const headers = this.addHeaders(true);
    const body = ou.lastModificationDate;

    return this.getResource('PUT', path, headers, body);
  }

  addPredecessor(ou: Ou, predecessorId: string): Observable<Ou> {
    const path = this.ousPath + '/' + ou.objectId + '/add/' + predecessorId;
    const headers = this.addHeaders(true);
    const body = ou.lastModificationDate;

    return this.getResource('PUT', path, headers, body);
  }
}
