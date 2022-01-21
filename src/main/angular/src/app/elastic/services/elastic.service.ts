import {Injectable} from '@angular/core';
import {Client} from 'elasticsearch';
import {environment} from 'environments/environment';
import {ConnectionService} from '../../base/services/connection.service';
import {MessagesService} from '../../base/services/messages.service';

@Injectable()
export class ElasticService {
  client: Client;
  url: string;

  constructor(
    private connectionService: ConnectionService,
    private messagesService: MessagesService,
  ) {
    if (!this.client) {
      this.connectionService.connectionService.subscribe((data: string) => {
        this.url = data + environment.elasticUrl;
        this.connect(this.url);
      });
    }
  }

  private connect(url: string) {
    this.client = new Client({
      host: url,
      log: ['error', 'warning'],
    });
  }

  connect2(url: string) {
    this.client = new Client({
      host: url,
      log: ['error', 'warning'],
    });
  }

  private remoteClient(url: string): Client {
    const rc = new Client({
      host: url,
      log: ['error', 'warning'],
    });
    return rc;
  }

  info_api() {
    return this.client.info({});
  }

  listAllIndices() {
    return this.client.cat.indices({format: 'json'});
  }

  listRemoteIndices(host: string) {
    return this.remoteClient(host).cat.indices({format: 'json'});
  }

  listAliases() {
    return this.client.indices.getAlias({});
  }

  createIndex(name: string, body: {}) {
    return this.client.indices.create({
      index: name,
      body: body,
    });
  }

  getIndex(name: string) {
    return this.client.indices.get({
      index: name,
    });
  }

  deleteIndex(name: string) {
    return this.client.indices.delete({
      index: name,
    });
  }

  getAliases4Index(index: string) {
    return this.client.indices.getAlias({
      index: index,
    });
  }

  getMapping4Index(index: string) {
    return this.client.indices.getMapping({
      index: index,
    });
  }

  getRemoteMapping4Index(host: string, index: string) {
    return this.remoteClient(host).indices.getMapping({
      index: index,
    });
  }

  putMapping2Index(index: string, type: string, mapping: object) {
    return this.client.indices.putMapping({
      index: index,
      type: type,
      body: mapping,
    });
  }

  getSettings4Index(index: string) {
    return this.client.indices.getSettings({
      index: index,
    });
  }

  getRemoteSettings4Index(host: string, index: string) {
    return this.remoteClient(host).indices.getSettings({
      index: index,
    });
  }

  addAlias(index: string, alias: string) {
    return this.client.indices.putAlias({
      index: index,
      name: alias,
    });
  }

  removeAlias(index: string, alias: string) {
    return this.client.indices.deleteAlias({
      index: index,
      name: alias,
    });
  }

  openIndex(name: string) {
    return this.client.indices.open({
      index: name,
    });
  }

  closeIndex(name: string) {
    return this.client.indices.close({
      index: name,
    });
  }

  private scroll() {
    const docs = [];
    const queue = [];
    this.client.search({
      index: 'ous',
      scroll: '30s',
      q: 'parentAffiliation.objectId:ou_persistent13',
    }, async (err, resp) => {
      queue.push(resp);
      while (queue.length) {
        const response = queue.shift();
        response.hits.hits.forEach(
          (hit: any) => docs.push(hit)
        );
        if (response.hits.total === docs.length) {
          return Promise.resolve(docs);
        }
        queue.push(
          await this.client.scroll({
            scrollId: response._scroll_id,
            scroll: '30s',
          }));
      }
    });
  }

  scrollwithcallback(url: string, index: any, term: object, callback) {
    const ms = this.messagesService;
    const hitList = [];
    let client: Client;
    if (url != null && url.length > 0) {
      client = this.remoteClient(url);
    } else {
      client = this.client;
    }
    client.search({
      index: index,
      scroll: '30s',
      body: term,
    }, function scrolling(error, response) {
      if (error) {
        ms.error(error);
      }
      response.hits.hits.forEach(function(hit) {
        hitList.push(hit);
      });
      if (response.hits.total > hitList.length) {
        client.scroll({
          scrollId: response._scroll_id,
          scroll: '30s',
        }, scrolling);
      } else {
        callback(hitList);
      }
    });
  }

  bulkIndex(body: any[]) {
    return this.client.bulk({
      body: body,
    });
  }

  reindex(body: { source: { index: any; }; dest: { index: any; }; }) {
    return this.client.reindex({
      body: body,
    });
  }
}
