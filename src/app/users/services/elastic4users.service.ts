import { Injectable } from '@angular/core';
import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class Elastic4usersService extends ElasticService {

  constructor(public message: MessagesService) { super(message) }

  getContextName(ctxId, callback): any {
    if (ctxId) {

      return this.client.search({
        index: 'db_contexts',
        q: `_id:${ctxId}`,
        _sourceInclude: 'name'
      },
        (error, response) => {
          if (error) {
            this.message.error(error);
          }
          if (response) {
            let hitList = [];
            response.hits.hits.forEach(hit => hitList.push(hit._source));
            let result = JSON.stringify(hitList);
            let name = JSON.parse(result);
            callback(name[0].name);
          }
        });

    } else {
      this.message.error("missing id");
    }
  }

  listAllContextNames(callback): any {
    return this.client.search({
      index: "db_contexts",
      q: "*",
      _sourceInclude: "name, reference.objectId",
      size: 500,
      sort: 'name.sorted:asc'
    },
      (error, response) => {
        if (error) {
          this.message.error(error);
        }
        if (response) {
          let hitList = Array<any>();
          response.hits.hits.forEach((hit) => {
            let source = JSON.stringify(hit._source);
            let json = JSON.parse(source);
            hitList.push(json);
          });
          callback(hitList)
        }
      });
  }

  getOUName(ouId, callback): any {
    if (ouId) {

      return this.client.search({
        index: 'db_ous',
        q: `_id:${ouId}`,
        _sourceInclude: 'defaultMetadata.name'
      },
        (error, response) => {
          if (error) {
            this.message.error(error)
          }
          if (response) {
            let hitList = [];
            response.hits.hits.forEach(hit => hitList.push(hit._source));
            let result = JSON.stringify(hitList);
            let name = JSON.parse(result);
            callback(name[0].defaultMetadata.name);
          }
        })

    } else {
      this.message.error("missing id");
    }
  }

  listOuNames(parent: string, id: string, callback): any {
    let queryString: string;
    if (parent.match("parent")) {
      queryString = "parentAffiliations.objectId:*" + id;
    } else if (parent.match("predecessor")) {
      queryString = "reference.objectId:*" + id;
    }

    if (queryString.length > 0) {
      return this.client.search({
        index: "db_ous",
        // q: "parentAffiliations.objectId:*" + parent,
        q: queryString,
        _sourceInclude: "reference.objectId, defaultMetadata.name, hasChildren, publicStatus",
        size: 100,
        sort: 'defaultMetadata.name.sorted:asc'
      },
        (error, response) => {
          if (error) {
            this.message.error(error);
          }
          if (response) {
            let hitList = Array<any>();
            response.hits.hits.forEach((hit) => {
              let source = JSON.stringify(hit._source);
              let json = JSON.parse(source);
              hitList.push(json);
            });
            callback(hitList)
          }
        });
    }
  }

  users4auto(term, callback) {
        let users = Array<any>();
        if (term) {
            this.client.search({
                index: "db_users",
                q: "name.auto:" + term,
                sort: "name.sorted:asc"
            }, (error, response) => {
                if (error) {
                    this.message.error(error);
                } else {
                    response.hits.hits.forEach(hit => {
                        let username = JSON.parse(JSON.stringify(hit._source));
                        users.push(username);
                    });
                    callback(users);
                }
            });
        }
    }
}
