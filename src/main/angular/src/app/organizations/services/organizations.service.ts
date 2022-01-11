
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BasicRO, Ou, OuMetadata} from 'app/base/common/model/inge';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';
import {ConnectionService} from '../../base/services/connection.service';
import {PubmanRestService} from '../../base/services/pubman-rest.service';

@Injectable()
export class OrganizationsService extends PubmanRestService {
  ousUrl:string = environment.restOus;

  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
  ) {
    super(connectionService, httpClient);
  }

  getTopLevelOus(token: string): Observable<Ou[]> {
    const url = this.ousUrl + '/toplevel';
    const headers = this.addHeaders(token, false);
    return this.getResource('GET', url, headers, null);
  }

  getFirstLevelOus(token: string): Observable<Ou[]> {
    const url = this.ousUrl + '/firstlevel';
    const headers = this.addHeaders(token, false);
    return this.getResource('GET', url, headers, null);
  }

  listChildren4Ou(id: string, token: string): Observable<Ou[]> {
    const url = this.ousUrl + '/' + id + '/children';
    const headers = this.addHeaders(token, false);
    return this.getResource('GET', url, headers, null);
  }

  getOuPath(id: string, token: string): Observable<string> {
    const url = this.ousUrl + '/' + id + '/ouPath';
    const headers = this.addHeaders(token, false);
    return this.getStringResource('GET', url, headers);
  }

  openOu(ou: Ou, token: string): Observable<Ou> {
    const url = this.ousUrl + '/' + ou.objectId + '/open';
    const headers = this.addHeaders(token, true);
    const body = ou.lastModificationDate;
    return this.getResource('PUT', url, headers, body);
  }

  closeOu(ou: Ou, token: string): Observable<Ou> {
    const url = this.ousUrl + '/' + ou.objectId + '/close';
    const headers = this.addHeaders(token, true);
    const body = ou.lastModificationDate;
    return this.getResource('PUT', url, headers, body);
  }

  makeAffiliation(id: string): BasicRO {
    const aff = new BasicRO();
    aff.objectId = id;
    return aff;
  }

  makeMetadata(name: string): OuMetadata {
    const meta = new OuMetadata();
    meta.name = name;
    return meta;
  }
}
