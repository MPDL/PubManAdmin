import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Client, SearchResponse, GetResponse } from 'elasticsearch';
import { props } from '../common/admintool.properties';
import { MessagesService } from '../services/messages.service';


@Injectable()
export class ElasticService {

  public client: Client;
  public uri: string;

  constructor(public messages: MessagesService) {
    this.uri = props.elastic_http_url;
    if (!this.client) {
      this.connect();
    }
  }

  private connect() {
    this.client = new Client({
      host: this.uri,
      log: ["error", "warning"],
      apiVersion: "5.0"
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
      })
  }


}
