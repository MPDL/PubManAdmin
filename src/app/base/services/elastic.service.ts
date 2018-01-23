import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Client, SearchResponse, GetResponse } from 'elasticsearch';
import { props } from '../common/admintool.properties';
import { MessagesService } from '../services/messages.service';


@Injectable()
export class ElasticService {

  public client: Client;
  public uri: string;

  constructor(protected messages: MessagesService) {
    this.uri = props.elastic_http_url;
    if (!this.client) {
      this.connect();
    }
  }

  private connect() {
    this.client = new Client({
      host: this.uri,
      log: ["error", "warning"]
    });
  }

  count(index: string, callback): any {
    return this.client.search({
      index: index,
      size: 0
    },
      (error, response) => {
        if (error) {
          this.messages.error(error);
        }
        if (response) {
          callback(response.hits.total);
        }
      });
  }

  listOuNames(parent: string, id: string, callback): any {
    let queryString: string;
    if (parent.match("parent")) {
      queryString = "parentAffiliation.objectId:*" + id + " AND publicStatus:OPENED";
    } else if (parent.match("predecessor")) {
      queryString = "objectId:*" + id;
    }

    if (queryString.length > 0) {
      return this.client.search({
        index: props.ou_index_name,
        // q: "parentAffiliation.objectId:*" + parent,
        q: queryString,
        _sourceInclude: "objectId, metadata.name, hasChildren, publicStatus",
        size: 100,
        sort: 'metadata.name.keyword:asc'
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


}
