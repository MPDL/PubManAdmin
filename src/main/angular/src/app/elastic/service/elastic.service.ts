import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from 'elasticsearch';

import { MessagesService } from '../../base/services/messages.service';
import { ConnectionService } from '../../base/services/connection.service';
import { environment } from 'environments/environment';

@Injectable()
export class ElasticService {

  client: Client;
  url: string;

  constructor(private message: MessagesService,
    private conn: ConnectionService) {
    if (!this.client) {
      this.conn.conn.subscribe(name => {
        this.url = name + environment.elastic_url;
        this.connect(this.url);
      });
    }
  }

  private connect(url) {
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

  scroll() {
    const docs = [];
    const queue = [];
    this.client.search({
      index: 'ous',
      scroll: '30s',
      q: 'parentAffiliation.objectId:ou_persistent13'
    }, async (err, resp) => {
      
        queue.push(resp);
        while (queue.length) {
          const response = queue.shift();
          response.hits.hits.forEach(hit => docs.push(hit));
          if (response.hits.total === docs.length) {
            return Promise.resolve(docs);
          }
          queue.push(
          await this.client.scroll({
            scrollId: response._scroll_id,
            scroll: '30s'
          }));
        }
    });
    //return Promise.resolve(docs);
  }

  scrollwithcallback(url, index, term, callback): any {
    let ms = this.message;
    let hitList = Array<any>();
    let ec: Client;
    if (url != null) {
      ec = this.remoteClient(url);
    } else {
      ec = this.client;
    }
    ec.search({
      index: index,
      scroll: '30s',
      body: term
    }, function scrolling(error, response) {
      if (error) {
        ms.error(error);
      }
      response.hits.hits.forEach(function (hit) {
        hitList.push(hit);
      });
      if (response.hits.total > hitList.length) {
        ec.scroll({
          scrollId: response._scroll_id,
          scroll: '30s'
        }, scrolling);
      } else {
        callback(hitList);
      }
    });
  }

  bulkIndex(body) {
    return this.client.bulk({
      body: body
    });
  }

  reindex(body) {
    return this.client.reindex({
      body: body
    });
  }
}
