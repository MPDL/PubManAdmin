import {Injectable} from '@angular/core';
import {Client} from 'elasticsearch';
import {environment} from 'environments/environment';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class ElasticService {
  client: Client;
  url: string;

  constructor(
    private connectionService: ConnectionService,
  ) {
    if (!this.client) {
      this.connectionService.connectionService$.subscribe((data: string) => {
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

  info_api() {
    return this.client.info({});
  }

  listAllIndices() {
    return this.client.cat.indices({format: 'json'});
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

  scroll(index: any, term: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const docs = [];
      const queue = [];
      this.client.search({
        index: index,
        scroll: '30s',
        body: term,
      }, async (err, resp) => {
        if (err) {
          reject(err);
        }
        queue.push(resp);
        while (queue.length) {
          const response = queue.shift();
          response.hits.hits.forEach((hit: any) => docs.push(hit));
          if (response.hits.total === docs.length) {
            resolve(docs);
          }
          queue.push(
            await this.client.scroll({
              scrollId: response._scroll_id,
              scroll: '30s',
            }));
        }
      });
    });
  }
}
