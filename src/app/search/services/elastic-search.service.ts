import { Injectable } from '@angular/core';

import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class ElasticSearchService extends ElasticService {

    constructor(public message: MessagesService) {
        super(message);
    }

    bucketAggregation(index, body, nested, callback): any {
        return this.client.search({
            index: index,
            body: body
        }, (err, res) => {
            if (err) {
                this.message.error(err);
            } else {
                let buckets = Array<any>();
                if (nested) {
                    res.aggregations.name1.name2.buckets.forEach((bucket) => {
                        buckets.push(bucket);
                    });
                } else {
                    res.aggregations.name1.buckets.forEach((bucket) => {
                        buckets.push(bucket);
                    });
                }
                callback(buckets);
            }
        });
    }

    genreAggregation(callback): any {
        return this.client.search({
            index: "db_items",
            body: '{"size":0, "aggs" : { "genres" : { "terms" : { "field" : "metadata.genre", "size" : 10, "order" : { "_count" : "desc" }}}}}'
        }, (err, res) => {
            if (err) {
                this.message.error(err);
            } else {
                let genres = Array<any>();
                res.aggregations.genres.buckets.forEach((genre) => {
                    genres.push(genre);
                });
                callback(genres);
            }
        });
    }
}
