import {Injectable} from '@angular/core';
import {Client} from 'elasticsearch';
import {environment} from 'environments/environment';
import {ConnectionService} from '../../base/services/connection.service';

@Injectable()
export class ElasticService {
  client: Client;
  uri: string;

  constructor(
    protected connectionService: ConnectionService,
  ) {
    if (!this.client) {
      this.connectionService.connectionService.subscribe((data:string) => {
        this.uri = data + environment.elasticUrl;
        this.connect(this.uri);
      });
    }
  }

  private connect(uri: string) {
    this.client = new Client({
      host: uri,
      log: ['error', 'warning'],
    });
  }

  /*
  count(index: string, callback: (arg0: number) => void): any {
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
  */

  /*
  listOuNames(parent: string, id: string, callback: (arg0: any[]) => void): any {
    let queryString: string;
    if (parent.match('parent')) {
      queryString = 'parentAffiliation.objectId:*' + id + ' AND publicStatus:OPENED';
    } else if (parent.match('predecessor')) {
      queryString = 'objectId:*' + id;
    }

    if (queryString.length > 0) {
      return this.client.search({
        index: environment.ouIndex.name,
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
  */
}
