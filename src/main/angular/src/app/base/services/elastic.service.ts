import {Injectable} from '@angular/core';
import {Client} from 'elasticsearch';
import {environment} from 'environments/environment';
import {MessagesService} from './messages.service';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class ElasticService {
  client: Client;
  uri: string;

  constructor(
    protected messagesService: MessagesService,
    protected connectionService: ConnectionService
  ) {
    if (!this.client) {
      this.connectionService.connectionService.subscribe((uri) => {
        this.uri = uri + environment.elastic_url;
        this.connect(this.uri);
      });
    }
  }

  private connect(uri) {
    this.client = new Client({
      host: uri,
      log: ['error', 'warning'],
    });
  }

  count(index: string, callback): any {
    return this.client.search({
      index: index,
      size: 0,
    },
    (error, response) => {
      if (error) {
        this.messagesService.error(error);
      }
      if (response) {
        callback(response.hits.total);
      }
    });
  }

  listOuNames(parent: string, id: string, callback): any {
    let queryString: string;
    if (parent.match('parent')) {
      queryString = 'parentAffiliation.objectId:*' + id + ' AND publicStatus:OPENED';
    } else if (parent.match('predecessor')) {
      queryString = 'objectId:*' + id;
    }

    if (queryString.length > 0) {
      return this.client.search({
        index: environment.ou_index.name,
        // q: 'parentAffiliation.objectId:*' + parent,
        q: queryString,
        _sourceInclude: 'objectId, metadata.name, hasChildren, publicStatus',
        size: 100,
        sort: 'metadata.name.keyword:asc',
      },
      (error, response) => {
        if (error) {
          this.messagesService.error(error);
        }
        if (response) {
          const hitList = [];
          response.hits.hits.forEach((hit) => {
            const source = JSON.stringify(hit._source);
            const json = JSON.parse(source);
            hitList.push(json);
          });
          callback(hitList);
        }
      });
    }
  }
}
