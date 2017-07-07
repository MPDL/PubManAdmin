import { Injectable } from '@angular/core';

import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class Elastic4ousService extends ElasticService {

  constructor(public messages: MessagesService) { super(messages) }

  ous4auto(term, callback) {
        let contexts = Array<any>();
        if (term) {
            this.client.search({
                index: "db_ous_new",
                q: "defaultMetadata.name.auto:" + term,
                sort: "defaultMetadata.name.sorted:asc"
            }, (error, response) => {
                if (error) {
                    this.messages.error(error);
                } else {
                    response.hits.hits.forEach(hit => {
                        let ctxname = JSON.parse(JSON.stringify(hit._source));
                        contexts.push(ctxname);
                    });
                    callback(contexts);
                }
            });
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
        index: "ous",
        // q: "parentAffiliations.objectId:*" + parent,
        q: queryString,
        _sourceInclude: "reference.objectId, defaultMetadata.name, hasChildren, publicStatus",
        size: 100,
        sort: 'defaultMetadata.name.sorted:asc'
      },
        (error, response) => {
          if (error) {
            this.messages.error(error);
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

  searchOu(id, callback): any {
    return this.client.search({
      index: 'ous',
      q: `reference.objectId:*${id}`,
    }, (error, response) => {
      if (error) {
        this.messages.error(error)
      }
      if (response) {
        let hitList = Array<any>();
        response.hits.hits.forEach((hit) => {
          let source = JSON.stringify(hit._source);
          let json = JSON.parse(source);
          hitList.push(json);
        })
        callback(hitList)
      }
    })
  }

  updateOu(ou) {
    this.client.index({
      index: "ous",
      type: "organization",
      id: ou.reference.objectId,
      body: ou
    }, (error, response) => {
      if (error) {
        this.messages.error(error);
      } else {
        // this.message.success(JSON.stringify(response, null, 4));
        this.messages.success(response.result);
      }
    });
  }
}
