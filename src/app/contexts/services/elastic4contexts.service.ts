import { Injectable } from '@angular/core';
import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class Elastic4contextsService extends ElasticService {

  constructor(messages: MessagesService) { super(messages) }

  contexts4auto(term, callback) {
        const contexts = Array<any>();
        if (term) {
            this.client.search({
                index: props.ctx_index_name,
                q: 'name.auto:' + term,
                sort: 'name.keyword:asc',
                size: 25
            }, (error, response) => {
                if (error) {
                    this.messages.error(error);
                } else {
                    response.hits.hits.forEach(hit => {
                        const ctxname = JSON.parse(JSON.stringify(hit._source));
                        contexts.push(ctxname);
                    });
                    callback(contexts);
                }
            });
        }
    }
}
