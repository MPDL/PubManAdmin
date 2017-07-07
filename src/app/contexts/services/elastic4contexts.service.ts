import { Injectable } from '@angular/core';
import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class Elastic4contextsService extends ElasticService {

  constructor(public message: MessagesService) { super(message) }

  contexts4auto(term, callback) {
        let contexts = Array<any>();
        if (term) {
            this.client.search({
                index: "db_contexts_new",
                q: "name.auto:" + term,
                sort: "name.sorted:asc"
            }, (error, response) => {
                if (error) {
                    this.message.error(error);
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
}
