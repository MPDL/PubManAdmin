import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from 'elasticsearch';

import { MessagesService } from '../../base/services/messages.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ElasticService {

  client: Client;

  constructor(private message: MessagesService,
    private http: HttpClient) {
    if (!this.client) {
      this.connect();
    }
  }

  private connect() {
    const url = environment.elastic_url;
    this.client = new Client({
      host: url,
      log: ['error', 'warning']
    });
  }

  public connect2(url) {
    this.client = new Client({
      host: url,
      log: ['error', 'warning']
    });
  }

  public remoteClient(url): Client {
    let rc = new Client({
      host: url,
      log: ['error', 'warning']
    });
    return rc;
  } 

  info_api() {
    return this.client.info({});
  }

  listAllIndices() {
    return this.client.cat.indices({ format: 'json' });
  }

  listRemoteIndices(host) {
    return this.remoteClient(host).cat.indices({ format: 'json' });
  }

  listAliases() {
    return this.client.indices.getAlias({});
  }

  create(name, body) {
    return this.client.indices.create({
      index: name,
      body: body
    });
  }

  getIndex(name) {
    return this.client.indices.get({
      index: name
    });
  }

  delete(name) {
    return this.client.indices.delete({
      index: name
    });
  }

  getAliases4Index(index: string) {
    return this.client.indices.getAlias({
      index: index
    });
  }

  getMapping4Index(index: string) {
    return this.client.indices.getMapping({
      index: index
    });
  }

  getRemoteMapping4Index(host: string, index: string) {
    return this.remoteClient(host).indices.getMapping({
      index: index
    });
  }

  putMapping2Index(index: string, type: string, mapping: object) {
    return this.client.indices.putMapping({
      index: index,
      type: type,
      body: mapping
    });
  }

  getSettings4Index(index: string) {
    return this.client.indices.getSettings({
      index: index
    });
  }

  getRemoteSettings4Index(host: string, index: string) {
    return this.remoteClient(host).indices.getSettings({
      index: index
    });
  }

  addAlias(index, alias) {
    return this.client.indices.putAlias({
      index: index,
      name: alias
    });
  }

  removeAlias(index, alias) {
    return this.client.indices.deleteAlias({
      index: index,
      name: alias
    });
  }

  openIndex(name) {
    return this.client.indices.open({
      index: name
    });
  }

  closeIndex(name) {
    return this.client.indices.close({
      index: name
    });
  }
}
