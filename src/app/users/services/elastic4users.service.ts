import { Injectable } from '@angular/core';
import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class Elastic4usersService extends ElasticService {

  constructor(messages: MessagesService) { super(messages) }

  getContextName(ctxId, callback): any {
    if (ctxId) {

      return this.client.search({
        index: props.ctx_index_name,
        q: `_id:${ctxId}`,
        _sourceInclude: 'name'
      },
        (error, response) => {
          if (error) {
            this.messages.error(error);
          }
          if (response) {
            const hitList = [];
            response.hits.hits.forEach(hit => hitList.push(hit._source));
            const result = JSON.stringify(hitList);
            const name = JSON.parse(result);
            callback(name[0].name);
          }
        });

    } else {
      this.messages.error('missing id');
    }
  }

  listAllContextNames(callback): any {
    return this.client.search({
      index: props.ctx_index_name,
      q: 'state:OPENED',
      _sourceInclude: 'name, objectId',
      size: 500,
      sort: 'name.keyword:asc'
    },
      (error, response) => {
        if (error) {
          this.messages.error(error);
        }
        if (response) {
          const hitList = Array<any>();
          response.hits.hits.forEach((hit) => {
            const source = JSON.stringify(hit._source);
            const json = JSON.parse(source);
            hitList.push(json);
          });
          callback(hitList)
        }
      });
  }

  getOUName(ouId, callback): any {
    if (ouId) {

      return this.client.search({
        index: props.ou_index_name,
        q: `_id:${ouId}`,
        _sourceInclude: 'metadata.name'
      },
        (error, response) => {
          if (error) {
            this.messages.error(error)
          }
          if (response) {
            const hitList = [];
            response.hits.hits.forEach(hit => hitList.push(hit._source));
            const result = JSON.stringify(hitList);
            const name = JSON.parse(result);
            callback(name[0].metadata.name);
          }
        })

    } else {
      this.messages.error('missing id');
    }
  }

  users4auto(term, callback) {
        const users = Array<any>();
        if (term) {
            this.client.search({
                index: props.user_index_name,
                q: 'name.auto:' + term,
                sort: 'name.keyword:asc'
            }, (error, response) => {
                if (error) {
                    this.messages.error(error);
                } else {
                    response.hits.hits.forEach(hit => {
                        const username = JSON.parse(JSON.stringify(hit._source));
                        users.push(username);
                    });
                    callback(users);
                }
            });
        }
    }
}
